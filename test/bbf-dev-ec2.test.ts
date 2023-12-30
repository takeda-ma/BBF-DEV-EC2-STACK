import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BbfDevEc2Stack } from '../lib/bbf-dev-ec2-stack';

test('VPC and Subnet Configuration', () => {
  const app = new App();
  const stack = new BbfDevEc2Stack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::VPC', 1);

  template.hasResourceProperties('AWS::EC2::Subnet', {
    CidrBlock: '10.0.0.0/24',
    MapPublicIpOnLaunch: true
  });
});

test('EC2 Instance Configuration', () => {
  const app = new App();
  const stack = new BbfDevEc2Stack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::Instance', 2);

  template.hasResourceProperties('AWS::EC2::Instance', {
    InstanceType: 't2.micro',
  });
});

test('Security Group Configuration', () => {
  const app = new App();
  const stack = new BbfDevEc2Stack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::EC2::SecurityGroup', 1);
});

