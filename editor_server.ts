///<reference path='node.d.ts' />
///<reference path='underscore.d.ts' />

import http = module("http")
import url = module("url")
import express = module("express")
import _ = module("underscore")

var notemplate = require('express-notemplate');
var ejs = require('ejs');

var app = express.createServer();

// Configuration
app.configure(function(){
 app.set('views', __dirname + '/views');
 app.engine('html', notemplate.__express);
 app.set('view engine', 'html');
 app.use(express.bodyParser());
 app.use(express.methodOverride());
 app.use(express.static(__dirname + '/static'));
});

app.configure('development', function(){
 app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
 app.use(express.errorHandler());
});

module Fields {
    export class Field {
        constructor(public name:string){}
    }

    export class Str extends Field {}
    export class URL extends Str {}
    export class HTML extends Str {}
}

module Editors {
    export class Editor {
        constructor(public display_text: string, public value_field: string){}

        getTemplate(): string {
            return "none";
        }
    }

    export class Name extends Editor {
        getTemplate() {
            return "<input value='<%= value %>'/>";
        }
    }    
    
    export class URL extends Editor {
        getTemplate() {
            return "<input value='<%= value %>'/>";
        }
    }

    export class HTML extends Editor {
        getTemplate() {

            return "<textarea>'<%= value %>'</textarea>";
        }
    }
}

interface Listable {
    getListLabel(): string;
}

module Concepts {
    export class Concept implements Listable {
        constructor(
            public name: string, 
            public display_name: string, 
            public editors: Editors.Editor[], 
            public fields: Fields.Field[],
            public list_label_field:string )
        {};

        getListLabel() {
            return this.display_name;
        }
    }

    export var Page = new Concept(
        "page", 
        "Page", 
        [new Editors.URL("The URL", "url"),
         new Editors.HTML("The body", "body")], 
        [new Fields.URL("url"), new Fields.HTML("body")],
        "url"
    );

    export var Partial = new Concept(
        "partial", 
        "Partial", 
        [new Editors.Name("Name", "name"),
         new Editors.HTML("The body", "body")], 
        [new Fields.HTML("name"), new Fields.HTML("body")],
        "name"
    );

    export class ConceptInstance implements Listable {
        public id:string;

        constructor(public concept: Concept, private values: any){
            this.id = this.getListLabel();
        }

        get(field: string) : any {
            return this.values[field];
        }

        getListLabel() {
            return String(this.get(this.concept.list_label_field));
        }
    }
}

class Action {
    constructor(
        public name: string, 
        public display_name:string, 
        public body: (environment:any) => void,
        public isValid: (environment:any) => bool){}
}

class Project {

    private environment = {};

    constructor(public name: string, public concepts: Concepts.Concept[], private actions: Action[]){}
    performAction(action_name:string) {
        var action = _.find(this.getActions(), function(action:Action){
            return action.name == action_name;
        });

        action.body(this.environment);
    }
    getConcept(name:string) {
        return _.find(this.concepts, function(concept){
            return concept.name == name;
        });
    }
    getActions() {
        var self = this;
        return _.filter(this.actions, function(action){
            return action.isValid(self.environment);
        });
    }
}

declare var page_instances;

var actions = [
    new Action("run", "Run", function(environment) {
        var http = require('http'),
            director = require('director');

        var router = new director.http.Router();

        _.each(page_instances, function(instance: Concepts.ConceptInstance) {
            router.get(instance.get('url'), function(req, res) {
                this.res.writeHead(200, { 'Content-Type': 'text/html' })
                this.res.end(instance.get('body'));
            });
        });

        var server = http.createServer(function (req, res) {
            router.dispatch(req, res);
        }).listen(1234);

        environment.server = server;
        environment.server_running = true;
    },
    function(environment) {
        return !environment.server_running;
    }),
    new Action("stop", "Stop", function(environment) {
        environment.server.close();
        environment.server_running = false;
    },
    function(environment) {
        return environment.server_running;
    }),
];

var project = new Project("My Project", [Concepts.Page, Concepts.Partial], actions);

var page_instances = [
new Concepts.ConceptInstance(Concepts.Page, {
    url: "/foo/bar",
    body: "<h1>Hello world!</h1>"
}),
new Concepts.ConceptInstance(Concepts.Page, {
    url: "/foo/baz",
    body: "<h1>Goodbye world!</h1>"
})    
];

var partial_instances = [
new Concepts.ConceptInstance(Concepts.Partial, {
    name: "button",
    body: "<span class='button'>Click me</span>"
}),
new Concepts.ConceptInstance(Concepts.Partial, {
    name: "badge",
    body: "<span class='badge'>Pin me</span>"
})
];

var instances = {
    page: page_instances,
    partial: partial_instances
};

// Routes
app.get('/', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.render('index', {});
});

app.get('/concepts', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.json(project.concepts);
});

app.get('/actions', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.json(project.getActions());
});

app.get('/concepts/:name/instances', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;
    res.json(instances[name]);
});

app.get('/concepts/:name/instances/:instance_id/editors', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    
    var instance = _.find(instances[concept_name], function(instance) {
        return instance.id == instance_id;
    });
    
    var concept = project.getConcept(concept_name);
    var templates = _.map(concept.editors, function(editor){
        return {
            body: editor.getTemplate(),
            display_text: editor.display_text,
            value_field: editor.value_field
        };
    });

    res.json(templates);
});

app.put('/concepts/:name/instances/:instance_id', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    
    var instance = _.find(instances[concept_name], function(instance) {
        return instance.id == instance_id;
    });

    instance.values = req.body.values;
    res.json(instance);
});

app.post('/actions/:name/perform', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;

    project.performAction(name);

    res.json({succes: true});
});

app.listen(3000, function(){
   console.log("Listening on port %d in %s mode", 3000, app.settings.env);
});

export var App = app;
