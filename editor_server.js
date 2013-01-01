

var express = require("express")
var _ = require("underscore")
var Serialization = require("./lib/serialization")
var Concepts = require("./lib/concepts")
var notemplate = require('express-notemplate');
var ejs = require('ejs');
var app = express.createServer();
app.configure(function () {
    app.set('views', __dirname + '/views');
    app.engine('html', notemplate.__express);
    app.set('view engine', 'html');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/static'));
});
app.configure('development', function () {
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});
app.configure('production', function () {
    app.use(express.errorHandler());
});
var Action = (function () {
    function Action(name, display_name, body, isValid) {
        this.name = name;
        this.display_name = display_name;
        this.body = body;
        this.isValid = isValid;
    }
    return Action;
})();
var Project = (function () {
    function Project(name, concepts, actions) {
        this.name = name;
        this.concepts = concepts;
        this.actions = actions;
        this.environment = {
        };
    }
    Project.prototype.performAction = function (action_name) {
        var action = _.find(this.getActions(), function (action) {
            return action.name == action_name;
        });
        action.body(this.environment);
    };
    Project.prototype.getConcept = function (name) {
        return _.find(this.concepts, function (concept) {
            return concept.name == name;
        });
    };
    Project.prototype.getActions = function () {
        var self = this;
        return _.filter(this.actions, function (action) {
            return action.isValid(self.environment);
        });
    };
    return Project;
})();
var actions = [
    new Action("run", "Run", function (environment) {
        var http = require('http');
        var director = require('director');

        var router = new director.http.Router();
        _.each(instances.getByConceptName('pages'), function (instance) {
            router.get(instance.get('url'), function (req, res) {
                this.res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                this.res.end(instance.get('body'));
            });
        });
        var server = http.createServer(function (req, res) {
            router.dispatch(req, res);
        }).listen(1234);
        environment.server = server;
        environment.server_running = true;
    }, function (environment) {
        return !environment.server_running;
    }), 
    new Action("stop", "Stop", function (environment) {
        environment.server.close();
        environment.server_running = false;
    }, function (environment) {
        return environment.server_running;
    }), 
    
];
var project = new Project("My Project", [
    Concepts.Page, 
    Concepts.Partial
], actions);
var project_path = "./sample_project";
var reader = new Serialization.Reader(project_path);
var writer = new Serialization.Writer(project_path);
var instances = reader.readInstances(project.concepts);
app.get('/', function (req, res) {
    res.render('index', {
    });
});
app.get('/concepts', function (req, res) {
    res.json(project.concepts);
});
app.get('/actions', function (req, res) {
    res.json(project.getActions());
});
app.get('/concepts/:name/instances', function (req, res) {
    var name = req.params.name;
    res.json(instances.getByConceptName(name));
});
app.get('/concepts/:name/instances/:instance_id/editors', function (req, res) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    var instance = instances.getById(instance_id);
    var concept = project.getConcept(concept_name);
    var templates = _.map(concept.editors, function (editor) {
        return {
            body: editor.getTemplate(),
            display_text: editor.display_text,
            value_field: editor.value_field
        };
    });
    res.json(templates);
});
app.put('/concepts/:name/instances/:instance_id', function (req, res) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    var instance = instances.getById(instance_id);
    instance.setValues(req.body.values);
    writer.writeInstance(instance);
    res.json(instance);
});
app.post('/actions/:name/perform', function (req, res) {
    var name = req.params.name;
    project.performAction(name);
    res.json({
        succes: true
    });
});
app.listen(3000, function () {
    console.log("Listening on port %d in %s mode", 3000, app.settings.env);
});
exports.App = app;

