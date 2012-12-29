///<reference path='node.d.ts' />
///<reference path='underscore.d.ts' />

import http = module("http")
import url = module("url")
import express = module("express")
import _ = module("underscore")

var ejs = require("ejs");

var app = express.createServer();

// Configuration
app.configure(function(){
 app.set('views', __dirname + '/views');
 app.set('view engine', 'ejs');
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
        constructor(public display_text: string, public value_fn: (instance: Concepts.ConceptInstance) => any) {}
        getTemplate(): string {
            return "none";
        }

        drawForInstance(instance: Concepts.ConceptInstance): string {
            return ejs.render(this.getTemplate(), {value: this.value_fn(instance)});
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
        [new Editors.URL("The URL", function(page_instance: Concepts.ConceptInstance){
            return page_instance.get("url");
        }), new Editors.HTML("The body:", function(page_instance: Concepts.ConceptInstance){
            return page_instance.get("body");
        })], 
        [new Fields.URL("url"), new Fields.HTML("body")],
        "url"
    );

    export class ConceptInstance implements Listable {
        constructor(public concept: Concept, private values: any){}

        get(field: string) : any {
            return this.values[field];
        }

        getListLabel() {
            return String(this.get(this.concept.list_label_field));
        }
    }
}

class Action {
    constructor(public name: string, public body: () => void){}
}

class Project {
    public actions: Action[];
    constructor(public name: string, public concepts: Concepts.Concept[]){}
    executeAction(action_name:string) {
        var action = _.find(this.actions, function(action:Action){
            return action.name == action_name;
        });

        action.body();
    }
}

var project = new Project("My Project", [Concepts.Page]);

var page_instances = [new Concepts.ConceptInstance(Concepts.Page, {
    url: "/foo/bar",
    body: "<h1>Hello world!</h1>"
})];

var first_instance = page_instances[0];

project.actions = [
    new Action("run", function() {
        var project_app = express.createServer();
        _.each(page_instances, function(instance: Concepts.ConceptInstance) {
            project_app.get(instance.get('url'), function(req, res) {
                res.send(instance.get('body'));
            });
        });

        project_app.listen(1234, function(){
           console.log("Listening on port 1234!");
        });
    })
];

//project.executeAction('run');

// Routes
app.get('/', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.render('index', {
        project: project, 
        instances: page_instances,
        first_instance: first_instance,
        _: _
    });
});

app.listen(3000, function(){
   console.log("Listening on port %d in %s mode", 3000, app.settings.env);
});

export var App = app;
