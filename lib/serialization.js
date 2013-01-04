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
function getPathForInstances(project_path, concept) {
    return project_path + "/instances/" + concept.name;
}
function setTagActions() {
    e.setTagAction(new e.Tag('spiral', 'Project', 'Instance'), function (obj) {
        var name = e.atPath(obj, "name");
        var concepts = e.toJS(e.atPath(obj, "concepts"));
        var actions = e.toJS(e.atPath(obj, "actions"));
        return new Project.Project(name, concepts, actions);
    });
    e.setTagAction(new e.Tag('spiral', 'Concept', 'Reference'), function (concept_name) {
        return new Concepts.Reference(concept_name);
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
    e.setTagAction(new e.Tag('spiral', 'Field', 'Definition'), function (obj) {
        var type = e.atPath(obj, "type");
        return new Fields.Field(type);
    });
    e.setTagAction(new e.Tag('spiral', 'Editor', 'Definition'), function (obj) {
        var type = e.atPath(obj, "type");
        var template = e.atPath(obj, "template");
        return new Editors.Editor(type, template);
    });
    e.setTagAction(new e.Tag('spiral', 'Editor', 'Instance'), function (obj) {
        var editor_ref = e.toJS(e.atPath(obj, "editor"));
        var label = e.atPath(obj, "label");
        var value_field = e.atPath(obj, "value_field");
        return new Editors.Instance(editor_ref, label, value_field);
    });
    e.setTagAction(new e.Tag('spiral', 'Field', 'Instance'), function (obj) {
        var field_ref = e.toJS(e.atPath(obj, "field"));
        var name = e.atPath(obj, "name");
        return new Fields.Instance(field_ref, name);
    });
    e.setTagAction(new e.Tag('spiral', 'Editor', 'Reference'), function (obj) {
        return new Editors.Reference(obj);
    });
    e.setTagAction(new e.Tag('spiral', 'Field', 'Reference'), function (obj) {
        return new Fields.Reference(obj);
    });
    e.setTagAction(new e.Tag('spiral', 'Concept', 'Definition'), function (obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var unique_id_field = e.atPath(obj, "unique_id_field");
        var editors = e.toJS(e.atPath(obj, "editors"));
        var fields = e.toJS(e.atPath(obj, "fields"));
        return new Concepts.Concept(name, display_name, unique_id_field, editors, fields);
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
            var path = getPathForInstances(self.project_path, concept);
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
        return new Concepts.Instance(concept, JSON.parse(body));
    };
    return InstanceReader;
})();
exports.InstanceReader = InstanceReader;
var InstanceWriter = (function () {
    function InstanceWriter(project_path) {
        this.project_path = project_path;
    }
    InstanceWriter.prototype.write = function (instance) {
        var path = getPathForInstances(this.project_path, instance.parent);
        var filename = this.cleanName(instance.getUniqueId());
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
var FieldReader = (function (_super) {
    __extends(FieldReader, _super);
    function FieldReader() {
        _super.apply(this, arguments);

    }
    FieldReader.prototype.getPathSegment = function () {
        return "fields";
    };
    FieldReader.prototype.getStore = function () {
        return new Fields.Store();
    };
    return FieldReader;
})(DefinitionReader);
exports.FieldReader = FieldReader;
var ConceptReader = (function (_super) {
    __extends(ConceptReader, _super);
    function ConceptReader() {
        _super.apply(this, arguments);

    }
    ConceptReader.prototype.getPathSegment = function () {
        return "concepts";
    };
    ConceptReader.prototype.getStore = function () {
        return new Concepts.DefinitionStore();
    };
    return ConceptReader;
})(DefinitionReader);
exports.ConceptReader = ConceptReader;
var ProjectReader = (function () {
    function ProjectReader(project_path) {
        this.project_path = project_path;
    }
    ProjectReader.prototype.read = function () {
        var path = this.project_path + "/project.spiral";
        var txt = fs.readFileSync(path, "utf-8");
        return e.parse(txt);
    };
    return ProjectReader;
})();
exports.ProjectReader = ProjectReader;

