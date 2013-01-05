var _ = require("underscore")

var Fn = (function () {
    function Fn(params, body) {
        this.params = params;
        this.body = body;
    }
    Fn.prototype.execute = function () {
        var vars = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            vars[_i] = arguments[_i + 0];
        }
        console.log("EXECUTED");
    };
    return Fn;
})();
exports.Fn = Fn;
var Project = (function () {
    function Project(name, concept_refs, action_refs) {
        this.name = name;
        this.concept_refs = concept_refs;
        this.action_refs = action_refs;
        this.environment = {
        };
        this.concepts = [];
        this.actions = [];
    }
    Project.prototype.performAction = function (action_name) {
        var action = _.find(this.getActions(), function (action) {
            return action.get('name') == action_name;
        });
        action.body.execute(this.environment);
    };
    Project.prototype.getActions = function () {
    };
    return Project;
})();
exports.Project = Project;

