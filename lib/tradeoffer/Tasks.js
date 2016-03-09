/**
 * Created by Vafle on 11/5/2015.
 */

var TradeScheme = require('../db/schemes').TradeClaim;
var ItemScheme  = require('../db/schemes').Item;
var Scheme = TradeScheme.getScheme();
var async = require('async');
module.exports = function(myName,bot)
{
    var taskSkip = function(callback)
    {
        var Scheme = TradeScheme.getScheme();
        Scheme.findAndModify({$and:[{$where:"return this.botMessage.length>10 && this.botMessage.pop().message!='skip'" +
            ""},
                        {status:'valid'}]},
            [],{$push:{botMessage:{message:'skip',ttime:TradeScheme.util.getSkipTime()}}},{},function(err,res){
                callback();
            });


    };
    var taskRemoveBadTrades = function(callback)
    {
        var Scheme = TradeScheme.getScheme();
        Scheme.findAndModify({ $where: "this.botMessage.length > 25"},

            [],{$set:{status:'broke'}},{},function(err,res){
                callback();
            });
    };

    var taskValidation = function(callback)
    {
        var Scheme = TradeScheme.getScheme();
        Scheme.find({status:"new"},function(err,res){
            if(err || !res || res.length==0) return callback();
            res.forEach(function(trade){
                var valid = false;
                trade.items.forEach(function(item){
                    valid = true;
                });
                if(!valid){
                    trade.status = "invalid";
                }else{
                    trade.status = "valid";
                }
                trade.update = Date.now();
                trade.save();
            });
            callback();
        });
    };
    var taskValidationBotItem = function(callback)
    {
        var Scheme = TradeScheme.getScheme();
        Scheme.find({status:"valid"}).populate('items').exec(function(err,trades){


            if(err || !trades ||trades.length==0) return callback(err,trades);

            bot.offers.loadMyInventory({appId:730,contextId:2,tradableOnly:true},
                function(err,res) {
                    if (err || !res || res.length==0) return callback();
                    console.log("items received from inventory" + res.length);
                    var usedItems = [];
                    var myItems = {};
                    res.forEach(function(inventItem){
                        myItems[inventItem.classid+"-"+inventItem.contextid] = inventItem;
                    });
                    var createClosure = function(trade)
                    {
                        return function(cback){
                            var last = trade.botMessage.slice(-1)[0];
                            if(last.message='skip'
                                && new Date().getTime()<Date.parse(last.ttime)){
                                console.log('skip :*(');
                                return cback();

                            }

                            if(trade.items.length==0) return;
                            var valid = true;
                            var itemsToSend  = [];
                            trade.items.forEach(function(item){
                                if(!myItems[item.classid+"-"+item.contextid]
                                    || usedItems[item._id]){
                                    valid = false;
                                }else{
                                    itemsToSend.push(myItems[item.classid+"-"+item.contextid]);
                                   // Соранять у преметов assestid без них мы не сможем делать обмен
                                }
                            });
                            if(valid){
                                trade.items.forEach(function(tradeItem){
                                    var inventItems = itemsToSend.filter(function(item_to_send){
                                        return tradeItem.classid==item_to_send.classid &&
                                            tradeItem.contextid == item_to_send.contextid;
                                    });

                                    if(inventItems.length==0){
                                        valid = false;
                                    }else{
                                        tradeItem.assetId = inventItems[0].id;
                                        tradeItem.save(function(err,res){
                                            console.log(err);
                                        });
                                    }
                                });


                                if(!valid) return;
                                Scheme.findAndModify({_id:trade._id,
                                        status:"valid"},[],{$set:{status:"waitng to send"},
                                        $push:{botMessage:{date:new Date().toISOString(),name:myName,message:"waiting to send"}}},{},
                                    function(err,res){
                                        console.log(JSON.stringify(err));
                                        console.log(JSON.stringify(res));

                                        if(!err && res.ok && res.value){
                                            res.value.items.forEach(function(curitem){
                                                usedItems.push(curitem._id);
                                            });
                                        }
                                        cback();
                                    });
                            }else{
                                cback();
                            }
                        };
                    };
                    var tasks = trades.map(function(trade){
                        return createClosure(trade);
                    });

                    async.series(tasks,function(errs,resls){
                        callback();
                    });
                });
        });
    };
    var taskCreateTrade = function(callback)
    {
        //return callback();
        var Scheme = TradeScheme.getScheme();
        Scheme.find({$where:"var last=this.botMessage.pop(),status = this.status;return (last.name=='"+myName+"') && (last.message=='waiting to send') && (status=='waitng to send')"})
            .populate('items').exec(function(err,res){
                if(err || !res || res.length==0) return callback();
                var createClosure = function(trade)
                {
                    return function(cback)
                    {
                        //   return cback();
                        if(trade.items.length==0  ) return cback();
                        var ITMs = trade.items.map(function(itm){
                            return{
                                "appid": "730",
                                "contextid": itm.contextid,
                                "amount": 1,
                                "assetid": itm.assetId
                            }
                        });
                        var dta = {
                            itemsFromMe:ITMs,
                            itemsFromThem:[],
                            accessToken: trade.steamUser.accessToken,
                            partnerAccountId:trade.steamUser.partnerAccountId
                        };
                        bot.offers.makeOffer(dta,function(err,res){
                            if(err || !res || !res.tradeofferid){
                                trade.status="valid";
                                trade.botMessage.push({date:new Date().toISOString(),name:myName,message:"error can create claim steam fail"});
                                trade.save(function(err,res){
                                    //CARE AKTA FOOL
                                    return cback(err,res);
                                });

                            }else{


                                trade.status="done";
                                trade.botMessage.push({date:new Date().toISOString(),name:myName,message:"done!",tradeId:res.tradeofferid});
                                trade.save(function(err,res){
                                    //CARE AKTA FOOL
                                    cback();
                                });
                                trade.items.forEach(function(item){
                                    item.sold = true;
                                    item.save(function (e,r) {
                                        console.log(e);
                                    });
                                });

                            }
                        });
                    };

                };
                var tasks = res.map(function(trade){
                    return createClosure(trade);
                });
                async.series(tasks,function(err,res){
                    console.log("create new trade!!!");
                    callback(err,res);
                });
            });
    };
    return [taskRemoveBadTrades,taskSkip,taskValidation,
       taskValidationBotItem,
       taskCreateTrade ];
};