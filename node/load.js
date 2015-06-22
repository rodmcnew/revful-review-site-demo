var apiKey = process.argv[2];

var request = require("request");
var jsonFile = require('jsonfile');
var queryString = require("querystring");
var RateLimiter = require('limiter').RateLimiter;
var limiter = new RateLimiter(3, 'second');


var items = [];

function writeItems() {
    //@todo keep old data
    jsonFile.writeFileSync(__dirname + '/data/items.json', items);
}
function writeReview(name, data) {
    var filename = __dirname + '/data/detail/' + name + '.json';
    console.log('writing file: ' + filename);
    jsonFile.writeFileSync(filename, data);
}

function processItem(item) {
    getReview(item.itemId, function (review) {
        if (review && review.reviews && review.reviews.length >= 3 && items.indexOf(item.name) == -1) {
            writeReview(item.name.replace(/[^a-z0-9]+/gi, ''), review);
            items.push(item.name);
            writeItems();
        }
    });
}

function getItems(query, itemCallBack) {
    limiter.removeTokens(1, function (err, remainingRequests) {
        if (err) {
            console.error(err);
        }
        console.log('processing search query: ' + query);
        request(
            'http://api.walmartlabs.com/v1/search?' +
            queryString.stringify({
                apiKey: apiKey,
                query: query,
                order: 'desc',
                sort: 'customerRating',
                numItems: 25
            }),
            function (err, res, body) {
                if (err) {
                    console.log(err, body);
                    return;
                }
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    console.log(e, body);
                }
                body.items.forEach(itemCallBack);
            }
        )
    });
}

function getReview(itemId, callBack) {
    limiter.removeTokens(1, function (err, remainingRequests) {
        if (err) {
            console.error(err);
        }
        request(
            'http://api.walmartlabs.com/v1/reviews/' + itemId + '?' +
            queryString.stringify({
                apiKey: apiKey
            }),
            function (err, res, body) {
                if (err) {
                    console.log(err, body);
                    return;
                }
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    console.log(e, body);
                }
                callBack(body);
            }
        )
    });
}


var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

for (var i = letters.length; --i;) {
    for (var i2 = letters.length; --i2;) {
        getItems(letters[i] + letters[i2], processItem);
    }
}

