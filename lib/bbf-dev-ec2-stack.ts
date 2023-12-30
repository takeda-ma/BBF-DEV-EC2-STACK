/*
 * BBF Dev EC2 Stack
 * This file contains the EC2 stacks that runs redises for each developer.
 */

import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { Ec2ConfigItem } from './types/types';
import { generatePassword, capitalize } from './helper';

export class BbfDevEc2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* 
      VPC
      Sets up a VPC with 2 AZs and 1 public subnet and
      automatically setup internet gateway via subnetConfiguration.
    */
    const vpc = new ec2.Vpc(this, 'BbfVpc', {
      maxAzs: 2,
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      subnetConfiguration: [
        {
          /* CIDR block 10.0.0.0/24 */
          cidrMask: 24,
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    /* 
      Security Group
      Sets up a security group with inbound rules for SSH and Redis.
    */
    const securityGroup = new ec2.SecurityGroup(this, 'BbfSecurityGroup', {
      vpc,
      securityGroupName: 'BbfSecurityGroup',
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379));
    
    /* 
      EC2 Instance
      Sets up an EC2 instance with a user data script to install Redis.
    */
    const script = fs.readFileSync(`${__dirname}/redis-setup.sh`, 'utf8');
    const ec2Config = yaml.load(fs.readFileSync(`${__dirname}/ec2-config.yml`, 'utf8')) as Ec2ConfigItem[];

    ec2Config.forEach((config, index) => {
      const developer = Object.keys(config)[0];
      const instanceName = config[developer]['instance-name'];
      const password = generatePassword(instanceName);

      let script = fs.readFileSync(`${__dirname}/redis-setup.sh`, 'utf8');
      script = script.replace('placeholder', password);
      const userData = ec2.UserData.custom(script);

      const ec2Instance = new ec2.Instance(this, capitalize(instanceName) + 'Ec2RedisInstance', {
        vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T2,
          ec2.InstanceSize.MICRO
        ),
        /* Image id for Ubuntu 22.04 */
        machineImage: ec2.MachineImage.genericLinux({
          'ap-northeast-1': 'ami-07c589821f2b353aa',
        }),
        securityGroup,
        userData: userData,
      });

      new cdk.CfnOutput(this, `RedisConnectionString${index}`, {
        value: `redis://${password}@${ec2Instance.instancePublicIp}:6379`,
        description: `Redis connection string for dev ${instanceName}`,
      });
    });
  }
}
