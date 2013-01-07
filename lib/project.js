


var CodeBlock = (function () {
    function CodeBlock(params, body) {
        this.params = params;
        this.body = body;
    }
    return CodeBlock;
})();
exports.CodeBlock = CodeBlock;
var Action = (function () {
    function Action(name, display_name, code, isValid) {
        this.name = name;
        this.display_name = display_name;
        this.code = code;
        this.isValid = isValid;
    }
    return Action;
})();
exports.Action = Action;
var Project = (function () {
    function Project(name, concept_refs, actions) {
        this.name = name;
        this.concept_refs = concept_refs;
        this.actions = actions;
        this.environment = {
        };
    }
    return Project;
})();
exports.Project = Project;

