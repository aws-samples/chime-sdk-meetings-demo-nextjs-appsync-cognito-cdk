import * as cdk from "aws-cdk-lib";
import { Template } from 'aws-cdk-lib/assertions';
import { ChimeSdkDemoStack } from "../lib/chime-sdk-demo-stack";

test("Snapshot test", () => {
  const app = new cdk.App();
  const stack = new ChimeSdkDemoStack(app, "TestStack");
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});
