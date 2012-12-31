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
        constructor(public display_text: string, public value_fn: (instance: Concepts.ConceptInstance) => any) {}
        getTemplate(): string {
            return "none";
        }
        renderEditor(instance: Concepts.ConceptInstance) {
            var template = this.getTemplate();
            return ejs.compile(template)({
                value: this.value_fn(instance)
            });
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
        [new Editors.URL("The URL", function(page_instance: Concepts.ConceptInstance){
            return page_instance.get("url");
        }), new Editors.HTML("The body", function(page_instance: Concepts.ConceptInstance){
            return page_instance.get("body");
        })], 
        [new Fields.URL("url"), new Fields.HTML("body")],
        "url"
    );

    export var Partial = new Concept(
        "partial", 
        "Partial", 
        [new Editors.Name("Name", function(partial_instance: Concepts.ConceptInstance){
            return partial_instance.get("name");
        }), new Editors.HTML("The body", function(partial_instance: Concepts.ConceptInstance){
            return partial_instance.get("body");
        })], 
        [new Fields.HTML("name"), new Fields.HTML("body")],
        "name"
    );

    export class ConceptInstance implements Listable {
        public unique_id:string;

        constructor(public concept: Concept, private values: any){
            this.unique_id = this.getListLabel();
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
    getConcept(name:string) {
        return _.find(this.concepts, function(concept){
            return concept.name == name;
        });
    }
}

var project = new Project("My Project", [Concepts.Page, Concepts.Partial]);

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
    res.render('index', {});
});

app.get('/concepts', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.json(project.concepts);
});

app.get('/concepts/:name/instances', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;
    res.json(instances[name]);
});

app.get('/concepts/:name/:instance_id/editors', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    
    var instance = _.find(instances[concept_name], function(instance) {
        return instance.unique_id == instance_id;
    });
    
    var concept = project.getConcept(concept_name);
    var templates = _.map(concept.editors, function(editor){
        return {
            body: editor.renderEditor(instance),
            display_text: editor.display_text
        };
    });

    res.json(templates);
});

app.listen(3000, function(){
   console.log("Listening on port %d in %s mode", 3000, app.settings.env);
});

export var App = app;
