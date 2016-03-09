/**
 * Created by Vafle on 12/1/2015.
 */
var BotScheme = (require("../../../lib/db/schemes")).Bot;
module.exports.apibot = function()
{
    return function(req,resp,next){
        if(!req.body.name){
            return resp.send('need bot name');
        }
        var Scheme = BotScheme.getScheme();
        Scheme.findOne({name:req.body.name},function(err,res){
            if(err || !res){
                return resp.send('cant find bot');
            }
            req.apikey = res.dota2marketKey;
            if(!req.apikey){
                return resp.send('api key empty!');
            }
            next();
        });
    }
};