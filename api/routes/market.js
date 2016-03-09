/**
 * Created by Vafle on 11/4/2015.
 */
var express = require('express');
var router = express.Router();
var db;
var CRUD = null;
var MarketScheme =  (require("../../lib/db/schemes")).MarketItem;
var MarketClaimScheme =  (require("../../lib/db/schemes")).MarketClaim;
var API = require('../../lib/market_csgo/Api');
//var api = new API("Ir57KXRbK7hGUByC2467Ys38E3y5ip3");
var apimiddleware = require('./middleware/apimiddleware');
module.exports = function(data)
{
    this.db = data.db;
    CRUD =new (require('./CRUD'))(data.db);
    return router;
};
router.get('/items',function(req,res){
    var filter = req.query;
    if(!req.query)
        filter={};
    CRUD.list(MarketScheme,filter,function(err,data){
        res.send(data);
    });
});
router.get('/claims',function(req,RESPONSE){
    var filter = req.query;
    if(!req.query)
        filter={};
    CRUD.list(MarketClaimScheme,filter,function(err,data){
        RESPONSE.send(data);
    });
});

router.get('/info/item',apimiddleware.apibot(),
    function(req,RESPONSE){
    var api = new API(req.apikey);
    api.ItemInfo(req.query.classid,req.query.instaceid,function(err,res){
       if(err) res.send(err);
        else RESPONSE.send(res);
    });
});


router.get('/buy/confirm',apimiddleware.apibot(),
    function(req,RESPONSE){
    //BOTID -> TRADE ID
    var api = new API(req.apikey);
    api.ReadyTrades(function(err,res){
        if(err) return res.send(err);
        var id = res.filter(function(itm){
           return itm.ui_bid == req.query.botid;
        });
        if(!id || id.length==0) return res.send({error:true,"message":"this trade not ready"});
        id=id[0].ui_id;

        api.ConfirmTrade(req.query.botid,function(err,res){
            if(err) return res.send(err);
            if(res && res.success && res.trade && res.profile && res.secret){
                var Scheme = MarketClaimScheme.getScheme();
                Scheme.findAndModify({id:id},[],
                    {$set:{status:"waiting to accept bot", updateDate:new Date().toISOString()},
                    $push:{confirmInfo:{date:new Date().toISOString(),
                        message:"waiting to accept bot",data:res}}},{upsert:true}
                    ,function(ERR,R){
                    RESPONSE.send(res);
                });
            }

        });
    });
});



router.get('/buy/status',apimiddleware.apibot(),
    function(req,RESPONSE){
    var api = new API(req.apikey);
    api.ReadyTrades(function(err,res){
        if(err) res.send(err);
        else RESPONSE.send(res);
    });
});
router.post('/buy',apimiddleware.apibot(),
    function(req,resp){
    var api = new API(req.apikey);
   api.BuyItem(req.body.classid,req.body.instanceid,req.body.min_extra_money,function(err,res){
      if(err) return resp.send(err);
        if(!res.result || res.result!="ok" ||!res.id) return  resp.send(res);
       var Scheme = MarketClaimScheme.getScheme();
       var claim = new Scheme({
            id:res.id,
           status:"waiting delivery"
       });
       claim.save(function(err,res){
           if(!res || err) return resp.send({buyinfo:res,dberror:err});
           resp.send(res);
       });
   });

});