import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { Auth } from './auth';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

export interface BackendApiProps {
  readonly auth: Auth;
}

export class BackendApi extends Construct {
  readonly api: appsync.GraphqlApi;

  constructor(scope: Construct, id: string, props: BackendApiProps) {
    super(scope, id);

    const chimeResolverFunction = new NodejsFunction(this, 'ChimeResolverFunction', {
      entry: 'backend/chime-resolver.ts',
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_20_X,
    });

    chimeResolverFunction.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['chime:createAttendee', 'chime:createMeeting'],
        resources: ['*'],
      }),
    );

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'Api',
      definition: appsync.Definition.fromFile('backend/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: props.auth.userPool,
          },
        },
      },
      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL,
      },
    });

    const chimeDataSource = api.addLambdaDataSource('ChimeDataSource', chimeResolverFunction);

    chimeDataSource.createResolver('CreateChimeMeeting', {
      typeName: 'Mutation',
      fieldName: 'createChimeMeeting',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    chimeDataSource.createResolver('JoinMeeting', {
      typeName: 'Mutation',
      fieldName: 'joinMeeting',
      requestMappingTemplate: appsync.MappingTemplate.lambdaRequest(),
      responseMappingTemplate: appsync.MappingTemplate.lambdaResult(),
    });

    const dummyDataSource = new appsync.NoneDataSource(this, 'DummyDataSource', {
      api,
    });

    dummyDataSource.createResolver('CreateMeetingInvitation', {
      typeName: 'Mutation',
      fieldName: 'createMeetingInvitation',
      // only authorize a request when source == user
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #if ($context.identity.sub != $context.arguments.source)
          $util.unauthorized()
        #end
        {
          "version": "2018-05-29",
          "payload": $util.toJson($context.arguments)
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString('$util.toJson($context.result)'),
    });

    dummyDataSource.createResolver('OnMeetingInvited', {
      typeName: 'Subscription',
      fieldName: 'onMeetingInvited',
      // only authorize a request when target == user
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #if ($context.identity.sub != $context.arguments.target)
          $util.unauthorized()
        #end
        {
          "version": "2018-05-29",
          "payload": {}
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString('$util.toJson(null)'),
    });

    this.api = api;
    new CfnOutput(this, 'BackendApiUrl', { value: api.graphqlUrl });
  }
}
