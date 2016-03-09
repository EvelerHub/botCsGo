/**
 * Created by Vafle on 10/31/2015.
 */
var express = require('express');
var ItemScheme = (require("../../lib/db/schemes")).Item;
var router = express.Router();
var db;
var CRUD;
module.exports = function(data)
{
    db = data.db;
    CRUD =new (require('./CRUD'))(data.db);
    return router;
};

router.get('/:id', function (req, res,next) {
    if(!req.params.id) return;
    CRUD.readById(ItemScheme,req.params.id,function(err,trade){
        if(err) return next(err);
        res.send(trade);
    });
});
router.get('/',function(req,res,next){
   CRUD.list(ItemScheme,function(err,data){
        res.send(data);
   });
});
router.post('/filter',function(req,RES){
    var Item = ItemScheme.getScheme(db.mongoose);
    Item.find(req.body.filter,function(err,res){
        if(err) return RES.send(err);
        RES.send(res);
    });
});
router.post('/',function(req,res,next){
    var Item = ItemScheme.getScheme(db.mongoose);
    var item = new Item({
        name:req.body.name,
        assetId:req.body.assetId,
        price:req.body.price,
        link:req.body.link
    });
    item.save(function(err,data){
        if(err) return next(err);
        res.send(data);
    });
});
