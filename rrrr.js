/**
 * Created by Vafle on 11/10/2015.
 */



    return;

    var webdriverio = require('webdriverio');
    var options = {
        desiredCapabilities: {
            browserName: 'firefox'
        }
    };
    var client = webdriverio.remote(options);
    client
        .init()
        .url('https://docs.google.com/forms/d/1k51uLETh7BBUVYYWGmx8J14WQ5woa8EzVMLkmXFDL04/viewform')
        .click("#group_1474871400_17")
        .click("#ss-submit");
   // while(true)
        client.refresh();











return;


var re = require('request');
var async = require('async');
var p = 0;
var cookie = re.cookie('NID=3CL3vcF1PdAUQsMOU7kEjhhmE39v3PraJv-34cJnjxxNHRYigVw6;spreadsheet_forms=jC1wSXlIs9WSGhlPxUjo-g=/forms/d/1k51uLETh7BBUVYYWGmx8J14WQ5woa8EzVMLkmXFDL04;');
var j = re.jar();
var webdriverio = require('webdriverio');
var options = {
    desiredCapabilities: {
        browserName: 'chrome'
    },
    host: 'localhost',
    port: 4444
};
var client = webdriverio.remote(options);
client
    .init()
    .url('http://vk.com/away.php?to=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2F1k51uLETh7BBUVYYWGmx8J14WQ5woa8EzVMLkmXFDL04%2FformResponse')
    .click("#group_1474871400_17")
    .click("#ss-submit");
/*async.forever(function(next){
    p++;
    console.log(p);
    var url = "https://docs.google.com/forms/d/1k51uLETh7BBUVYYWGmx8J14WQ5woa8EzVMLkmXFDL04/formResponse";
    re({url: url, jar: j}, function(error, response, body) {
       // console.log(body);
        next();
    });
});*/

