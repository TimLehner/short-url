var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;

/* GET specification listing. */
router.get('/', function(req, res, next) {
    res.render('specification', {url: "https://fcc-challenge-url-short.herokuapp.com"});
});

/* GET home page. */
router.get('/l/:url', function (req, res, next) {
    MongoClient.connect("mongodb://tim:" + process.env.dbsecret + "@ds119368.mlab.com:19368/timlehner-sandbox", function (err, db) {
        if (err) {
            connectionErr(res, err);
            db.close();
            return;
        }
        var linkColl = db.collection('links');
        var id = req.params.url.toString();

        linkColl.findOne({
            tiny: id
        }, function(err, item) {
            if (!item) {
                res.status(404);
                res.render("error", {message: 404, error: {status: "No such short link", stack: "Either the link has expired or it never existed."}});
            } else {
                console.log(item);
                res.redirect(item.url);
                res.end();
            }
            db.close();
        })
    });
});

module.exports = router;
