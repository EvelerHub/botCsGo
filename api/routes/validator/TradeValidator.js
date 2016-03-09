/**
 * Created by Vafle on 10/31/2015.
 */

var ItemScheme = (require("../../../lib/db/schemes")).Item;
Array.prototype.getUnique = function(){
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
        if(u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
};
Array.prototype.isUnique = function(){
    var u = {}, a = [];
    for(var i = 0, l = this.length; i < l; ++i){
        if(u.hasOwnProperty(this[i])) {
            return false;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return true;
};
module.exports.post  = function()
{
    //steamUser:{accessToken:String,partnerAccountId:String}
  return function(req,resp,next){
      if(!req.body.steam_user || !req.body.steam_user.access_token ||
          !req.body.steam_user.partner_account_id
          || !req.body.steam_user.steamid || !req.body.items){
          return resp.send(error("empty body"));
      }
      if(!req.body.items.isUnique()) return resp.send(error("need uniq ids"));
      //if(db.connection.findById())
      var Scheme = ItemScheme.getScheme();
      Scheme.find({ $and : [{_id:{ $all :[req.body.items]}},{sold:false}]}
          ,function(err,res){
            if(err || !res || res.length==0) return resp.send(error("nad ids"));
          req.itms = res;
          next();
      });


  };
};

function error(text)
{
    return {error:true,text:text};
}