var fs = require("fs")
var _ = require("underscore")
var Concepts = require("./concepts")
var InstanceStore = require("./instance_store")
function getPathForConceptInstances(project_path, concept) {
    return project_path + "/instances/" + concept.name;
}
var Reader = (function () {
    function Reader(project_path) {
        this.project_path = project_path;
    }
    Reader.prototype.readInstances = function (concepts) {
        var self = this;
        var store = new InstanceStore.Store();
        _.each(concepts, function (concept) {
            var path = getPathForConceptInstances(self.project_path, concept);
            var instances = fs.readdirSync(path);
            _.each(instances, function (instance) {
                var instance_txt = fs.readFileSync(path + "/" + instance, "utf-8");
                var i = self.createInstanceFromString(concept, instance_txt);
                store.add(i);
            });
        });
        return store;
    };
    Reader.prototype.createInstanceFromString = function (concept, body) {
        return new Concepts.ConceptInstance(concept, JSON.parse(body));
    };
    return Reader;
})();
exports.Reader = Reader;
var Writer = (function () {
    function Writer(project_path) {
        this.project_path = project_path;
    }
    Writer.prototype.writeInstance = function (instance) {
        var path = getPathForConceptInstances(this.project_path, instance.concept);
        var filename = this.cleanName(instance.getListLabel());
        fs.writeFileSync(path + "/" + filename + ".spiral", JSON.stringify(instance.values));
    };
    Writer.prototype.cleanName = function (name) {
        return name.replace(new RegExp("/", "g"), "_");
    };
    return Writer;
})();
exports.Writer = Writer;

