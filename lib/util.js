/**
 * Created by Vafle on 11/5/2015.
 */
var util = {
  getTime:function()
  {
      return  new Date().toISOString();
  },
    getSkipTime:function()
    {
        return new Date(new Date().getTime() + 60000*3).toISOString();
    },
    push: function(message,data)
    {
        //"waiting to accept bot"
        //"confirmInfo"
        return {date:new Date().toISOString(),
            message:message,data:data};
    }
};
module.exports = util;