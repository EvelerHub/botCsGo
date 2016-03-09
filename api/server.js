/**
 * Created by Vafle on 10/31/2015.
 */
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var trade_route = require("./routes/trade");
var item_route = require("./routes/items");
var auth_route = require('./routes/auth');
var market_route = require('./routes/market');
var bot_route = require('./routes/bot');

var app = express();
var db = require('../lib/db/db');
var dbObj = {db: db};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/', auth_route(dbObj));
app.use('/trade', trade_route(dbObj));
app.use('/item', item_route(dbObj));
app.use('/market', market_route(dbObj));
app.use('/bot', bot_route(dbObj));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


var server = app.listen(3000, function () {
    var address = server.address();

    var family = address.family;
    var host = address.address;
    var port = server.address().port;

    console.log('Server listening at host : %s, port : %s, family : %s', host, port, family);
});