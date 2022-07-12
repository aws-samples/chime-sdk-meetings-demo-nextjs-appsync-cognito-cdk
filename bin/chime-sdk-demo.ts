#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ChimeSdkDemoStack } from '../lib/chime-sdk-demo-stack';

const app = new cdk.App();
new ChimeSdkDemoStack(app, 'ChimeSdkDemoStack', {});

// import { Aspects } from 'aws-cdk-lib';
// import { AwsSolutionsChecks } from 'cdk-nag';
// Aspects.of(app).add(new AwsSolutionsChecks());
