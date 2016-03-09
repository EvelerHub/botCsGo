/**
 * Created by Vafle on 10/31/2015.
 */
var TradeOfferBot = require('./TradeOfferBot');
var TradeScheme = require('../db/schemes').TradeClaim;
var ItemScheme  = require('../db/schemes').Item;
var Scheme = TradeScheme.getScheme();
var TradeBotTasks = require("./Tasks");
var Schemes  = require('../db/schemes');
var db = require('../db/db.js');
var myName = "Bot1377";

var mongoose = require('mongoose');
var async = require('async');


/*
Scheme.find({status:"valid"}).populate('items').exec(function(err,trades){
    console.log(trades);

});
*/
//return;



var bot = new TradeOfferBot(1000 * 60 *30,"3F6FA12A0F4A512AD094CE7B906F60CC"
    ,[],"arturione","sokol1524");
var tasks = {
    delay :5000,
    tasks:TradeBotTasks(myName,bot),
    onEnd:function(){}
};
bot.setTasks(tasks);
bot.on('newInputOffer',function(offer){
    var getTime = function()
    {
        return  new Date().toISOString();
    };
    var Scheme =   Schemes.MarketClaim.getScheme();
    Scheme.find({$where:"var last=this.confirmInfo.pop();return last && last.data && last.data.secret=='"+
        offer.message+"'   &&  last.data.trade=='"+offer.tradeofferid+"'"}
       ,function(err,res){
            if(!err && res && res.length==1 && res[0].id){

                bot.offers.acceptOffer({
                    tradeOfferId: offer.tradeofferid
                }, function (error, result) {
                    if(!error){

                        Scheme.update({id:res[0].id},
                            {$set:{status:"Done", updateDate:getTime()},
                                $push:{confirmInfo:{date:getTime(),
                                    message:"Done",data:result}}},{upsert:true},
                            function(ERR,RES){
                                console.log(RES);
                              //  cback();
                            });
                        offer.items_to_receive.forEach(function(e){
                            var Item = ItemScheme.getScheme();
                            var item = new Item({
                                classid: e.classid,
                                assetId: e.id,//undefined
                                contextid: e.contextid,
                                instanceid: e.instanceid,
                                botMessages:[]
                            });
                            item.save(function(err,res){

                            });
                        });


                    }
                });
            }
        });
    console.log('new offer'+JSON.stringify(offer));

});
bot.connect(function(Error){
    console.log(Error);
    if(Error) return;
   console.log('bot ok!');
    if(true)
        return;
     bot.offers.loadMyInventory({appId:730,contextId:2,tradableOnly:true},
        function(err,res) {
            if (!res) {

            }
            console.log("items received from inventory" + res.length);

            res.forEach(function(e){
                var Item = ItemScheme.getScheme();
                var item = new Item({
                    classid: e.classid,
                    icon_url: e.icon_url,
                    assetId: e.id,
                    type: e.type,
                    name: e.market_hash_name,
                    contextid: e.contextid,
                    botMessages:[]
                });
                item.save(function(err,res){
                    console.log(err);
                });
            });
        });
});