var Editors = require("./editors")
var Fields = require("./lib/fields")
var Concept = (function () {
    function Concept(name, display_name, editors, fields, list_label_field) {
        this.name = name;
        this.display_name = display_name;
        this.editors = editors;
        this.fields = fields;
        this.list_label_field = list_label_field;
    }
    return Concept;
})();
exports.Concept = Concept;
exports.Page = new Concept("page", "Page", [
    new Editors.URL("The URL", "url"), 
    new Editors.HTML("The body", "body")
], [
    new Fields.URL("url"), 
    new Fields.HTML("body")
], "url");
exports.Partial = new Concept("partial", "Partial", [
    new Editors.Name("Name", "name"), 
    new Editors.HTML("The body", "body")
], [
    new Fields.HTML("name"), 
    new Fields.HTML("body")
], "name");
var ConceptInstance = (function () {
    function ConceptInstance(concept, values) {
        this.concept = concept;
        this.values = values;
        this.id = this.getListLabel();
    }
    ConceptInstance.prototype.get = function (field) {
        return this.values[field];
    };
    ConceptInstance.prototype.getListLabel = function () {
        return String(this.get(this.concept.list_label_field));
    };
    return ConceptInstance;
})();
exports.ConceptInstance = ConceptInstance;

