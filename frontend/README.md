# Frontend
This is a single page application frontend powered by Next.js.

## Getting Started
To run this frontend locally, you must first set environment variables in `.env.local`. You can get those values from the deployed stack outputs.

```sh
cp .env.local.example .env.local
# set the variables below:
# NEXT_PUBLIC_BACKEND_API_URL: AppSync endpoint
# NEXT_PUBLIC_USER_POOL_ID: Cognito user pool ID
# NEXT_PUBLIC_USER_POOL_CLIENT_ID: Cognito user pool client ID
# NEXT_PUBLIC_AWS_REGION: AWS region for AppSync and Cognito
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Generate GraphQL interface
We use [GraphQL Code Generator](https://www.graphql-code-generator.com/) to generate AppSync interfaces for React from GraphQL schema. Although the generated schema is already commited to git, if you make changes in GraphQL schema, you can re-generate the interfaces by the following command:

```sh
npm run schema
```

The generated files will be placed in [graphql/generated.ts](./graphql/generated.ts).
