/**
 * Created by Vafle on 10/25/2015.
 */
var util = require('util');
var SteamRequest = new (require('./SteamRequest'))();
var cheerio = require('cheerio');
var API = function (cookies) {
    this.cookies = cookies;
};
API.prototype.setCookie = function (cookies) {
    this.cookies = cookies;
};
var methods = {
    "BuyItem": {"url": SteamRequest.getMainUrl() + "buylisting/%s", "requestType": "post"},//+ID
    "FindItem": {
        "url": SteamRequest.getMainUrl() + "search/render/?query=%s&start=%s&count=%s",
        "requestType": "get", "refferer": undefined
    },
    "GetItem": {
        "url": SteamRequest.getMainUrl() + "/listings/%s/%s/render/?query=&start=%s&count=%s&language=%s&currency=%s",
        "requestType": "get", "refferer": undefined
    }
};

API.prototype.getItem = function (item_hash_name, game, cback) {
    var start = 0, count = 30, currency = 1, lang = 'english';
    var method = methods.GetItem;
    var url = util.format(method.url, this.getGameCode(game), item_hash_name,
        start, count, currency, lang);
    SteamRequest.CreateRequest(url, undefined, method.refferer,
        method.requestType, this.cookies, function (error, response, body) {

            if (error) return cback(error, null, response, body);
            var html = JSON.parse(body).results_html;
            $ = cheerio.load(html);

            cback(error, parseItems($, '.market_listing_price_with_fee')
                , response, body);
        });
};
API.prototype.getGameCode = function (game) {
    if (game == "Counter-Strike: Global Offensive") {
        return "730"
    } else if (game == "Dota 2") {
        return "570";
    } else {
        return "753";//steam
    }
};

function parseItems($, priceSelector) {
    var row = $(".market_listing_row");
    return row.map(function () {
        var name = $(this).find('.market_listing_item_name_block  .market_listing_item_name').text();
        var qty = $(this).find('.market_listing_num_listings_qty').text();
        var price = $(this).find(priceSelector).text();
        var img = $(this).find('img').attr('src');
        var game = $(this).find('.market_listing_game_name').text();
        return {name: name, qty: qty, price: price, img: img, game: game};
    }).get();
}
API.prototype.findItem = function (text, cback) {
    var page = 1, pagesize = 20;
    var method = methods.FindItem;
    var url = util.format(method.url, text, page, pagesize);
    SteamRequest.CreateRequest(url, undefined, method.refferer,
        method.requestType, this.cookies, function (error, response, body) {
            if (error) return cback(error, null, response, body);
            var html = JSON.parse(body).results_html;
            $ = cheerio.load(html);

            cback(error, parseItems($, '.market_listing_their_price span span')
                , response, body);
        });
};
module.exports = API;