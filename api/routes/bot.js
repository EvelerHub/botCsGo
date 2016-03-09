/**
 * Created by Vafle on 11/11/2015.
 */
var express = require('express');
var BotScheme = (require("../../lib/db/schemes")).Bot;
var router = express.Router();
var db;
var CRUD;
var SomeBot = require("../../lib/tradeoffer/SomeBot");
var bots = {};

module.exports = function (data) {
    db = data.db;
    CRUD = new (require('./CRUD'))(data.db, ["pass"]);
    return router;
};

router.get('/add', function (req, res) {
    CRUD.list(BotScheme, function (err, data) {
        res.render('bot', {bots: data});
    });
});

router.get('/:name', function (req, RES, next) {
    if (!req.params.name) return;
    Bot.find({name: req.params.name}, function (err, res) {
        if (err) RES.send(err);
        else RES.send(res);
    });
});

router.get('/', function (req, res, next) {
    CRUD.list(BotScheme, function (err, data) {
        res.send(data);
    });
});

router.post('/add', function (req, res, next) {
    var Bot = BotScheme.getScheme();
    var bot = new Bot({
        status: "new",
        name: req.body.name,
        login: req.body.login,
        pass: req.body.pass,
        dota2marketKey: req.body.market_key,
        steamKey: req.body.steam_key
    });

    bot.save(function (err, data) {
        if (err) return next(err);
        res.send(data);
    });
});

var Bot = BotScheme.getScheme();
router.post('/delete', function (req, RES, next) {

    Bot.find({name: req.body.name}).remove(function (err, res) {
        if (err) RES.send(err);
        else RES.send(res);
    });
});

router.post('/start', function (req, RES) {
    Bot.findAndModify({name: req.body.name, status: {$in: ["new", "stopped"]}},
        [], {$set: {status: 'starting'}}, {new: true}, function (err, res) {

            if (err) RES.send(err);
            else RES.send(res);
        });
});

router.post('/stop', function (req, RES) {
    Bot.findAndModify({name: req.body.name, status: {$in: ["started"]}}, [],
        {$set: {status: 'stopping'}}, {new: true}, function (err, res) {

            if (err) RES.send(err);
            else RES.send(res);
        });
});
/*
 {
 "_id" : ObjectId("5644525b08889e44060f7521"),
 "name" : "respect1877",
 "login" : "respect1877",
 "pass" : "sokol1524",
 "authCode" : "",
 "dota2marketKey" : "Ir57KXRbK7hGUByC2467Ys38E3y5ip3",
 "steamKey" : "DC5E63595194D920161D7F0EC499F849",
 "dateAdded" : ISODate("2015-11-12T08:48:27.777Z"),
 "updateDate" : "2015-11-13T19:03:17.836Z",
 "status" : "started",
 "__v" : 0,
 "message" : "AccountLogonDenied"
 }

 */

router.post('/update', function (req, RES) {
    Bot.findAndModify({name: req.body.name}, [], {$set: req.body.update}, {new: true},
        function (err, res) {
            if (err) RES.send(err);
            else RES.send(res);
        });
});
