import { useState } from 'react';
import Grid from '@mui/material/Grid';
import { DeviceLabels, useMeetingManager, lightTheme } from 'amazon-chime-sdk-component-library-react';
import { MeetingSessionConfiguration } from 'amazon-chime-sdk-js';
import { ThemeProvider } from 'styled-components';
import { Button, Stack, TextField } from '@mui/material';
import { useChimeMeetingState } from './context';
import { useCreateMeetingInvitationMutation, useCreateMeetingMutation } from '../../graphql/generated';

type Props = {
  myId: string;
};

const ChimeMeeting = (props: Props) => {
  const [_, createMeeting] = useCreateMeetingMutation();
  const [__, createMeetingInvitation] = useCreateMeetingInvitationMutation();
  const [targetId, setTargetId] = useState('');
  const [calling, setCalling] = useState(false);
  const { state, setState } = useChimeMeetingState();

  const { myId } = props;
  const meetingManager = useMeetingManager();

  const onTargetIdEdit = (e: any) => setTargetId(e.target.value);
  const onStartCall = async () => {
    setCalling(true);
    const response = await createMeeting();
    const meeting = response.data?.createChimeMeeting;
    if (meeting == null) {
      console.error('failed to create a meeting');
      setCalling(false);
      return;
    }
    await startMeetingSession(meeting.meetingResponse, meeting.attendeeResponse);
    await createMeetingInvitation({
      target: targetId,
      source: myId,
      meetingResponse: meeting.meetingResponse,
    });
    setCalling(false);
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
      <Stack direction="row" spacing={2}>
        <TextField
          label="Target ID"
          placeholder="00000000-0000-0000-0000-000000000000"
          onChange={onTargetIdEdit}
          variant="standard"
          fullWidth
        />
        <Button
          variant="contained"
          disabled={targetId == null || targetId == '' || state.isOnCall || calling}
          onClick={onStartCall}
        >
          Call
        </Button>
      </Stack>
    </ThemeProvider>
  );
};

export default ChimeMeeting;
