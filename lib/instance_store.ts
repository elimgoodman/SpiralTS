import _ = module("underscore")
import Concepts = module("concepts");

export class Store {
    private instances: Concepts.ConceptInstance[] = [];

    getByConceptName(concept_name:string): Concepts.ConceptInstance[] {
        return _.filter(this.instances, function(instance) {
            return instance.concept.name == concept_name;
        });
    }

    getById(instance_id:string): Concepts.ConceptInstance {
        return _.find(this.instances, function(instance) {
            return instance.id == instance_id;
        });
    }

    add(instance: Concepts.ConceptInstance) {
        this.instances.push(instance);
    }
}
