/**
 * Created by Vafle on 10/31/2015.
 */
var express = require('express');
var TradeScheme = (require("../../lib/db/schemes")).TradeClaim;
var router = express.Router();
var db;
var CRUD;
var validator = require('./validator/TradeValidator');
module.exports = function (data) {
    db = data.db;
    CRUD = new (require('./CRUD'))(data.db);
    return router;
};
router.get('/:id', function (req, res, next) {
    if (!req.params.id) return;
    CRUD.readById(TradeScheme, req.params.id, function (err, trade) {
        if (err) return next(err);
        res.send(trade);
    });
});
router.get('/', function (req, res, next) {
    CRUD.list(TradeScheme, function (err, data) {
        res.send(data);
    });
});
router.post('/',
    validator.post(),
    function (req, res, next) {
        var ids = req.itms.map(function (e) {
            return e._id;
        });

        var Trade = TradeScheme.getScheme(db.mongoose);
        var trade = new Trade({
            status: "new",
            steamUser: {
                accessToken: req.body.steam_user.access_token,
                partnerAccountId: req.body.steam_user.partner_account_id,
                steamId: req.body.steam_user.steamid
            },
            items: ids

        });
        trade.save(function (err, data) {
            if (err) return next(err.errmsg);
            res.send(data);
        });
    });
router.use('/', function (req, res, next) {
    res.send('internal err');
});