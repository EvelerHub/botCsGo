/**
 * Created by Vafle on 11/15/2015.
 */

$(function() {
    $(".stopstartbot").click(function(){
        $.post('/bot/'+$(this).data('action'),{name:$(this).data('name')},function(data){
            alert(data);
        }) ;
    });
    $("#addbot").click(function(){
        //var formData = JSON.stringify($("#myForm").serializeArray());
        var dd = {"name":$("#name").val(),"login":$("#login").val(),
            "pass":$("#pass").val(),
            "steam_key":$("#steam_key").val(),"market_key":$("#market_key").val()};
        console.log(dd);

        $.post('/bot',dd).done(
            function( data ) {
                alert(JSON.stringify(data));
            });
    });
});