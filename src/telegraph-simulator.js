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