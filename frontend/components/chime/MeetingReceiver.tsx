import { useEffect, useState } from 'react';
import { DeviceLabels, useMeetingManager, lightTheme } from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { ThemeProvider } from 'styled-components';
import { API } from 'aws-amplify';
import { Button, Stack } from '@mui/material';
import { useChimeMeetingState } from './context';
import { MeetingInvitation, useJoinMeetingMutation } from '../../graphql/generated';

type Props = {
  myId: string;
};

const MeetingReceiver = (props: Props) => {
  const [_, joinMeeting] = useJoinMeetingMutation();
  const [invitations, setInvitations] = useState<{
    [key: string]: MeetingInvitation;
  }>({});
  const { state, setState } = useChimeMeetingState();

  let subscription: any;
  const { myId } = props;
  const meetingManager = useMeetingManager();

  useEffect(() => {
    beginSubscription();
    return () => {
      if (subscription) {
        // Unsubscribe on unmounting this component
        subscription.unsubscribe();
      }
    };
  }, [myId]);

  const onReceiveCall = async (invitation: MeetingInvitation) => {
    const response = await joinMeeting({
      meetingResponse: invitation.meetingResponse,
    });
    const meeting = response.data?.joinMeeting;
    if (meeting == null) {
      console.error('failed to join a meeting');
      return;
    }

    await startMeetingSession(meeting.meetingResponse, meeting.attendeeResponse);
    setInvitations({});
  };

  const beginSubscription = async () => {
    const sub = API.graphql({
      query: `
      subscription InviteSubscription($target: ID!) {
        onMeetingInvited(target: $target) {
          meetingResponse
          target
          source
        }
      }
      `,
      variables: { target: myId },
    });

    if ('subscribe' in sub) {
      subscription = sub.subscribe({
        next: (event: any) => {
          const inv = event.value.data.onMeetingInvited as MeetingInvitation;
          setInvitations((prev) => ({ ...prev, [inv.source]: inv }));
        },
      });
    }
  };

  const startMeetingSession = async (meetingResponse: string, attendeeResponse: string) => {
    const meetingSessionConfiguration = new MeetingSessionConfiguration(
      JSON.parse(meetingResponse),
      JSON.parse(attendeeResponse),
    );

    await meetingManager.join(meetingSessionConfiguration, {
      deviceLabels: DeviceLabels.Audio,
      enableWebAudio: true,
    });

    await meetingManager.start();
    setState({ isOnCall: true, meetingResponse: JSON.parse(meetingResponse) });
  };

  return (
    <ThemeProvider theme={lightTheme}>
      <Stack>
        {Object.entries(invitations).map(([k, v], i) => (
          <Button
            variant="contained"
            disabled={state.isOnCall}
            onClick={() => onReceiveCall(v)}
            key={`receiveCall_${i}`}
          >
            Receive a call from {v.source}
          </Button>
        ))}
      </Stack>
    </ThemeProvider>
  );
};

export default MeetingReceiver;
