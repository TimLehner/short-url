var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;


/* GET home page. */
router.get('/:url', function (req, res, next) {
    // Connect to the db
    MongoClient.connect("mongodb://tim:" + process.env.dbsecret + "@ds119368.mlab.com:19368/timlehner-sandbox", function (err, db) {
        if (err) {
            connectionErr(res, err);
            db.close();
            return;
        }
        var linkColl = db.collection('links');
        var url = req.params.url;

        if (isUri(url)) {
            linkColl.findOne({
                url: url
            }, function (err, item) {
                if (!item) {
                    // couldn't find it
                    createNewLink(res, url, linkColl, db);
                    return;
                }
                var returnObj = {
                    short_url: item.tiny,
                    original_url: item.url
                };
                res.end(JSON.stringify(returnObj));
                db.close();
            });
        } else {
            res.status(400);
            res.end(JSON.stringify({
                error: "Not a valid URL"
            }));
            db.close();
        }
    });

    //res.render('index', {
    //    title: 'Shorter Urls',
    //    url: "http://localhost:3000"
    //});
});

function isUri(str) {
    return str.match("(w{3})?\\.?\\w+[^w{3}]\\.\\w+")
}

function connectionErr(res, err) {
    res.render("error", {
        message: "Problem connecting to database: " + err.message,
        error: {
            status: err.status,
            stack: err.stack
        }
    })
}

function createNewLink(res, url, collection, db) {
    collection.findOne({count: {$exists: true}}, function(err, count) {
        var newLink = {
            url: url,
            tiny: parseInt(count.count).toString(16)
        };
        collection.insert(newLink);
        collection.update({count: {$exists: true}}, {count: parseInt(count.count) + 1});
        db.close();
        res.end(JSON.stringify({
            original_url: newLink.url,
            short_url: newLink.tiny
        }));

    });
}

module.exports = router;
