var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}


var express = require("express")
var _ = require("underscore")
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
var Fields;
(function (Fields) {
    var Field = (function () {
        function Field(name) {
            this.name = name;
        }
        return Field;
    })();
    Fields.Field = Field;    
    var Str = (function (_super) {
        __extends(Str, _super);
        function Str() {
            _super.apply(this, arguments);

        }
        return Str;
    })(Field);
    Fields.Str = Str;    
    var URL = (function (_super) {
        __extends(URL, _super);
        function URL() {
            _super.apply(this, arguments);

        }
        return URL;
    })(Str);
    Fields.URL = URL;    
    var HTML = (function (_super) {
        __extends(HTML, _super);
        function HTML() {
            _super.apply(this, arguments);

        }
        return HTML;
    })(Str);
    Fields.HTML = HTML;    
})(Fields || (Fields = {}));

var Editors;
(function (Editors) {
    var Editor = (function () {
        function Editor(display_text, value_field) {
            this.display_text = display_text;
            this.value_field = value_field;
        }
        Editor.prototype.getTemplate = function () {
            return "none";
        };
        return Editor;
    })();
    Editors.Editor = Editor;    
    var Name = (function (_super) {
        __extends(Name, _super);
        function Name() {
            _super.apply(this, arguments);

        }
        Name.prototype.getTemplate = function () {
            return "<input value='<%= value %>'/>";
        };
        return Name;
    })(Editor);
    Editors.Name = Name;    
    var URL = (function (_super) {
        __extends(URL, _super);
        function URL() {
            _super.apply(this, arguments);

        }
        URL.prototype.getTemplate = function () {
            return "<input value='<%= value %>'/>";
        };
        return URL;
    })(Editor);
    Editors.URL = URL;    
    var HTML = (function (_super) {
        __extends(HTML, _super);
        function HTML() {
            _super.apply(this, arguments);

        }
        HTML.prototype.getTemplate = function () {
            return "<textarea>'<%= value %>'</textarea>";
        };
        return HTML;
    })(Editor);
    Editors.HTML = HTML;    
})(Editors || (Editors = {}));

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
        new Editors.URL("The URL", "url"), 
        new Editors.HTML("The body", "body")
    ], [
        new Fields.URL("url"), 
        new Fields.HTML("body")
    ], "url");
    Concepts.Partial = new Concept("partial", "Partial", [
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
    Concepts.ConceptInstance = ConceptInstance;    
})(Concepts || (Concepts = {}));

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
        _.each(page_instances, function (instance) {
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
    res.json(instances[name]);
});
app.get('/concepts/:name/instances/:instance_id/editors', function (req, res) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    var instance = _.find(instances[concept_name], function (instance) {
        return instance.id == instance_id;
    });
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
    var instance = _.find(instances[concept_name], function (instance) {
        return instance.id == instance_id;
    });
    instance.values = req.body.values;
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

