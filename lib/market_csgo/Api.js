/**
 * Created by Vafle on 11/3/2015.
 */
var csv = require('csv');
var request = require('request');
var util = require('util');
var async = require('async');
var API = function(key)
{
    this.key = key;
    this.app = "730";
    this.url = 'https://market.csgo.com/';

    // /api/Buy/[classid]_[instanceid]/[price]/[hash]/?key=[your_secret_key]
    this.buy_url = this.url+"api/Buy/%s_%s/%s/%s/?key="+key;
    this.trades_url = this.url+"api/Trades/?key="+key;
    this.itemrequest_url = this.url+"api/ItemRequest/out/%s/?key="+key;
    this.delay_resp = 335;
};
API.prototype.LoadDB = function(cback)
{
    var url = this.url;
    request(this.url+'itemdb/current_730.json', function (error, response, body) {
        if (!error && response.statusCode == 200 && (db_url = JSON.parse(body)) && db_url.db ) {
            var notFirstRow = false;
            var parser = csv.parse({delimiter: ';'}, function(err,data) {
                if(err) return cback(err);
                if(!data || data.length==0) return cback(new Error());
                var result = [];
                var structure = [];
                data.forEach(function(elem){
                    if (!notFirstRow && (notFirstRow = true)){
                        structure = elem.map(function(struct){
                           return struct;
                        });
                        return;
                    }
                    if(!elem || elem.length==0 || elem.length!=structure.length) return;
                    var newElement = {};
                    for(var i=0;i<elem.length;i++){
                       newElement[structure[i]] = elem[i];
                    }
                    result.push(newElement);
                });
                cback(null,result);
            });
            request(url+'itemdb/'+db_url.db)
                .pipe(parser);


        }else{
            cback(new Error());
        }
    });
};
API.prototype.BuyItem = function(classid,instanceid,minpricetax,cback)
{
    var that = this;
    this.ItemInfo(classid,instanceid,function(err,res){
       if(err) return cback(err,null);
        if(!res || res.error ||!res.hash || !res.min_price) return cback(new Error());
        var hash = res.hash;
        var min_price = minpricetax+parseInt(res.min_price);

        request(util.format(that.buy_url,classid,instanceid,min_price,hash),
            function (error, response, body) {
                if (!error && response.statusCode == 200){
                    //console.log(body);
                    cback(null,JSON.parse(body));
                }else{
                    cback(new Error());
                }
            });

    });
};

API.prototype.ItemInfo = function(classid,instanceid,cback) {

    var u = this.url + "api/ItemInfo/"
        + classid  + "_" + instanceid + "/en/?key=1";
    request(u, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cback(null, JSON.parse(body));
        } else {
            cback(new Error());
        }
    });
};
API.prototype.MyTrades = function(cback)
{
    request(this.trades_url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cback(null, JSON.parse(body));
        } else {
            cback(new Error());
        }
    });
};
API.prototype.ConfirmTrade = function(botid,cback) {
    request(util.format(this.itemrequest_url,botid), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            cback(null, JSON.parse(body));
        } else {
            cback(new Error());
        }
    });

};
API.prototype.ReadyTrades = function(cback)
{
    this.MyTrades(function(err,res){
        if(err || !res || res.error)return cback(err);

        cback(null,res.filter(function(trade){
            return trade.ui_status == "4" || trade.ui_status==4;
        }));
    });
};
API.prototype.ConfirmAllTrades = function(callback)
{
    var that = this;
    var createClosure = function(trade){
        return function(cback)
        {
            that.ConfirmTrade(trade.ui_bid,function(err,res){
                if(err) return cback({id:trade.ui_id,err:err});
                if(!res || res.error || !res.success) return cback({id:trade.ui_id});
                setTimeout(function(){
                    res.id = trade.ui_id;
                    cback(null,res);
                },that.delay_resp);
            });
        };
    };
    that.ReadyTrades(function(err,res){
        if(!err && res && !res.error){
            // console.log(res);
            //Confirm only 1 trade(!IMPORTANT)
            if(res.length!=0){
                var newres = [];
                newres.push(res[0]);
                res = newres;
            }
            var funcs = res.map(function(e){
                return createClosure(e);
            });
            async.series(funcs,function(errs,ress){
                callback(errs,ress);
            });
        }else{
            callback(err);
        }
    });
};
//var api = new API("63n2OgM36AHB9C7l41fYQ1LI3YZv3BE");
/*api.LoadDB(function(err,result){

    //4ac614ccf5f4ce5635c8c73c5f38d035
   console.log(err);
});*/
/*api.BuyItem(1272852750,948149725,10,function(err,res){
    console.log(res);
    //{"status":ok,id:1232323"}
});
*/
/*
 { success: true,
 trade: '817605686',
 nick: 'A love Sisi and girls',
 botid: 269846028,
 profile: 'https://steamcommunity.com/profiles/76561198230111756/',
 secret: '789M' }
 */


module.exports = API;