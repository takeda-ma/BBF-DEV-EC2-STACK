# Stack for dev redises running on ec2

<h4>Overview</h4>

![bbf-dev-ec2](./bbf-redis-on-ec2-devs.svg)

We need to run this whenever there is a change in IaC
```
npm run build
```

Bootstrap cdk resource in AWS

```
cdk bootstrap aws://AWS_ACCOUNT_ID/REGION
```

Deploy BBF-DEV-EC2 stack

```
cdk deploy
```

Destroy BBF-DEV-EC2 resources running on AWS

```
cdk destroy
```
