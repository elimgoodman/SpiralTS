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
var Tags;
(function (Tags) {
    Tags.PROJECT = new e.Tag('spiral', 'Project');
    Tags.PROJECT_ACTION = new e.Tag('spiral', 'Project', 'Action');
    Tags.CODE_BLOCK = new e.Tag('spiral', 'CodeBlock');
    Tags.CONCEPT_DEFINITION = new e.Tag('spiral', 'Concept', 'Definition');
    Tags.CONCEPT_INSTANCE = new e.Tag('spiral', 'Concept', 'Instance');
    Tags.CONCEPT_REFERENCE = new e.Tag('spiral', 'Concept', 'Reference');
    Tags.FIELD_DEFITION = new e.Tag('spiral', 'Field', 'Definition');
    Tags.FIELD_INSTANCE = new e.Tag('spiral', 'Field', 'Instance');
    Tags.FIELD_REFERENCE = new e.Tag('spiral', 'Field', 'Reference');
    Tags.EDITOR_DEFINITION = new e.Tag('spiral', 'Editor', 'Definition');
    Tags.EDITOR_INSTANCE = new e.Tag('spiral', 'Editor', 'Instance');
    Tags.EDITOR_REFERENCE = new e.Tag('spiral', 'Editor', 'Reference');
})(Tags || (Tags = {}));

function setTagActions() {
    e.setTagAction(Tags.PROJECT, function (obj) {
        var name = e.atPath(obj, "name");
        var concepts = e.toJS(e.atPath(obj, "concepts"));
        var actions = e.toJS(e.atPath(obj, "actions"));
        return new Project.Project(name, concepts, actions);
    });
    e.setTagAction(Tags.PROJECT_ACTION, function (obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var code = e.toJS(e.atPath(obj, "code"));
        var is_valid = e.toJS(e.atPath(obj, "is_valid"));
        return new Project.Action(name, display_name, code, is_valid);
    });
    e.setTagAction(Tags.CODE_BLOCK, function (obj) {
        var params = e.toJS(e.atPath(obj, "params"));
        var body = e.atPath(obj, 'body');
        return new Project.CodeBlock(params, body);
    });
    e.setTagAction(Tags.CONCEPT_REFERENCE, function (concept_name) {
        return new Concepts.Reference(concept_name);
    });
    e.setTagAction(Tags.FIELD_DEFITION, function (obj) {
        var type = e.atPath(obj, "type");
        return new Fields.Field(type);
    });
    e.setTagAction(Tags.EDITOR_DEFINITION, function (obj) {
        var type = e.atPath(obj, "type");
        var template = e.atPath(obj, "template");
        var options = e.toJS(e.atPath(obj, "options"));
        return new Editors.Editor(type, template, options);
    });
    e.setTagAction(Tags.EDITOR_INSTANCE, function (obj) {
        var editor_ref = e.toJS(e.atPath(obj, "editor"));
        var label = e.atPath(obj, "label");
        var value_field = e.atPath(obj, "value_field");
        return new Editors.Instance(editor_ref, label, value_field);
    });
    e.setTagAction(Tags.FIELD_INSTANCE, function (obj) {
        var field_ref = e.toJS(e.atPath(obj, "field"));
        var name = e.atPath(obj, "name");
        return new Fields.Instance(field_ref, name);
    });
    e.setTagAction(Tags.EDITOR_REFERENCE, function (obj) {
        return new Editors.Reference(obj);
    });
    e.setTagAction(Tags.FIELD_REFERENCE, function (obj) {
        return new Fields.Reference(obj);
    });
    e.setTagAction(Tags.CONCEPT_DEFINITION, function (obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var unique_id_field = e.atPath(obj, "unique_id_field");
        var editors = e.toJS(e.atPath(obj, "editors"));
        var fields = e.toJS(e.atPath(obj, "fields"));
        return new Concepts.Concept(name, display_name, unique_id_field, editors, fields);
    });
    e.setTagAction(Tags.CONCEPT_INSTANCE, function (obj) {
        var parent_ref = e.atPath(obj, "concept");
        var values = e.toJS(e.atPath(obj, "values"));
        return new Concepts.Instance(parent_ref, values);
    });
}
exports.setTagActions = setTagActions;
var InstanceReader = (function () {
    function InstanceReader(project_path) {
        this.project_path = project_path;
    }
    InstanceReader.prototype.read = function (concepts) {
        setTagActions();
        var self = this;
        var store = new Concepts.InstanceStore();
        _.each(concepts, function (concept) {
            var path = getPathForInstances(self.project_path, concept);
            var instances = fs.readdirSync(path);
            _.each(instances, function (instance) {
                var instance_txt = fs.readFileSync(path + "/" + instance, "utf-8");
                var i = e.parse(instance_txt);
                store.add(i);
            });
        });
        return store;
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
        fs.writeFileSync(path + "/" + filename + ".spiral", this.serialize(instance));
    };
    InstanceWriter.prototype.serialize = function (instance) {
        var data = new e.Tagged(Tags.CONCEPT_INSTANCE, {
            concept: new e.Tagged(Tags.CONCEPT_REFERENCE, instance.parent.getId()),
            values: instance.values
        });
        return e.encode(data);
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
function serializeCodeBlock(code) {
    return new e.Tagged(Tags.CODE_BLOCK, {
        params: code.params,
        body: code.body
    });
}
function serializeAction(action) {
    return new e.Tagged(Tags.PROJECT_ACTION, {
        name: action.name,
        display_name: action.display_name,
        code: serializeCodeBlock(action.code),
        is_valid: serializeCodeBlock(action.isValid)
    });
}
function serializeProject(project) {
    var data = new e.Tagged(Tags.PROJECT, {
        name: project.name,
        concepts: _.pluck(project.concept_refs, 'id'),
        actions: _.map(project.actions, serializeAction)
    });
    return e.encode(data);
}
exports.serializeProject = serializeProject;

