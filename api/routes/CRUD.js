/**
 * Created by Vafle on 10/31/2015.
 */
var CRUD = function (db, fieldsToHide) {
    this.db = db;
    this.fieldsToHide = fieldsToHide;
};
CRUD.prototype.readById = function (obj, id, cback) {
    var Scheme = obj.getScheme(this.db.mongoose);
    Scheme.findById(id, function (err, res) {
        cback(err, res);
    });
};
CRUD.prototype.list = function (obj, filterOption, cback) {
    var Scheme = obj.getScheme(this.db.mongoose);

    Scheme.find(filterOption, function (err, res) {
        cback(err, res);
    });
};

module.exports = CRUD;