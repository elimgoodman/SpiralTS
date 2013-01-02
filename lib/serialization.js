var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var fs = require("fs")
var _ = require("underscore")
var Concepts = require("./concepts")
var Editors = require("./editors")
var Fields = require("./fields")
var Project = require("./project")

var e = require("jsedn");
function getPathForConceptInstances(project_path, concept) {
    return project_path + "/instances/" + concept.name;
}
var Reference = (function () {
    function Reference(entity_type, id) {
        this.entity_type = entity_type;
        this.id = id;
    }
    return Reference;
})();
function setTagActions() {
    e.setTagAction(new e.Tag('spiral', 'Project', 'Instance'), function (obj) {
        var name = e.atPath(obj, "name");
        var concepts = e.toJS(e.atPath(obj, "concepts"));
        var actions = e.toJS(e.atPath(obj, "actions"));
        return new Project.Project(name, concepts, actions);
    });
    e.setTagAction(new e.Tag('spiral', 'Concept', 'Reference'), function (concept_name) {
        return new Reference('Concept', concept_name);
    });
    e.setTagAction(new e.Tag('spiral', 'Action', 'Instance'), function (obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var body = e.atPath(obj, "body");
        var isValid = e.atPath(obj, "isValid");
        return new Project.Action(name, display_name, body, isValid);
    });
    e.setTagAction(new e.Tag('spiral', 'Fn', "Instance"), function (obj) {
        var params = e.toJS(e.atPath(obj, "params"));
        var modules = e.toJS(e.atPath(obj, "modules"));
        var body = e.atPath(obj, "body");
        return new Project.Fn(params, body, modules);
    });
    e.setTagAction(new e.Tag('spiral', 'Module'), function (obj) {
        var name = e.atPath(obj, "name");
        var alias = e.atPath(obj, "as");
        return new Project.Module(name, alias);
    });
}
exports.setTagActions = setTagActions;
var InstanceReader = (function () {
    function InstanceReader(project_path) {
        this.project_path = project_path;
    }
    InstanceReader.prototype.read = function (concepts) {
        var self = this;
        var store = new Concepts.InstanceStore();
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
    InstanceReader.prototype.createInstanceFromString = function (concept, body) {
        return new Concepts.ConceptInstance(concept, JSON.parse(body));
    };
    return InstanceReader;
})();
exports.InstanceReader = InstanceReader;
var InstanceWriter = (function () {
    function InstanceWriter(project_path) {
        this.project_path = project_path;
    }
    InstanceWriter.prototype.write = function (instance) {
        var path = getPathForConceptInstances(this.project_path, instance.concept);
        var filename = this.cleanName(instance.getListLabel());
        fs.writeFileSync(path + "/" + filename + ".spiral", JSON.stringify(instance.values));
    };
    InstanceWriter.prototype.cleanName = function (name) {
        return name.replace(new RegExp("/", "g"), "_");
    };
    return InstanceWriter;
})();
exports.InstanceWriter = InstanceWriter;
var DefinitionReader = (function () {
    function DefinitionReader(project_path) {
        this.project_path = project_path;
    }
    DefinitionReader.prototype.read = function () {
        setTagActions();
        var store = this.getStore();
        var path = this.project_path + "/" + this.getPathSegment();
        var defs = fs.readdirSync(path);
        _.each(defs, function (instance) {
            var def_txt = fs.readFileSync(path + "/" + instance, "utf-8");
            var i = e.parse(def_txt);
            store.add(i);
        });
        return store;
    };
    DefinitionReader.prototype.getPathSegment = function () {
        return null;
    };
    DefinitionReader.prototype.getStore = function () {
        return null;
    };
    return DefinitionReader;
})();
var EditorReader = (function (_super) {
    __extends(EditorReader, _super);
    function EditorReader() {
        _super.apply(this, arguments);

    }
    EditorReader.prototype.getPathSegment = function () {
        return "editors";
    };
    EditorReader.prototype.getStore = function () {
        return new Editors.Store();
    };
    return EditorReader;
})(DefinitionReader);
exports.EditorReader = EditorReader;
var FieldReader = (function () {
    function FieldReader(project_path) {
        this.project_path = project_path;
    }
    FieldReader.prototype.read = function () {
        return new Fields.Store();
    };
    return FieldReader;
})();
exports.FieldReader = FieldReader;
var ConceptReader = (function () {
    function ConceptReader(project_path) {
        this.project_path = project_path;
    }
    ConceptReader.prototype.read = function () {
        var store = new Concepts.ConceptStore();
        return store;
    };
    return ConceptReader;
})();
exports.ConceptReader = ConceptReader;
var ProjectReader = (function () {
    function ProjectReader(project_path) {
        this.project_path = project_path;
    }
    ProjectReader.prototype.read = function (concepts) {
        var path = this.project_path + "/project.spiral";
        var txt = fs.readFileSync(path, "utf-8");
        return e.parse(txt);
    };
    return ProjectReader;
})();
exports.ProjectReader = ProjectReader;

