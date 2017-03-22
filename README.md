# bef-multipublisher-perf-test
Brightspace Event Flow (BEF) Multipublisher Performance Test utilities

Two lambda functions to simulate multiple Telegraphs publishing at the same time, for performance testing of BEF.

## Deploying Lambdas to AWS
`npm install`
`serverless --stage <environment name> --region <aws region> deploy`

## Clean Up
`serverless --stage <environment name> --region <aws region> remove`

## telegraph-simulator Lambda function
`telegraph-simulator` is a lambda function that simulates one Telegraph instance.  It publishes simple events to a BEF API Gateway.

### Configuration
```
{
  "number-of-batches": 2,
  "wait-between-batches-ms": 100,
  "bef-gateway-endpoint": "https://qgoew2yfl8.execute-api.us-west-2.amazonaws.com/donb/brightspace",
  "tenant-id": "71674496-23f5-4457-94ed-ac87c761b817",
  "auth-token": "my-auth-token"
}
```

`number-of-batches`: The number of batches that the "Telegraph" will publish to the BEF each time this Lambda is invoked.  Each batch will comprise only 1 event.  Each event published by a single Lambda instance is identical except for the EventID, which is unique for each event.

`wait-between-batches-ms`: The time, in milliseconds, that the "Telegraph" will sleep between sending each batch.  I have found that, in AWS, a wait time of 100 ms works out to about 3 events per second.  If you want a different rate, you should try invoking the Lambda with a large number of batches (say, 1 minute's worth at your desired rate) and, through trial and error, dial in the wait time that gives you the desired rate.

`bef-gateway-endpoint`: The URL to publish to an actual BEF stack that has already been deployed.

`tenant-id`: The tenant ID that will be a field in each event sent by this Lambda.

`auth-token`: An OAuth2 token.  You can get a token from http://backdoor.tools.d2l/, using the same TenantId that you specify above and using the same Authentication Service Endpoint that your BEF is using.  This requires that the BEF is using one of the "dev" auth services, not a production auth service.

### Invoking in AWS (recommended for perf testing)
Invoke it directly from the AWS UI Console, giving it an event with the format specified above.

### Running locally on your machine (option for debugging or testing changes to this script):
Modify the `testInput` variable in the `telegraph-simulator.js` script, then call `node src\telegraph-simulator.js`.

## telegraph-simulator-controller Lambda function
`telegraph-simulator-controller` is a lambda function that simulates multiple Telegraph instances running concurrently.  It does this by invoking the `telegraph-simulator` lambda multiple times asynchronously

### Configuration
```
{
  "number-of-telegraphs": 4,
  "telegraph-config": <a json object as defined in the configuration section above for `telegraph-simulator`>
}
```

`number-of-telegraphs`: The number of `telegraph-simulator` lambdas to be invoked to run concurrently.  Each of those `telegraph-simulator` lambdas will be invoked with the identical "telgraph-config", meaning they will all publish the same number and rate of events for the same tenant ID to the same BEF endpoint.

### Invoking in AWS (recommended for perf testing)
Invoke it directly from the AWS UI Console, giving it an event with the format specified above.

### Running locally on your machine (option for debugging or testing changes to this script):
Modify the `testInput` variable in the `telegraph-simulator-controller.js` script, then call `node src\telegraph-simulator-controller.js`.