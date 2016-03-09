/**
 * Created by Vafle on 11/4/2015.
 */
var API = require("./Api");

var MarketItem = (require("../../lib/db/schemes")).MarketItem;
var Schemes = (require("../../lib/db/schemes"));
var async = require('async');


var task1 = function(cback)
{
    return cback();
    api.LoadDB(function(err,res){
        if(!err && res && res.length>0){
            var scheme = MarketItem.getScheme();
            res.forEach(function(item){
                scheme.update({"data.c_classid":item.c_classid,
                    "data.c_instanceid":item.c_instanceid},{ updateTime:MarketItem.util.getTime(),
                    data:item},{upsert:true,new: true},function(err,res){
                    //console.log(err);

                });

            });
            cback();
        }else{
            cback();
        }
    });
};


//waiting delivery - Ждем пока апи отправит предмет
//waiting to accept bot - Ждем пока наш бот получит
module.exports = function(apikey)
{
    var api = new API(apikey);
    //console.log(JSON.stringify(bot));
    var taskRemovebadTraids = function(cback)
    {
        console.log('remove bad traids');
        var Scheme = Schemes.MarketClaim.getScheme();
        var scheme = new Scheme();
        var that = this;
        Scheme.find({status:{$in : ["waiting delivery","waiting to accept bot"]}}
            ,function(err,trades){
                api.MyTrades(function(err,dota2market_trades){
                    if(err || !dota2market_trades || dota2market_trades.error) return cback(err);
                    trades.forEach(function(trade){
                        var res = dota2market_trades.filter(function(dota2markte_trade){
                            return dota2markte_trade.ui_id == trade.id;
                        });
                        if(res.length==0){
                            Scheme.update({_id:trade._id},{status:"broken",
                                updateDate:Schemes.MarketClaim.util.getTime()});
                        }

                    });
                    cback();
                });
            });
    };
    var taskConfirmTrade = function(cback)
    {
        console.log('confirm trades');
        var Scheme = Schemes.MarketClaim.getScheme();
        var scheme = new  Scheme();
        api.ConfirmAllTrades(function(errs,ress){
            if(Array.isArray(errs)){
                errs.forEach(function(curerr){
                    if(curerr.id)
                        Scheme.update({id:curerr.id},{$set:{updateTime:
                            scheme.util.getTime(),
                            status:"broken"}},{upsert:true,new: true});

                });
            }
            if(Array.isArray(ress)){
                ress.forEach(function(curres){
                    if(curres && curres.id)
                        Scheme.update({id:curres.id},
                            {$set:{status:"waiting to accept bot", updateDate:Schemes.MarketClaim.util.getTime()},
                                $push:{"confirmInfo":Schemes.MarketClaim.util.push("waiting to accept bot",curres)}},{upsert:true},
                            function(ERR,RES){
                                console.log(RES);

                            });
                });
            }
            cback();
        });
    };
    return [taskRemovebadTraids,taskConfirmTrade];
};



/*
async.forever(function(next){
   setTimeout(function(){
        async.series([task1,taskRemovebadTraids,task2],function(err,res){
            console.log(err);
            console.log(res);
            next();
        });
    },60000);

},function(err){

});
*/
