/**
 * Created by Vafle on 10/25/2015.
 */
var LoginProt = require('./lib/steam/Login');
var Login = new LoginProt();
var SteamCommunityAPI = require('./lib/steam/API');



var readline = require('readline');

var request = require('request');
var fs = require('fs');

//Login.setAuthCode("BJR4Y");
Login.on("AccountLogonDenied",function(resp){
    console.log('Enter auth code:');
});

Login.doLogin(function(resp,cookie){
   console.log(JSON.stringify(cookie));
    var steamCommunityMarketApi = new SteamCommunityAPI(cookie);
   /* steamCommunityMarketApi.findItem("Inscribed Demon Eater",function(error,items, response, body){
        console.log(items);
    });*/
    steamCommunityMarketApi.getItem("Inscribed Demon Eater","Dota 2",
        function(error,items, response, body){

    });
});

