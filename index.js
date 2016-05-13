var elasticsearch = require('elasticsearch');
var connection;
var total = 0;
var dataAmount = 0;
var lastDataAmount = 0;
var duplicateCount = 0;
var firstLoop = true;
var debugMode = false;
var elasticsearchLoop = {

    connect: (connectionDetail) => {
        connection = new elasticsearch.Client(connectionDetail);
    },

    debugMode: () => {
        debugMode = true;
    },

    printText: (text, debugLog) => {
        if (debugLog == true && debugMode == true) {
            console.log(text);
        }

        if (!debugLog) {
            console.log(text);
        }

    },

    nullFunction: () => {

    },

    query: (query, loopCallback, successCallback, errorCallback, errorEndCallback) => {
        if (!connection) {
            throw Error('Elasticsearch Connection is not defind.');
        }

        if (!query) {
            throw Error('Elasticsearch Query is not defind.');
        }

        if (!loopCallback) {
            loopCallback = elasticsearchLoop.printText;
        }

        if (!successCallback) {
            successCallback = elasticsearchLoop.nullFunction
        }

        if (!errorCallback) {
            successCallback = elasticsearchLoop.printText;
        }

        if (!errorEndCallback) {
            errorEndCallback = elasticsearchLoop.nullFunction
        }

        elasticsearchLoop.getMessageLoop(query, loopCallback, successCallback, errorCallback, errorEndCallback);
    },

    getMessageLoop: (query, loopCallback, successCallback, errorCallback, errorEndCallback) => {
        query.size = 100;
        query.scroll = '60m';
        query.search_type = "scan"
        elasticsearchLoop.printText("[Elasticsearch] Loop Start.", true);
        connection.search(query, function getMoreUntilDone(error, response) {

            if (duplicateCount > 3000) {
                elasticsearchLoop.printText("[Elasticsearch] Loop Ended With Error.", true);
                errorEndCallback;
            }

            if (!error) {
                total = response.hits.total;
                scroll_id = response._scroll_id;
                if (!firstLoop) {
                    elasticsearchLoop.printText("[Elasticsearch] Fetched " + dataAmount.toLocaleString() + " From " + total.toLocaleString(), true);
                } else {
                    elasticsearchLoop.printText("[Elasticsearch] Total " + total.toLocaleString() + " Records", true);
                    firstLoop = false;
                }
                response.hits.hits.forEach(function(hit) {
                    loopCallback(hit);
                    dataAmount++;
                });
            } else {
                errorCallback(error)
            }

            if (lastDataAmount == dataAmount) {
                duplicateCount++;
            } else {
                duplicateCount = 0;
            }

            lastDataAmount = dataAmount;

            if (total !== dataAmount) {
                connection.scroll({
                    scrollId: scroll_id,
                    scroll: '60m'
                }, getMoreUntilDone);
            } else {
                elasticsearchLoop.printText("[Elasticsearch] Loop Ended.", true);
                successCallback;
            }
        });
    }

}

module.exports = elasticsearchLoop;
