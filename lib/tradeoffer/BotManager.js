/**
 * Created by Vafle on 11/12/2015.
 */
var SomeBot = require('./SomeBot');
var async = require('async');
var Scheme = require('../db/schemes').Bot.getScheme();
var bots = {};
/*setInterval(function(){
 var Scheme = BotScheme.getScheme();
 Scheme.find({status:{$in:["starting","stoping","deleting","authcode"]}},
 function(err,ress){
 if(!)
 res.forEach()
 });



 },5000);*/
Scheme.find({status: {$in: ["started", "startproceed"]}}
    , function (err, res) {
        if (!err && res) {
            res.forEach(function (elem) {
                elem.status = 'starting';
                elem.save();
            });
        }
    });

Scheme.find({status: {$in: ["stopprocess"]}}
    , function (err, res) {
        if (!err && res) {
            res.forEach(function (elem) {
                elem.status = 'stopping';
                elem.save();
            });
        }
    });


var TaskStarting = function (callback) {
    try {
        Scheme.findAndModify({status: "starting"}, [],
            {$set: {status: "startproceed"}},
            {new: true},
            function (err, res) {
                //if(err) return callback();
                //res.value.forEach(function(bot){
                if (!res.value) return;
                var bot = res.value;
                console.log("starting bot " + bot.name + " ....");
                if (bots[bot.name]) {
                    bots[bot.name].stop();
                    bots[bot.name] = null;
                }
                if (!bots[bot.name]) {
                    bots[bot.name] = new SomeBot({
                        dota2marketKey: bot.dota2marketKey,
                        steamKey: bot.steamKey,
                        botName: bot.name,
                        login: bot.login,
                        pass: bot.pass,
                        authcode: bot.authCode
                    });
                }

                var myBot = bots[bot.name];
                //myBot.stop();
                myBot.start(function (error) {
                    //bot.updateDate = Scheme.util.getTime();
                    Scheme.findOne({_id: bot._id}, function (err, bot) {
                        if (err) return;
                        if (error) {
                            bot.status = 'error';
                            bot.message = error.message;
                        } else {
                            bot.status = 'started';
                            bot.authCode = "";
                        }
                        bot.authCode = "";

                        bot.save();
                    });
                });
            });

        setTimeout(function () {
            console.log(1);
            callback();
        }, 10000);
    } catch (e) {
        console.log(e);
    }


    // });
};
var TaskStopping = function (cback) {
    try {
        Scheme.findAndModify({status: "stopping"}, [],
            {$set: {status: "stopprocess"}},
            {new: true}, function (err, res) {
                if (!res.value) return;
                var bot = res.value;
                console.log("stopping bot " + bot.name + " ....");
                if (bots[bot.name]) {
                    bots[bot.name].stop();
                    bots[bot.name] = null;
                    console.log("stopped! name=" + bot.name);
                }
                Scheme.findOne({_id: bot._id}, function (err, bot) {
                    if (err) return;
                    bot.status = "stopped";
                    bot.save();
                });


            });
    } catch (e) {
        console.log(e);
    }
    setTimeout(function () {
        console.log(1);
        cback();
    }, 10000);

};
var foreva = function (cback) {
    async.series([TaskStarting, TaskStopping], function () {
        cback();
    });
};

async.forever(foreva, function (err, res) {

});