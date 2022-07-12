import {
  useMeetingManager,
  lightTheme,
  ControlBar,
  ControlBarButton,
  AudioOutputControl,
  AudioInputControl,
  Phone,
  VoiceFocusProvider,
  useMeetingEvent,
} from 'amazon-chime-sdk-component-library-react'
import { VoiceFocusModelName } from 'amazon-chime-sdk-js'
import { useEffect } from 'react'
import { ThemeProvider } from 'styled-components'
import { useChimeMeetingState } from './context'

const MeetingControl = () => {
  const meetingManager = useMeetingManager()
  const { state, setState } = useChimeMeetingState()
  const meetingResponse = state.meetingResponse
  const meetingEvent = useMeetingEvent()

  useEffect(() => {
    if (meetingEvent == null) return
    console.log(meetingEvent)
    switch (meetingEvent.name) {
      case 'meetingEnded':
        setState({ isOnCall: false })
        break
    }
  }, [meetingEvent])

  const hangUpButtonProps = {
    icon: <Phone />,
    onClick: () => meetingManager.leave(),
    label: 'End',
  }

  // https://aws.github.io/amazon-chime-sdk-component-library-react/?path=/docs/sdk-components-meetingcontrols-audioinputvfcontrol--page
  const voiceFocusName = (name: string): VoiceFocusModelName => {
    if (name && ['default', 'ns_es'].includes(name)) {
      return name as VoiceFocusModelName
    }
    return 'default'
  }

  const getVoiceFocusSpecName = (): VoiceFocusModelName => {
    if (
      meetingResponse &&
      meetingResponse.Meeting?.MeetingFeatures?.Audio?.EchoReduction ===
        'AVAILABLE'
    ) {
      return voiceFocusName('ns_es')
    }
    return voiceFocusName('default')
  }

  const vfConfigValue = {
    spec: { name: getVoiceFocusSpecName() },
    createMeetingResponse: meetingResponse,
  }

  return (
    <VoiceFocusProvider {...vfConfigValue}>
      <ThemeProvider theme={lightTheme}>
        {state.isOnCall ? (
          <ControlBar showLabels layout="undocked-horizontal">
            <AudioInputControl />
            <AudioOutputControl />
            <ControlBarButton {...hangUpButtonProps} />
          </ControlBar>
        ) : (
          <></>
        )}
      </ThemeProvider>
    </VoiceFocusProvider>
  )
}

export default MeetingControl
