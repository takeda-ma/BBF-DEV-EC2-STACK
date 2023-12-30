import * as crypto from 'crypto';

export function generatePassword(instanceName: string): string {
  const randomPart = crypto.randomBytes(8).toString('hex');
  return instanceName + randomPart;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}