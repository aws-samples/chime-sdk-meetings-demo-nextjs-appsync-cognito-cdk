import { Construct } from 'constructs';
import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketEncryption, IBucket } from 'aws-cdk-lib/aws-s3';
import { CloudFrontWebDistribution, OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { NodejsBuild } from 'deploy-time-build';
import { Auth } from './auth';

export interface FrontendProps {
  readonly backendApiUrl: string;
  readonly auth: Auth;
  readonly accessLogBucket: IBucket;
}

export class Frontend extends Construct {
  readonly cloudFrontWebDistribution: CloudFrontWebDistribution;
  constructor(scope: Construct, id: string, props: FrontendProps) {
    super(scope, id);

    const assetBucket = new Bucket(this, 'AssetBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
    const distribution = new CloudFrontWebDistribution(this, 'Distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: assetBucket,
            originAccessIdentity,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
            },
          ],
        },
      ],
      errorConfigurations: [
        {
          errorCode: 404,
          errorCachingMinTtl: 0,
          responseCode: 200,
          responsePagePath: '/',
        },
        {
          errorCode: 403,
          errorCachingMinTtl: 0,
          responseCode: 200,
          responsePagePath: '/',
        },
      ],
      loggingConfig: {
        bucket: props.accessLogBucket,
        prefix: 'Frontend/',
      },
    });

    new NodejsBuild(this, 'ReactBuild', {
      assets: [
        {
          path: 'frontend',
          exclude: ['node_modules', 'out', '.env.local', '.next'],
          commands: ['npm ci'],
          // prevent too frequent frontend deployment, for temporary use
          // assetHash: 'frontend_asset',
        },
      ],
      buildCommands: ['npm run build'],
      buildEnvironment: {
        NEXT_PUBLIC_BACKEND_API_URL: props.backendApiUrl,
        NEXT_PUBLIC_USER_POOL_ID: props.auth.userPool.userPoolId,
        NEXT_PUBLIC_USER_POOL_CLIENT_ID: props.auth.client.userPoolClientId,
        NEXT_PUBLIC_AWS_REGION: Stack.of(props.auth.userPool).region,
      },
      destinationBucket: assetBucket,
      distribution,
      outputSourceDirectory: 'out',
    });

    this.cloudFrontWebDistribution = distribution;
  }
}
