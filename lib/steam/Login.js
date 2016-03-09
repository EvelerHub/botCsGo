/**
 * Created by Vafle on 10/25/2015.
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var fs = require('fs');
var Steam = require('steam');
var crypto = require('crypto');
var SteamWebLogOn = require('steam-weblogon');

function getSHA1(bytes) {
    var shasum = crypto.createHash('sha1');
    shasum.end(bytes);
    return shasum.read();
}

var Login = function (login, pass) {
    this.logOnOptions = {
        account_name: login,
        password: pass
    };
    console.log(this.logOnOptions);

    this.steamClient = new Steam.SteamClient();
    this.steamUser = new Steam.SteamUser(this.steamClient);

    this.steamFriends = new Steam.SteamFriends(this.steamClient);
    this.steamWebLogOn = new SteamWebLogOn(this.steamClient, this.steamUser);
};

util.inherits(Login, EventEmitter);
Login.prototype.deleteme = function (cback) {
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    var sentryFileName = this.logOnOptions.account_name + ".sentry";
    this.disconnect();
    var fs = require('fs');
    fs.rename(sentryFileName, sentryFileName + guid(), function (err) {
        // if ( err ) console.log('ERROR: ' + err);
        cback(err, res);
    });
};
Login.prototype.setAuthCode = function (authCode) {
    if (authCode !== '') {
        this.logOnOptions.two_factor_code = authCode;
    }
};
Login.prototype.enterAuthCode = function (code, cback) {
    this.setAuthCode(code);
    if (!cback) {
        this.doLogin(this.cbackDologin);
    }
};
Login.prototype.disconnect = function (clback) {
    if (this.steamUser) {
        this.steamUser.removeListener('tradeOffers', this.onOffer);
        // this.removeListener('tradeOffers', this.onOffer);

        this.steamUser.on('updateMachineAuth', function (sentry, callback) {
        });
        //    steamUser.disconnect();
    }
    if (this.steamClient) {
        this.steamClient.on('servers', function (servers) {
        });
        this.steamClient.on('logOnResponse', function (logonResp) {
        });
        this.steamClient.disconnect();

    }

    this.steamClient = new Steam.SteamClient();
    this.steamUser = new Steam.SteamUser(this.steamClient);
    this.steamWebLogOn = new SteamWebLogOn(this.steamClient, this.steamUser);
};
Login.prototype.onOffer = function (number) {

    if (number > 0)
        this.emit('newTradeOffers', number);

};

Login.prototype.logOnResponse = function () {
    console.log("Login#logOnResponse2 is started");
};


Login.prototype.doLogin = function (cback) {
    var sentryFileName = this.logOnOptions.account_name + ".sentry"; // steam guard data file name

    try {
        this.logOnOptions.sha_sentryfile = getSHA1(fs.readFileSync(sentryFileName));
    } catch (e) {
        console.log(e);
    }

    if (fs.existsSync('servers')) {
        Steam.servers = JSON.parse(fs.readFileSync('servers'));
    }

    this.cbackDologin = cback;
    this.steamClient.connect();
    var that = this;

    this.steamClient.on('connected', function () {
        console.log("Login#connected is started");
        that.steamUser.logOn(that.logOnOptions);
    });

    this.steamClient.on('error', function (err) {
        console.log('error!');
        that.emit("someerror", err);
    });

    this.steamUser.on('tradeOffers', that.onOffer);

    this.steamClient.on('logOnResponse', function (logonResp) {
        console.log("Login#logOnResponse is started");
        if (logonResp.eresult === Steam.EResult.OK) {
            console.log('Logged in!');

            // steamFriends.setPersonaState(Steam.EPersonaState.Online);
            that.steamWebLogOn.webLogOn(function (sessionID, newCookie) {
                //console.log(newCookie);
                if (that.cbackDologin) that.cbackDologin(null, logonResp, sessionID, newCookie);
            });

        } else if (logonResp.eresult === Steam.EResult.AccountLogonDenied) {
            // this.emit("AccountLogonDenied",logonResp);
            if (that.cbackDologin) that.cbackDologin(new Error("AccountLogonDenied"));
        } else if (logonResp.eresult === Steam.EResult.InvalidPassword) {
            if (that.cbackDologin) that.cbackDologin(new Error("InvalidPassword"));

        } else if (logonResp.eresult === 65) {
            if (that.cbackDologin) that.cbackDologin(new Error("InvalidCode"));
        }
        else {
            if (that.cbackDologin) that.cbackDologin(new Error("SomeError("
                + logonResp.eresult + ")"));
        }
    });

    this.steamUser.on('updateMachineAuth', function (sentry, callback) {
        console.log("Login#updateMachineAuth is started");
        fs.writeFileSync(sentryFileName, sentry.bytes);
        callback({sha_file: getSHA1(sentry.bytes)});
    });
};


module.exports = Login;

