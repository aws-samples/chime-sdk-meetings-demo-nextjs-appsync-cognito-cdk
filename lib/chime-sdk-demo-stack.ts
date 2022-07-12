import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Auth } from './constructs/auth';
import { BackendApi } from './constructs/backend-api';
import { Frontend } from './constructs/frontend';

export class ChimeSdkDemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const accessLogBucket = new Bucket(this, 'AccessLogBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const auth = new Auth(this, 'Auth');

    const backend = new BackendApi(this, 'BackendApi', {
      auth,
    });

    const frontend = new Frontend(this, 'Frontend', {
      backendApiUrl: backend.api.graphqlUrl,
      auth,
      accessLogBucket,
    });

    new CfnOutput(this, 'FrontendDomainName', {
      value: `https://${frontend.cloudFrontWebDistribution.distributionDomainName}`,
    });
  }
}
