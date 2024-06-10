import { v4 } from 'uuid'
import { AppSyncResolverHandler } from 'aws-lambda'
import { Chime } from '@aws-sdk/client-chime'

type EmptyArgument = {}

type JoinMeetingArgument = {
  meetingResponse: string
}

type CreateChimeMeetingResult = {
  attendeeResponse: string
  meetingResponse: string
}

type JoinMeetingResult = {
  attendeeResponse: any
  meetingResponse: string
}

type Result = CreateChimeMeetingResult | JoinMeetingResult
type Argument = EmptyArgument | JoinMeetingArgument

// You must use "us-east-1" as the region for Chime API and set the endpoint.
// https://docs.aws.amazon.com/chime-sdk/latest/dg/configure-sdk-invoke.html
const chime = new Chime({ region: 'us-east-1', endpoint: 'https://service.chime.aws.amazon.com' })

export const handler: AppSyncResolverHandler<Argument, Result> = async (event, context) => {
  console.log(event)
  switch (event.info.fieldName) {
    case 'createChimeMeeting':
      return await createChimeMeeting()
    case 'joinMeeting':
      return await joinMeeting(event.arguments as JoinMeetingArgument)
    default:
      throw new Error('invalid event field!')
  }
}

const createChimeMeeting = async (): Promise<CreateChimeMeetingResult> => {
  const meetingResponse = await chime.createMeeting({
    ClientRequestToken: v4(),
    MediaRegion: 'ap-northeast-1', // Specify the region in which to create the meeting.
  })

  if (meetingResponse?.Meeting?.MeetingId == null) {
    throw Error('empty MeetingId!')
  }

  return await joinMeeting({ meetingResponse: JSON.stringify(meetingResponse) })
}

const joinMeeting = async (request: JoinMeetingArgument): Promise<JoinMeetingResult> => {
  const meeting = JSON.parse(request.meetingResponse)
  const attendeeResponse = await chime.createAttendee({
    MeetingId: meeting.Meeting.MeetingId,
    ExternalUserId: v4(),
  })

  return {
    attendeeResponse: JSON.stringify(attendeeResponse),
    ...request,
  }
}
