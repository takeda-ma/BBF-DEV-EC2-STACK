// types.ts

export interface Ec2ConfigItem {
  [key: string]: {
    'instance-name': string;
    'options': string;
  };
}
