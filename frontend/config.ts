const config = {
  apiEndpoint: process.env.NEXT_PUBLIC_BACKEND_API_URL!,
  userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID!,
  awsRegion: process.env.NEXT_PUBLIC_AWS_REGION!,
  userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID!,
};

export default config;
