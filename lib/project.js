var _ = require("underscore")

var Module = (function () {
    function Module(name, alias) {
        this.name = name;
        this.alias = alias;
    }
    return Module;
})();
exports.Module = Module;
var Fn = (function () {
    function Fn(params, body, modules) {
        this.params = params;
        this.body = body;
        this.modules = modules;
    }
    Fn.prototype.execute = function () {
        var vars = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            vars[_i] = arguments[_i + 0];
        }
        var f = new Function();
        var params = this.params.slice(0);
        _.each(this.modules, function (mod) {
            params.push(mod.alias);
            vars.push(require(mod.name));
        });
        params.push(this.body);
        var applied = Function.apply(f, params);
        return applied(vars);
    };
    return Fn;
})();
exports.Fn = Fn;
var Action = (function () {
    function Action(name, display_name, body, isValid) {
        this.name = name;
        this.display_name = display_name;
        this.body = body;
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
        this.concepts = [];
    }
    Project.prototype.performAction = function (action_name) {
        var action = _.find(this.getActions(), function (action) {
            return action.name == action_name;
        });
        action.body.execute(this.environment);
    };
    Project.prototype.getActions = function () {
        var self = this;
        return _.filter(this.actions, function (action) {
            return action.isValid.execute(self.environment);
        });
    };
    return Project;
})();
exports.Project = Project;
