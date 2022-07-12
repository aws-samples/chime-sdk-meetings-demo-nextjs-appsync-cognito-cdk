import React, { Dispatch, SetStateAction, useContext, useState } from 'react'

// Chime Meetingは同時に複数の通話をすると扱いが複雑になるので、それを防ぐために
// 各コンポーネント間で通話状態を共有するContextを作る
export type ChimeMeetingState = {
  isOnCall: boolean
  meetingResponse?: any
}

const initialState: ChimeMeetingState = {
  isOnCall: false,
}

const ChimeMeetingStateContext =
  React.createContext<ChimeMeetingState>(initialState)

const SetChimeMeetingStateContext = React.createContext<
  Dispatch<SetStateAction<ChimeMeetingState>>
>(() => {})

export const useChimeMeetingState = () => {
  return {
    state: useContext(ChimeMeetingStateContext),
    setState: useContext(SetChimeMeetingStateContext),
  }
}

export const ChimeMeetingStateProvider = (props: {
  children: React.ReactNode
}) => {
  const [state, setState] = useState<ChimeMeetingState>(initialState)
  return (
    <ChimeMeetingStateContext.Provider value={state}>
      <SetChimeMeetingStateContext.Provider value={setState}>
        {props.children}
      </SetChimeMeetingStateContext.Provider>
    </ChimeMeetingStateContext.Provider>
  )
}
