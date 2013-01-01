var fs = require("fs")
var _ = require("underscore")
var Concepts = require("./concepts")
var InstanceStore = require("./instance_store")
var Reader = (function () {
    function Reader(project_path) {
        this.project_path = project_path;
    }
    Reader.prototype.readInstances = function (concepts) {
        var self = this;
        var store = new InstanceStore.Store();
        _.each(concepts, function (concept) {
            var path = self.project_path + "/" + concept.name;
            var instances = fs.readdirSync(path);
            _.each(instances, function (instance) {
                var instance_txt = fs.readFileSync(path + "/" + instance, "utf-8");
                var i = self.createInstanceFromString(concept, instance_txt);
                store.add(i);
            });
            console.log(instances);
        });
        return store;
    };
    Reader.prototype.createInstanceFromString = function (concept, body) {
        return new Concepts.ConceptInstance(concept, JSON.parse(body));
    };
    return Reader;
})();
exports.Reader = Reader;

