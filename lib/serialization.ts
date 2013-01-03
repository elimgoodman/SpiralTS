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

function getPathForConceptInstances(project_path:string, concept: Concepts.Concept) {
    return project_path + "/instances/" + concept.name;
}

export function setTagActions() {
    e.setTagAction(new e.Tag('spiral', 'Project', 'Instance'), function(obj) {
        var name = e.atPath(obj, "name");
        var concepts = e.toJS(e.atPath(obj, "concepts"));
        var actions = e.toJS(e.atPath(obj, "actions"));

        return new Project.Project(name, concepts, actions);
    });

    e.setTagAction(new e.Tag('spiral', 'Concept', 'Reference'), function(concept_name) {
        return new Concepts.Reference(concept_name);
    });

    e.setTagAction(new e.Tag('spiral', 'Action', 'Instance'), function(obj) {
        var name = e.atPath(obj, "name");
        var display_name = e.atPath(obj, "display_name");
        var body = e.atPath(obj, "body");
        var isValid = e.atPath(obj, "isValid");

        return new Project.Action(name, display_name, body, isValid);
    });

    e.setTagAction(new e.Tag('spiral', 'Fn', "Instance"), function(obj) {
        var params = e.toJS(e.atPath(obj, "params"));
        var modules = e.toJS(e.atPath(obj, "modules"));
        var body = e.atPath(obj, "body");

        return new Project.Fn(params, body, modules);
    });

    e.setTagAction(new e.Tag('spiral', 'Module'), function(obj) {
        var name = e.atPath(obj, "name");
        var alias = e.atPath(obj, "as");

        return new Project.Module(name, alias);
    });

    e.setTagAction(new e.Tag('spiral', 'Field', 'Definition'), function(obj) {
        var type = e.atPath(obj, "type");

        return new Fields.Field(type);
    });

    e.setTagAction(new e.Tag('spiral', 'Editor', 'Definition'), function(obj) {
        var type = e.atPath(obj, "type");
        var template = e.atPath(obj, "template");

        return new Editors.Editor(type, template);
    });

    e.setTagAction(new e.Tag('spiral', 'Editor', 'Instance'), function(obj) {
        var editor_ref = e.toJS(e.atPath(obj, "editor"));
        var label = e.atPath(obj, "label");
        var value_field = e.atPath(obj, "value_field");

        return new Editors.Instance(editor_ref, label, value_field);
    });

    e.setTagAction(new e.Tag('spiral', 'Field', 'Instance'), function(obj) {
        var field_ref = e.toJS(e.atPath(obj, "field"));
        var name = e.atPath(obj, "name");

        return new Fields.Instance(field_ref, name);
    });

    e.setTagAction(new e.Tag('spiral', 'Editor', 'Reference'), function(obj) {
        return new Editors.Reference(obj);
    });

    e.setTagAction(new e.Tag('spiral', 'Field', 'Reference'), function(obj) {
        return new Fields.Reference(obj);
    });

    e.setTagAction(new e.Tag('spiral', 'Concept', 'Definition'), function(obj) {
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
}

export class InstanceReader {
    constructor(public project_path:string){}
    read(concepts: Concepts.Concept[]): Concepts.InstanceStore {
        var self = this;
        var store = new Concepts.InstanceStore();

        _.each(concepts, function(concept){
            var path = getPathForConceptInstances(self.project_path, concept);
            var instances = fs.readdirSync(path);
            _.each(instances, function(instance){
                var instance_txt = fs.readFileSync(path + "/" + instance, "utf-8");
                var i = self.createInstanceFromString(concept, instance_txt);
                store.add(i);
            });
        });
        return store;
    }

    createInstanceFromString(concept: Concepts.Concept, body: string): Concepts.ConceptInstance {
        return new Concepts.ConceptInstance(concept, JSON.parse(body));
    }
}

export class InstanceWriter {
    constructor(public project_path:string){}
    write(instance: Concepts.ConceptInstance) {
        var path = getPathForConceptInstances(this.project_path, instance.concept);
        var filename = this.cleanName(instance.getUniqueId());
        fs.writeFileSync(path + "/" + filename + ".spiral", JSON.stringify(instance.values));
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
