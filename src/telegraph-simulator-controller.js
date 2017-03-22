const aws = require('aws-sdk');

function invokeTelegraphSimulators(telegraphSimulatorFunctionName, numberOfTelegraphs, telegraphConfig, awsRegion, callback) {
  const lambda = new aws.Lambda({
    region: awsRegion
  });

  var hasError = false;
  var lambdaErrorHandler = function(error, data) {
    if (error) {
      hasError = true;
      console.log("error invoking a TelegraphSimulator function", error);
      console.log(data);
    }
  }

  var payload = JSON.stringify(telegraphConfig);
  for (var i = 0; i < numberOfTelegraphs; i++) {
    lambda.invoke({
      FunctionName: telegraphSimulatorFunctionName,
      Payload: payload,
      InvocationType: "Event" // asynchronous call
    }, lambdaErrorHandler);
  }
  if (!hasError) {
    callback(null, "invoked " + numberOfTelegraphs + " telegraph simulator functions.");
  } else {
    callback('error invoking a TelegraphSimulator function - see log', null);
  }
}

exports.handler = (event, context, callback) => {
  invokeTelegraphSimulators(process.env.TelegraphSimulatorFunctionName, event["number-of-telegraphs"], event["telegraph-config"], process.env.AWS_DEFAULT_REGION, callback);
};