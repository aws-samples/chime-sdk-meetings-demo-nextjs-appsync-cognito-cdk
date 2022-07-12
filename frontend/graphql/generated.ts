import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type ChimeMeeting = {
  __typename?: 'ChimeMeeting';
  attendeeResponse: Scalars['String'];
  meetingResponse: Scalars['String'];
};

export type MeetingInvitation = {
  __typename?: 'MeetingInvitation';
  meetingResponse: Scalars['String'];
  source: Scalars['ID'];
  target: Scalars['ID'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createChimeMeeting?: Maybe<ChimeMeeting>;
  createMeetingInvitation?: Maybe<MeetingInvitation>;
  joinMeeting?: Maybe<ChimeMeeting>;
};


export type MutationCreateMeetingInvitationArgs = {
  meetingResponse: Scalars['String'];
  source: Scalars['ID'];
  target: Scalars['ID'];
};


export type MutationJoinMeetingArgs = {
  meetingResponse: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  dummy?: Maybe<ChimeMeeting>;
};

export type Subscription = {
  __typename?: 'Subscription';
  onMeetingInvited?: Maybe<MeetingInvitation>;
};


export type SubscriptionOnMeetingInvitedArgs = {
  target: Scalars['ID'];
};

export type CreateMeetingMutationVariables = Exact<{ [key: string]: never; }>;


export type CreateMeetingMutation = { __typename?: 'Mutation', createChimeMeeting?: { __typename?: 'ChimeMeeting', meetingResponse: string, attendeeResponse: string } | null };

export type JoinMeetingMutationVariables = Exact<{
  meetingResponse: Scalars['String'];
}>;


export type JoinMeetingMutation = { __typename?: 'Mutation', joinMeeting?: { __typename?: 'ChimeMeeting', meetingResponse: string, attendeeResponse: string } | null };

export type CreateMeetingInvitationMutationVariables = Exact<{
  target: Scalars['ID'];
  source: Scalars['ID'];
  meetingResponse: Scalars['String'];
}>;


export type CreateMeetingInvitationMutation = { __typename?: 'Mutation', createMeetingInvitation?: { __typename?: 'MeetingInvitation', source: string, target: string, meetingResponse: string } | null };


export const CreateMeetingDocument = gql`
    mutation CreateMeeting {
  createChimeMeeting {
    meetingResponse
    attendeeResponse
  }
}
    `;

export function useCreateMeetingMutation() {
  return Urql.useMutation<CreateMeetingMutation, CreateMeetingMutationVariables>(CreateMeetingDocument);
};
export const JoinMeetingDocument = gql`
    mutation JoinMeeting($meetingResponse: String!) {
  joinMeeting(meetingResponse: $meetingResponse) {
    meetingResponse
    attendeeResponse
  }
}
    `;

export function useJoinMeetingMutation() {
  return Urql.useMutation<JoinMeetingMutation, JoinMeetingMutationVariables>(JoinMeetingDocument);
};
export const CreateMeetingInvitationDocument = gql`
    mutation CreateMeetingInvitation($target: ID!, $source: ID!, $meetingResponse: String!) {
  createMeetingInvitation(
    target: $target
    source: $source
    meetingResponse: $meetingResponse
  ) {
    source
    target
    meetingResponse
  }
}
    `;

export function useCreateMeetingInvitationMutation() {
  return Urql.useMutation<CreateMeetingInvitationMutation, CreateMeetingInvitationMutationVariables>(CreateMeetingInvitationDocument);
};