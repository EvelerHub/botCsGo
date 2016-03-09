/**
 * Created by Vafle on 10/28/2015.
 */

var fs = require('fs');
var crypto = require('crypto');
var async = require('async');
var Steam = require('steam');
var SteamWebLogOn = require('steam-weblogon');
var SteamTradeOffers = require('steam-tradeoffers');
var Login = require('../steam/Login');
var appid = 730;
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var TradeOfferBot = function (timeoutReconnect, APIKEY, tasks, login, pass, authcode) {

    this.stopping = false;
    this.APIKEY = APIKEY;
    this.login = new Login(login, pass);
    if (authcode != "")
        this.login.setAuthCode(authcode);
    this.timeoutReconnect = timeoutReconnect;
    //  this.APIKey = APIKEY;
    this.tasks = tasks || {};
};

util.inherits(TradeOfferBot, EventEmitter);

TradeOfferBot.prototype.setTasks = function (tasks) {
    this.tasks = tasks;
};

TradeOfferBot.prototype.deleteBot = function (cback) {
    this.login.deleteme(cback);
};

TradeOfferBot.prototype.connectTimeout = null;

TradeOfferBot.prototype.onConnect = function (err) {
    var self = this;
    var waitRestart = false;

    var create = function () {
        async.series(self.tasks.tasks, function (err, res) {
            if (self.tasks.onEnd)
                self.tasks.onEnd();
            setTimeout(function () {

                console.log('PING');
                if (!waitRestart && !self.stopping)
                    create();
            }, self.tasks.delay);
        });
    };


    if (!err) {
        if (!waitRestart && !self.stopping) {
            create();
        }
        this.connectTimeout = setTimeout(function () {
            log('reconnect!');
            waitRestart = true;
            self.connect(null);
        }, self.timeoutReconnect);//30 min reconnect
    } else {
        setTimeout(function () {
            self.connect(function () {
            });
        }, 1000 * 30);
    }
};
TradeOfferBot.prototype.shutDownTasks = function () {
    console.log('shut downing..');
    this.stopping = true;
};

TradeOfferBot.prototype.disconnect = function () {
    try {
        if (this.connectTimeout)
            this.clearTimeout(this.connectTimeout);
    } catch (e) {
    }

    this.login.disconnect();
};

TradeOfferBot.prototype.connect = function (callback) {
    if (callback)
        this.savedCallback = callback;

    this.login.disconnect();
    this.offers = new SteamTradeOffers();
    var that = this;
    //this.login.setAuthCode("TYP93");
    /*this.login.removeListener('newTradeOffers',tfunc);
     this.login.on('newTradeOffers',tfunc);
     */
    this.login.onOffer = function (number) {
        if (number > 0) {
            that.handleOffers();
        }
    };
    /*this.login.on("AccountLogonDenied",function(resp){
     console.log('Enter auth code:');
     //that.login.enterAuthCode("TYP93");
     that.emit('enterAuthCode');
     if(that.savedCallback)
     that.savedCallback(resp);
     that.onConnect(new Error('need auth code'));
     });*/

    this.login.doLogin(function (error, resp, sessionID, cookie) {
        console.log(JSON.stringify(cookie));
        if (error) {
            return error;
        }
        //steamCommunityMarketApi.setCookie(cookie);
        that.offers.setup({
            sessionID: sessionID,
            webCookie: cookie,
            APIKey: that.APIKEY
        }, function () {
            if (!callback) {
                that.savedCallback()
            } else
                callback();
            that.onConnect(null);
            that.handleOffers();
        });
    });
};

function log(message) {
    console.log(new Date().toString() + ' - ' + message);
    //steamFriends.sendMessage(admin, message.toString());
}

TradeOfferBot.prototype.handleOffers = function () {
    var that = this;
    this.offers.getOffers({
        get_received_offers: 1,
        active_only: 1,
        time_historical_cutoff: Math.round(Date.now() / 1000),
        get_descriptions: 1
    }, function (error, body) {
        if (error) {
            return log(error);
        }

        if (body && body.response && body.response.trade_offers_received) {
            var descriptions = {};
            /* body.response.descriptions.forEach(function (desc) {
             descriptions[desc.appid + ';' + desc.classid + ';' + desc.instanceid] = desc;
             });*/
            body.response.trade_offers_received.forEach(function (offer) {
                if (offer.trade_offer_state !== 2) {
                    return;
                }
                that.emit('newInputOffer', offer);
                var offerMessage = 'Got an offer ' + offer.tradeofferid +
                    ' from ' + offer.steamid_other + '\n';
                log(offerMessage);
            });
        }
    });
};

module.exports = TradeOfferBot;

