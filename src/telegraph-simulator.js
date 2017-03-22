'use strict';

const http = require('http');
const request = require('request-promise-native');
const oldRequest = require('request'); // so serverless-plugin-include-dependencies will get this necessary indirect dependency
const uuid = require('node-uuid');

function initAndSimulateTelegraph(input, callback) {
  simulateTelegraph(input, callback, {}, 0, false, 0)
}

function simulateTelegraph(input, callback, errorCounts, successCount, hasError, publishCount) {
  var batchLimit = input["number-of-batches"];
  if (!batchLimit || batchLimit < 1) {
    callback("invalid number-of-batches specified", batchLimit);
    return;
  }
  publishMessage(input["bef-gateway-endpoint"], input["auth-token"], input["tenant-id"], errorCategory => {
    if (errorCategory) {
      hasError = true;
      if (errorCounts[errorCategory]) {
        errorCounts[errorCategory] += 1;
      } else {
        errorCounts[errorCategory] = 1;
      }
    } else {
      successCount += 1;
    }
  })
    .then(() => {
      publishCount += 1;
      if (publishCount >= batchLimit) {
        if (hasError) {
          callback(JSON.stringify({"Number of each error type encountered": errorCounts}), errorCounts);
        } else {
          callback(null, successCount);
        }
      } else {
        setTimeout(simulateTelegraph, input["wait-between-batches-ms"], input, callback, errorCounts, successCount, hasError, publishCount);
      }
    });
}

function publishMessage(endpoint, authToken, tenantId, callback) {
  var payload = {
    Events: [
      {
        EventType: "UserInteractionEvent",
        EventId: uuid.v4(),
        TenantId: tenantId
      }
    ]
  };
  return request.post(
    endpoint,
    {
      json: payload,
      auth: { bearer: authToken}
    }
  )
  .then(response => {
    callback(null);
  })
  .catch(error => {
    var errorCategory = null;
    if (error.statusCode) {
      errorCategory = error.statusCode;
    } else {
      errorCategory = "error making request - see log";
      console.log("error making request:", error);
    }

    callback(errorCategory);
  });
}

module.exports.handler = (event, context, callback) => {
  initAndSimulateTelegraph(event, callback);
};

// Below this line: Used for running locally on your machine

var testInput = {
  "number-of-batches": 2,
  "wait-between-batches-ms": 100,
  "bef-gateway-endpoint": "https://qgoew2yfl8.execute-api.us-west-2.amazonaws.com/donb/brightspace",
  "tenant-id": "71674496-23f5-4457-94ed-ac87c761b817",
  "auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ijk2MmEwZWQ4LTkyYzUtNDZmYy04NTQ3LTMwODE5MjgzNjRmMiJ9.eyJ0ZW5hbnRpZCI6IjcxNjc0NDk2LTIzZjUtNDQ1Ny05NGVkLWFjODdjNzYxYjgxNyIsInNjb3BlIjoiKjoqOioiLCJqdGkiOiIyM2E2ZDcwNi1lNjdlLTQwMDgtOWU3My02MDNjZDI1MjgxNDkiLCJpc3MiOiJodHRwczovL2FwaS5icmlnaHRzcGFjZS5jb20vYXV0aCIsImF1ZCI6Imh0dHBzOi8vYXBpLmJyaWdodHNwYWNlLmNvbS9hdXRoL3Rva2VuIiwiZXhwIjoxNDkwMTk4NDI1LCJuYmYiOjE0OTAxOTQ4MjV9.YHbHJq1sCXvLrB6twNdmMhY8A_nc-jH78xRLjST9WSeS_g7HjU3VLYGtbWAmrKnTZNmSWzKFINBAof3BAuljORzZLzw-GxhW6i6hKMph-8-LOSah938VglnwjjF2EiNtErhpVzAQMMTzSdBcVSkg6_Bz9NOhKeS6xGh4n5CnGD82cx630OE215fC_2vJCq5KhFj_UGfCqYC9C-OWGxk2vbBt2YM1iX_kIHQ_tTjXy5Kp0pYilfcewX4_Tz8h2XD5U3liH0YKJZ9QwJU1NQvwUpGvjGL-rs_mgSeyHNJmgQ-0EB_2xyibMtqByC1u7pMWYJNmZr3PhVFTZQBHCIWCYQ"
};

initAndSimulateTelegraph(testInput, (err, response) => {
  if(err) {
    console.log("Error:", err);
    console.log(response);
  } else {
     console.log("Success:", response);
  }
});