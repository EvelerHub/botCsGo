/**
 * Created by Vafle on 11/7/2015.
 */
var TradeOfferBot = require('./TradeOfferBot');
var TradeScheme = require('../db/schemes').TradeClaim;
var ItemScheme = require('../db/schemes').Item;
var Scheme = TradeScheme.getScheme();
var TradeBotTasks = require("./Tasks");
var Schemes = require('../db/schemes');
var db = require('../db/db.js');
var MarketItemTasks = require('../market_csgo/MarketItemCron');
var getTime = function () {
    return new Date().toISOString();
};

var mongoose = require('mongoose');
var async = require('async');
var SomeBot = function (params) {
    this.dota2marketKey = params.dota2marketKey;
    this.steamKey = params.steamKey;
    this.name = params.botName;
    this.logger = params.logger;
    console.log('api key', params.steamKey);
    this.bot = new TradeOfferBot(1000 * 60 * 60 * 72, params.steamKey,
        [], params.login, params.pass, params.authcode);
    var that = this;
    this.bot.on('enterAuthCode', function () {
        that.onAuthCode();
    });
    // this.marketItemTasks = new MarketItemTasks(this.dota2marketKey);
};

SomeBot.prototype.onAuthCode = function () {

};

SomeBot.prototype.deleteBot = function (cback) {
    this.bot.deleteBot(cback);
};
SomeBot.prototype.stop = function (cback) {
    this.bot.disconnect();
    this.bot.shutDownTasks();
};
SomeBot.prototype.start = function (cback) {
    var botSheme = Schemes.Bot.getScheme();
    var self = this;
    var tasks = {
        delay: 25000,
        tasks: TradeBotTasks(this.name, this.bot)
            .concat(MarketItemTasks(this.dota2marketKey)),
        onEnd: function () {
            console.log("ping " + that.name);
            botSheme.findAndModify({name: that.name}, [], {$set: {updateDate: getTime()}});
        }
    };
    this.bot.setTasks(tasks);

    this.bot.on('newInputOffer', function (offer) {
        console.log('new offer');
        var Scheme = Schemes.MarketClaim.getScheme();

        Scheme.find({
                $where: "var last=this.confirmInfo.pop();return last && last.data && last.data.secret=='" +
                offer.message + "'   &&  last.data.trade=='" + offer.tradeofferid + "'"
            }
            , function (err, res) {
                if (!err && res && res.length == 1 && res[0].id) {

                    that.bot.offers.acceptOffer({
                        tradeOfferId: offer.tradeofferid
                    }, function (error, result) {
                        if (!error) {

                            Scheme.update({id: res[0].id},
                                {
                                    $set: {status: "Done", updateDate: getTime()},
                                    $push: {
                                        confirmInfo: {
                                            date: getTime(),
                                            message: "Done", data: result
                                        }
                                    }
                                }, {upsert: true},
                                function (ERR, RES) {
                                    console.log(RES);
                                    //  cback();
                                });
                            offer.items_to_receive.forEach(function (e) {
                                var Item = ItemScheme.getScheme();
                                var item = new Item({
                                    classid: e.classid,
                                    assetId: e.id,//undefined
                                    contextid: e.contextid,
                                    instanceid: e.instanceid,
                                    bot: self.name,
                                    botMessages: []
                                });
                                item.save(function (err, res) {

                                });
                            });


                        }
                    });
                }
            });
        console.log('new offer' + JSON.stringify(offer));

    });
    var that = this;

    this.bot.connect(function (Error) {
        if (Error) {
            that.status = Error.message;
        } else {
            that.status = 'loginin';
        }
        cback(Error);

        // console.log('bot ok!');
    });

};
module.exports = SomeBot;