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

// Below this line: Used for running locally on your machine

var testInput = {
  "number-of-telegraphs": 4,
  "telegraph-config": {
    "number-of-batches": 2,
    "wait-between-batches-ms": 100,
    "bef-gateway-endpoint": "https://qgoew2yfl8.execute-api.us-west-2.amazonaws.com/donb/brightspace",
    "tenant-id": "71674496-23f5-4457-94ed-ac87c761b817",
    "auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijk2MmEwZWQ4LTkyYzUtNDZmYy04NTQ3LTMwODE5MjgzNjRmMiJ9.eyJ0ZW5hbnRpZCI6IjcxNjc0NDk2LTIzZjUtNDQ1Ny05NGVkLWFjODdjNzYxYjgxNyIsInNjb3BlIjoiKjoqOioiLCJqdGkiOiJjOWFkYTkyNy02ZmQ2LTQ0ZTEtYmU4ZC0yYWVkNjAxYzYzYTIiLCJpc3MiOiJodHRwczovL2FwaS5icmlnaHRzcGFjZS5jb20vYXV0aCIsImF1ZCI6Imh0dHBzOi8vYXBpLmJyaWdodHNwYWNlLmNvbS9hdXRoL3Rva2VuIiwiZXhwIjoxNDkwMjA4NTI4LCJuYmYiOjE0OTAyMDQ5Mjh9.UO5AjVWtxQmHP9DLAKiMBlGXvlhZ5Dk16A3KZwfP0-ZXerGG128occwzyfLI0J5PPS8kiy2b9181FAO3nBarZQslBI0p_8sdJArY8Uo60n1hL6Ld-mV1snN5MkAzW6siENPhLeAd7tZT8PXmNMFCafegjXcGIkPD8EHBTM0AsGfErDETMJutIyAiI0MwG3_RwNvb-3pse8fJ9WemldJSOlGiJ5Vm2Wmg6orw-WD40Er4uzY-AOjG2i1p45V1sF73JAEjuEebwhMBPQYw0dnaXV3hqAbzs5PLA_xxa6vE_UMh9kjUnZ0VYwzmk3_OZo4-JyLVKPr6ysnZu4wAggKm5Q"
  }
};

invokeTelegraphSimulators("bef-multipublisher-perf-test-telegraph-simulator-donb", testInput["number-of-telegraphs"], testInput["telegraph-config"], "us-west-2", (err, result) => {
  if (err) {
    console.log("Error:", err);
    console.log(result);
  } else {
    console.log("Success:", result);
  }
})