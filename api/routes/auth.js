/**
 * Created by Vafle on 10/31/2015.
 */
var express = require('express');
var router = express.Router();
var db;

router.use('/', function (req, res, next) {
    return next();
    if (!req.headers | !req.headers['key'] ||
        req.headers['key'] != "6Am6sqTMAUn+=T2pTPyV9.")
        return res.send("need auth");
    next();
});
module.exports = function (data) {
    db = data.db;
    return router;
};