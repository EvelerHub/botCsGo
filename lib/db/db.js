/**
 * Created by Vafle on 10/31/2015.
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/db');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {

});

module.exports = {conn:db,mongoose:mongoose};