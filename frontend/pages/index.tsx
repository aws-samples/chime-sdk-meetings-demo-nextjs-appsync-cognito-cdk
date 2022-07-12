import type { NextPage } from 'next';
import Head from 'next/head'
import { Amplify, Auth } from 'aws-amplify';
import config from '../config';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator, Button } from '@aws-amplify/ui-react';
import { AppBar, Grid, TextField, Stack, Toolbar, Typography } from '@mui/material';
import { ChimeMeetingStateProvider } from '../components/chime/context';
import { MeetingProvider } from 'amazon-chime-sdk-component-library-react';
import MeetingCaller from '../components/chime/MeetingCaller';
import MeetingControl from '../components/chime/MeetingControl';
import MeetingReceiver from '../components/chime/MeetingReceiver';
import { createClient, defaultExchanges, Provider } from 'urql';
import { asyncHeaderExchange } from 'urql-exchange-async-headers';

const Home: NextPage = () => {
  const amplifyConfig = {
    aws_appsync_graphqlEndpoint: config.apiEndpoint,
    aws_appsync_region: config.awsRegion,
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS',
    Auth: {
      region: config.awsRegion,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.userPoolClientId,
    },
  };
  Amplify.configure(amplifyConfig);

  const client = createClient({
    url: config.apiEndpoint,
    exchanges: [
      // https://github.com/FormidableLabs/urql/issues/234
      asyncHeaderExchange(async () => {
        const currentSession = await Auth.currentSession();
        return {
          authorization: currentSession.getAccessToken().getJwtToken(),
        };
      }),
      ...defaultExchanges,
    ],
  });

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <>
          <Head>
            <title>Chime SDK meetings demo</title>
          </Head>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                Chime SDK meetings demo
              </Typography>
              <Button color="inherit" onClick={signOut}>
                Sign out
              </Button>
            </Toolbar>
          </AppBar>
          <main>
            <Provider value={client}>
              <Grid container alignItems="center" justifyContent="center" my={5}>
                <ChimeMeetingStateProvider>
                  <MeetingProvider>
                    <Grid item xs={8}>
                      <Stack spacing={5}>
                        <TextField value={user?.username ?? ''} variant="filled" label="My ID" disabled />
                        <MeetingCaller myId={user?.username ?? ''} />
                        <MeetingControl />
                        <MeetingReceiver myId={user?.username ?? ''} />
                      </Stack>
                    </Grid>
                  </MeetingProvider>
                </ChimeMeetingStateProvider>
              </Grid>
            </Provider>
          </main>
        </>
      )}
    </Authenticator>
  );
};

export default Home;
