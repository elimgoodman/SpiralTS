///<reference path='../node.d.ts' />
///<reference path='../underscore.d.ts' />

import fs = module("fs");
import _ = module("underscore");

import Concepts = module("concepts");
import Editors = module("editors");
import Fields = module("fields");
import Project = module("project");

var e = require("jsedn");

function getPathForConceptInstances(project_path:string, concept: Concepts.Concept) {
    return project_path + "/instances/" + concept.name;
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
        var filename = this.cleanName(instance.getListLabel());
        fs.writeFileSync(path + "/" + filename + ".spiral", JSON.stringify(instance.values));
    }

    cleanName(name:string): string {
        return name.replace(new RegExp("/", "g"), "_");
    }
}

export class EditorReader {
    constructor(public project_path:string){}
    read(): Editors.Store {
        return new Editors.Store();
    }
}
export class FieldReader {
    constructor(public project_path:string){}
    read(): Fields.Store {
        return new Fields.Store();
    }
}
export class ConceptReader {
    constructor(public project_path:string){}
    read(): Concepts.ConceptStore {
        var store = new Concepts.ConceptStore();

        //FIXME: HACK
        store.add(Concepts.Page);
        store.add(Concepts.Partial);
        return store;
    }
}
export class ProjectReader {
    constructor(public project_path:string){}
    read(concepts: Concepts.ConceptStore): Project.Project {
        var path = this.project_path + "/project.spiral";
        var txt = fs.readFileSync(path, "utf-8");

        e.setTagAction(new e.Tag('spiral', 'Project'), function(obj) {
            var name = e.atPath(obj, "name");
            var concepts = e.toJS(e.atPath(obj, "concepts"));
            var actions = e.toJS(e.atPath(obj, "actions"));

            return new Project.Project(name, concepts, actions);
        });

        e.setTagAction(new e.Tag('spiral', 'Concept'), function(concept_name) {
            return concepts.getByName(concept_name);
        });

        e.setTagAction(new e.Tag('spiral', 'Action'), function(obj) {
            var name = e.atPath(obj, "name");
            var display_name = e.atPath(obj, "display_name");
            var body = e.atPath(obj, "body");
            var isValid = e.atPath(obj, "isValid");

            return new Project.Action(name, display_name, body, isValid);
        });

        e.setTagAction(new e.Tag('spiral', 'Fn'), function(obj) {
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

        return e.parse(txt);
    }
}
