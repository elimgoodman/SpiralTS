var Concepts;
(function (Concepts) {
    var Concept = (function () {
        function Concept(name, display_name, editors, fields, list_label_field) {
            this.name = name;
            this.display_name = display_name;
            this.editors = editors;
            this.fields = fields;
            this.list_label_field = list_label_field;
        }
        Concept.prototype.getListLabel = function () {
            return this.display_name;
        };
        return Concept;
    })();
    Concepts.Concept = Concept;    
    Concepts.Page = new Concept("page", "Page", [
        new Editors.URL("The URL", function (page_instance) {
            return page_instance.get("url");
        }), 
        new Editors.HTML("The body:", function (page_instance) {
            return page_instance.get("body");
        })
    ], [
        new Fields.URL("url"), 
        new Fields.HTML("body")
    ], "url");
    var ConceptInstance = (function () {
        function ConceptInstance(concept, values) {
            this.concept = concept;
            this.values = values;
        }
        ConceptInstance.prototype.get = function (field) {
            return this.values[field];
        };
        ConceptInstance.prototype.getListLabel = function () {
            return String(this.get(this.concept.list_label_field));
        };
        return ConceptInstance;
    })();
    Concepts.ConceptInstance = ConceptInstance;    
})(Concepts || (Concepts = {}));

