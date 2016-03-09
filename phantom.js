/**
 * Created by Vafle on 11/11/2015.
 */
//console.log('Loading a web page');
var url = 'https://docs.google.com/forms/d/1k51uLETh7BBUVYYWGmx8J14WQ5woa8EzVMLkmXFDL04/viewform';
var async =  require('async');
var i=0;
var p = function(cback)
{
    var page = require('webpage').create();
    page.open(url, function (status) {
        var title = page.evaluate(function () {
            return document.title;
        });
      //  console.log(title);

        //Page is loaded!
        if(status!='success'){
            setTimeout(function(){
                cback();
            },60000);
            return;
        }
        console.log(status+"  "+i++);
        page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {
            page.evaluate(function () {
                //$("button").click();
                $("#group_1474871400_17").click();

                $("#ss-submit").click();

            });

            window.setTimeout(function () {
                // page.render("test.png");
                setTimeout(function () {
                    phantom.exit();
                    cback();
                }, 0);
            }, 1000); // Change timeout as required to allow sufficient time
//


        });


    });

};
p();
 //async.forever(p,function(){

 //});