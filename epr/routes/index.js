var express = require('express');
var router = express.Router();
var scmApi = null;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/find',function(req,res,next){
    if(scmApi==null) res.render('index', { title: 'Express' });
    next();
});//find/2
router.get('/find/:text',function(req,res,next){
    var items = [];
    scmApi.findItem(req.params.text,function(err,itms){
       if(!err) items = itms;
        res.render('search', { title: req.params.text,items:items });
    });
});
router.get('/item',function(req,res){
    var items = [];
    scmApi.getItem(req.query.text,req.query.game,function(err,itms){
        if(!err) items = itms;
        res.render('search', { title: req.params.text,items:items });
    });
});

module.exports = function(SCMApi)
{
    scmApi = SCMApi;
    return router;
};

