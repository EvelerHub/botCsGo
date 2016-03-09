var util = require('../util');
var mongoose = require('mongoose');
var TradeClaim = {
    structure: {
        status: String,

        steamUser: {accessToken: String, partnerAccountId: String, steamId: String},

        create: {type: Date, default: Date.now},
        update: {type: Date, default: Date.now},
        items: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Items',
            required: true/*,
             unique:true*/
        }],
        botMessage: [mongoose.Schema.Types.Mixed]
    },
    name: "TradeClaim",
    scheme: null,
    getScheme: getScheme.bind(this)
};

var Items = {
    structure: {
        name: String,
        bot: String,
        assetId: String,
        link: String,
        price: Number,
        classid: String,
        contextid: String,
        icon_url: String,
        type: String,
        instanceid: String,
        sold: {type: Boolean, default: false}
    },
    name: "Items",
    scheme: null,
    getScheme: getScheme.bind(this)
};

var MarketItem = {
    structure: {
        updateTime: {type: Date, default: Date.now},
        data: mongoose.Schema.Types.Mixed
    },
    name: "MarketItem",
    scheme: null,
    getScheme: getScheme.bind(this)
};

var MarketClaim = {
    structure: {
        id: String,
        status: {type: String, default: "new"},
        confirmInfo: [mongoose.Schema.Types.Mixed],
        updateDate: {type: Date, default: Date.now},
        dateAdded: {type: Date, default: Date.now}
    },
    name: "MarketClaim",
    scheme: null,
    getScheme: getScheme.bind(this)
};

var Bot = {
    structure: {
        status: {type: String, default: "new"},
        name: {type: String, unique: true},
        updateDate: {type: Date, default: Date.now},
        dateAdded: {type: Date, default: Date.now},
        login: {type: String, unique: true},
        pass: {type: String, required: true},
        dota2marketKey: {type: String, required: true},
        steamKey: {type: String, required: true},
        authCode: String,
        error: String,
        message: String
    },
    name: "Bots",
    scheme: null,
    getScheme: getScheme.bind(this)
};

function getScheme() {
    if (this.scheme) return this.scheme;
    return mongoose.model(this.name, this.scheme);
}

var schemes = [TradeClaim, Items, MarketItem, MarketClaim, Bot];

function initDB() {
    var db = require("./db.js");
    var Schema = db.mongoose.Schema;
    schemes.forEach(function (e) {
        var sc = new Schema(e.structure);
        sc.statics.findAndModify = function (query, sort, doc, options, callback) {
            return this.collection.findAndModify(query, sort, doc, options, callback);
        };
        e.scheme = db.mongoose.model(e.name, sc);
        e.getScheme = getScheme.bind(e);
        e.util = util;
    });

}

initDB();


///*
//Items.getScheme().find({"assetId" : "7422562957"},function(err,items){
//    items.forEach(function(item){
//        item.sold = true;
//        item.save();
//    });
//});
//*/

module.exports.Bot = Bot;
module.exports.Item = Items;
module.exports.TradeClaim = TradeClaim;
module.exports.MarketItem = MarketItem;
module.exports.MarketClaim = MarketClaim;
