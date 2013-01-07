///<reference path='../node.d.ts' />
///<reference path='../underscore.d.ts' />

import fs = module("fs");
import _ = module("underscore");

import Concepts = module("concepts");
import Editors = module("editors");
import Fields = module("fields");
import Project = module("project");
import Meta = module("meta");

var e = require("jsedn");

function getPathForInstances(project_path:string, concept) {
    return project_path + "/instances/" + concept.name;
}

module Tags {
    export var PROJECT = new e.Tag('spiral', 'Project');
    export var PROJECT_ACTION = new e.Tag('spiral', 'Project', 'Action');
    export var CODE_BLOCK = new e.Tag('spiral', 'CodeBlock');

    export var CONCEPT_DEFINITION = new e.Tag('spiral', 'Concept', 'Definition');
    export var CONCEPT_INSTANCE = new e.Tag('spiral', 'Concept', 'Instance');
    export var CONCEPT_REFERENCE = new e.Tag('spiral', 'Concept', 'Reference');

    export var FIELD_DEFITION = new e.Tag('spiral', 'Field', 'Definition');
    export var FIELD_INSTANCE = new e.Tag('spiral', 'Field', 'Instance');
    export var FIELD_REFERENCE = new e.Tag('spiral', 'Field', 'Reference');

    export var EDITOR_DEFINITION = new e.Tag('spiral', 'Editor', 'Definition');
    export var EDITOR_INSTANCE = new e.Tag('spiral', 'Editor', 'Instance');
    export var EDITOR_REFERENCE = new e.Tag('spiral', 'Editor', 'Reference');
}

export function setTagActions() {
    e.setTagAction(Tags.PROJECT, function(obj) {
        var name = e.atPath(obj, "name");
        var concepts = e.toJS(e.atPath(obj, "concepts"));
        var actions = e.toJS(e.atPath(obj, "actions"));

        return new Project.Project(name, concepts, actions);
    });

    e.setTagAction(Tags.PROJECT_ACTION, function(obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var code = e.toJS(e.atPath(obj, "code"));
        var is_valid = e.toJS(e.atPath(obj, "is_valid"));

        return new Project.Action(name, display_name, code, is_valid);
    });

    e.setTagAction(Tags.CODE_BLOCK, function(obj) {
        var params = e.toJS(e.atPath(obj, "params"));
        var body = e.atPath(obj, 'body');

        return new Project.CodeBlock(params, body);
    });

    e.setTagAction(Tags.CONCEPT_REFERENCE, function(concept_name) {
        return new Concepts.Reference(concept_name);
    });

    e.setTagAction(Tags.FIELD_DEFITION, function(obj) {
        var type = e.atPath(obj, "type");

        return new Fields.Field(type);
    });

    e.setTagAction(Tags.EDITOR_DEFINITION, function(obj) {
        var type = e.atPath(obj, "type");
        var template = e.atPath(obj, "template");
        var options = e.toJS(e.atPath(obj, "options"));

        return new Editors.Editor(type, template, options);
    });

    e.setTagAction(Tags.EDITOR_INSTANCE, function(obj) {
        var editor_ref = e.toJS(e.atPath(obj, "editor"));
        var label = e.atPath(obj, "label");
        var value_field = e.atPath(obj, "value_field");

        return new Editors.Instance(editor_ref, label, value_field);
    });

    e.setTagAction(Tags.FIELD_INSTANCE, function(obj) {
        var field_ref = e.toJS(e.atPath(obj, "field"));
        var name = e.atPath(obj, "name");

        return new Fields.Instance(field_ref, name);
    });

    e.setTagAction(Tags.EDITOR_REFERENCE, function(obj) {
        return new Editors.Reference(obj);
    });

    e.setTagAction(Tags.FIELD_REFERENCE, function(obj) {
        return new Fields.Reference(obj);
    });

    e.setTagAction(Tags.CONCEPT_DEFINITION, function(obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var unique_id_field = e.atPath(obj, "unique_id_field");
        var editors = e.toJS(e.atPath(obj, "editors"));
        var fields = e.toJS(e.atPath(obj, "fields"));

        return new Concepts.Concept(
            name,
            display_name,
            unique_id_field,
            editors,
            fields
        );
    });

    e.setTagAction(Tags.CONCEPT_INSTANCE, function(obj) {
        var parent_ref = e.atPath(obj, "concept");
        var values = e.toJS(e.atPath(obj, "values"));

        return new Concepts.Instance(
            parent_ref,
            values
        );
    });
}

export class InstanceReader {
    constructor(public project_path:string){}
    read(concepts: Concepts.Concept[]): Concepts.InstanceStore {
        setTagActions();

        var self = this;
        var store = new Concepts.InstanceStore();

        _.each(concepts, function(concept){
            var path = getPathForInstances(self.project_path, concept);
            var instances = fs.readdirSync(path);
            _.each(instances, function(instance){
                var instance_txt = fs.readFileSync(path + "/" + instance, "utf-8");
                var i = e.parse(instance_txt);
                store.add(i);
            });
        });
        return store;
    }
}

export class InstanceWriter {
    constructor(public project_path:string){}
    write(instance: Concepts.Instance) {
        var path = getPathForInstances(this.project_path, instance.parent);
        var filename = this.cleanName(instance.getUniqueId());
        fs.writeFileSync(path + "/" + filename + ".spiral", this.serialize(instance));
    }
    
    serialize(instance: Concepts.Instance):string {
        var data = new e.Tagged(Tags.CONCEPT_INSTANCE, {
            concept: new e.Tagged(Tags.CONCEPT_REFERENCE, instance.parent.getId()),
            values: instance.values
        });

        return e.encode(data);
    }

    cleanName(name:string): string {
        return name.replace(new RegExp("/", "g"), "_");
    }
}

class DefinitionReader {
    constructor(public project_path:string){}
    read(): Meta.DefinitionStore {
        setTagActions();

        var store = this.getStore();
        var path = this.project_path + "/" + this.getPathSegment();

        var defs = fs.readdirSync(path);
        _.each(defs, function(instance){
            var def_txt = fs.readFileSync(path + "/" + instance, "utf-8");
            var i = e.parse(def_txt);
            store.add(i);
        });

        return store;
    }

    getPathSegment(): string {
        return null;
    }

    getStore(): Meta.DefinitionStore {
        return null;
    }
}

export class EditorReader extends DefinitionReader {
    getPathSegment(): string {
        return "editors";
    }

    getStore(): Meta.DefinitionStore {
        return new Editors.Store();
    }
}

export class FieldReader extends DefinitionReader {
    getPathSegment(): string {
        return "fields";
    }

    getStore(): Meta.DefinitionStore {
        return new Fields.Store();
    }
}

export class ConceptReader extends DefinitionReader {
    getPathSegment(): string {
        return "concepts";
    }

    getStore(): Meta.DefinitionStore {
        return new Concepts.DefinitionStore();
    }
}

export class ProjectReader {
    constructor(public project_path:string){}
    read(): Project.Project {
        var path = this.project_path + "/project.spiral";
        var txt = fs.readFileSync(path, "utf-8");
        return e.parse(txt);
    }
}

function serializeCodeBlock(code: Project.CodeBlock) {
    return new e.Tagged(Tags.CODE_BLOCK, {
        params: code.params,
        body: code.body
    });
}

function serializeAction(action: Project.Action) {
    return new e.Tagged(Tags.PROJECT_ACTION, {
        name: action.name,
        display_name: action.display_name,
        code: serializeCodeBlock(action.code),
        is_valid: serializeCodeBlock(action.isValid)
    });
}

export function serializeProject(project: Project.Project) {
    var data = new e.Tagged(Tags.PROJECT, {
        name: project.name,
        concepts: _.pluck(project.concept_refs, 'id'),
        actions: _.map(project.actions, serializeAction)
    });

    return e.encode(data);
}
