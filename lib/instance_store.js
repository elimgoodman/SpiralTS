var _ = require("underscore")

var Store = (function () {
    function Store() {
        this.instances = [];
    }
    Store.prototype.getByConceptName = function (concept_name) {
        return _.filter(this.instances, function (instance) {
            return instance.concept.name == concept_name;
        });
    };
    Store.prototype.getById = function (instance_id) {
        return _.find(this.instances, function (instance) {
            return instance.id == instance_id;
        });
    };
    Store.prototype.add = function (instance) {
        this.instances.push(instance);
    };
    return Store;
})();
exports.Store = Store;

