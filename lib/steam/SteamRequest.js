/**
 * Created by Vafle on 10/25/2015.
 */
var request = require('request');
var fs = require('fs');
var SteamRequest = function()
{
    this.mainsite = "http://steamcommunity.com/market/";
};

SteamRequest.prototype.getMainUrl = function()
{
    return this.mainsite;
};

SteamRequest.prototype.CreatePostHeaders = function(refferer)
{

    return {
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; rv:38.0) Gecko/20100101 Firefox/38.0',
        'Referer': refferer,
        'ContentType': "application/x-www-form-urlencoded; charset=UTF-8",
        "Accept-Language": "en-US,en;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding": "gzip, deflate",
        "Cache-Control": "no-cache"
    };
};

SteamRequest.prototype.CreatePost = function(url,data,refferer,cookie,cback)
{
    this.CreateRequest(url,data,refferer,"post",cookie,cback);
};
SteamRequest.prototype.CreateGet  = function(url,data,refferer,cookie,cback)
{
   this.CreateRequest(url,data,refferer,"get",cookie,cback);
};
SteamRequest.prototype.CreateRequest = function(url,data,refferer,requestType,cookie,cback){
    console.log('request to : '+url);
    var headers = this.CreatePostHeaders(refferer);
    //var request = request.defaults({jar: cookie});
    var j = request.jar();
    console.log(cookie);
    j.setCookie(cookie.join(';'),this.getMainUrl());
    request({
        method:requestType,
        headers:requestType=="get"? undefined:headers,
        uri:url,
        jar:j
    },cback).pipe(fs.createWriteStream('a1.json'));
};
module.exports = SteamRequest;