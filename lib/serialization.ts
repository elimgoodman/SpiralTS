///<reference path='../node.d.ts' />
///<reference path='../underscore.d.ts' />

import fs = module("fs");
import _ = module("underscore");

import Concepts = module("concepts");
import InstanceStore = module("instance_store");

function getPathForConceptInstances(project_path:string, concept: Concepts.Concept) {
    return project_path + "/instances/" + concept.name;
}

export class Reader {
    constructor(public project_path:string){}
    readInstances(concepts: Concepts.Concept[]): InstanceStore.Store {
        var self = this;
        var store = new InstanceStore.Store();

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

export class Writer {
    constructor(public project_path:string){}
    writeInstance(instance: Concepts.ConceptInstance) {
        var path = getPathForConceptInstances(this.project_path, instance.concept);
        var filename = this.cleanName(instance.getListLabel());
        fs.writeFileSync(path + "/" + filename + ".spiral", JSON.stringify(instance.values));
    }

    cleanName(name:string): string {
        return name.replace(new RegExp("/", "g"), "_");
    }
}
