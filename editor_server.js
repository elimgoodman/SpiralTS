var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}


var express = require("express")
var _ = require("underscore")
var notemplate = require('express-notemplate');
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
        function Editor(display_text, value_fn) {
            this.display_text = display_text;
            this.value_fn = value_fn;
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
    Concepts.Partial = new Concept("partial", "Partial", [
        new Editors.Name("Name:", function (partial_instance) {
            return partial_instance.get("name");
        }), 
        new Editors.HTML("The body:", function (partial_instance) {
            return partial_instance.get("body");
        })
    ], [
        new Fields.HTML("name"), 
        new Fields.HTML("body")
    ], "name");
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

var Action = (function () {
    function Action(name, body) {
        this.name = name;
        this.body = body;
    }
    return Action;
})();
var Project = (function () {
    function Project(name, concepts) {
        this.name = name;
        this.concepts = concepts;
    }
    Project.prototype.executeAction = function (action_name) {
        var action = _.find(this.actions, function (action) {
            return action.name == action_name;
        });
        action.body();
    };
    return Project;
})();
var project = new Project("My Project", [
    Concepts.Page, 
    Concepts.Partial
]);
var page_instances = [
    new Concepts.ConceptInstance(Concepts.Page, {
        url: "/foo/bar",
        body: "<h1>Hello world!</h1>"
    })
];
var first_instance = page_instances[0];
project.actions = [
    new Action("run", function () {
        var project_app = express.createServer();
        _.each(page_instances, function (instance) {
            project_app.get(instance.get('url'), function (req, res) {
                res.send(instance.get('body'));
            });
        });
        project_app.listen(1234, function () {
            console.log("Listening on port 1234!");
        });
    })
];
app.get('/', function (req, res) {
    res.render('index', {
        project: project,
        instances: page_instances,
        first_instance: first_instance,
        _: _
    });
});
app.get('/concepts', function (req, res) {
    res.json(project.concepts);
});
app.listen(3000, function () {
    console.log("Listening on port %d in %s mode", 3000, app.settings.env);
});
exports.App = app;

