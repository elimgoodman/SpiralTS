var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var CodeMirror = CodeMirror || {
};
var edn = edn || {
};
var Spiral;
(function (Spiral) {
    var SelectionKeeper = function () {
        this.selected = null;
    };
    _.extend(SelectionKeeper.prototype, Backbone.Events, {
        set: function (selected) {
            if(this.selected) {
                this.selected.set({
                    selected: false
                });
            }
            this.selected = selected;
            this.selected.set({
                selected: true
            });
            this.trigger('change');
        },
        get: function () {
            return this.selected;
        }
    });
    var CurrentConcept = new SelectionKeeper();
    var CurrentInstance = new SelectionKeeper();
    var AppView = (function (_super) {
        __extends(AppView, _super);
        function AppView() {
            _super.apply(this, arguments);

        }
        AppView.prototype.getElSelector = function () {
            return "";
        };
        AppView.prototype.initialize = function () {
            this.setElement($(this.getElSelector()), true);
            this.postInit();
        };
        AppView.prototype.postInit = function () {
        };
        return AppView;
    })(Backbone.View);    
    var MView = (function (_super) {
        __extends(MView, _super);
        function MView() {
            _super.apply(this, arguments);

        }
        MView.prototype.render = function () {
            var template_selector = this.getTemplateSelector();
            var template = _.template($(template_selector).html());
            this.$el.html(template(this.getTemplateContext()));
            this.$el.data('backbone-model', this.model);
            this.postRender();
            return this;
        };
        MView.prototype.postRender = function () {
        };
        MView.prototype.getTemplateContext = function () {
            return this.model.toJSON();
        };
        MView.prototype.getTemplateSelector = function () {
            return "";
        };
        MView.prototype.initialize = function () {
            this.model.bind('change', this.render, this);
            this.postInit();
        };
        MView.prototype.postInit = function () {
        };
        MView.prototype.setClassIf = function (if_cb, class_name) {
            if(if_cb()) {
                this.$el.addClass(class_name);
            } else {
                this.$el.removeClass(class_name);
            }
        };
        MView.prototype.setSelectedClass = function () {
            var self = this;
            this.setClassIf(function () {
                return self.model.get('selected') == true;
            }, 'selected');
        };
        return MView;
    })(Backbone.View);    
    var Concept = (function (_super) {
        __extends(Concept, _super);
        function Concept() {
            _super.apply(this, arguments);

        }
        return Concept;
    })(Backbone.Model);    
    var Instance = (function (_super) {
        __extends(Instance, _super);
        function Instance() {
            _super.apply(this, arguments);

        }
        Instance.prototype.url = function () {
            var parent = this.get('parent');
            return "/concepts/" + parent.name + "/instances";
        };
        return Instance;
    })(Backbone.Model);    
    var Editor = (function (_super) {
        __extends(Editor, _super);
        function Editor() {
            _super.apply(this, arguments);

        }
        return Editor;
    })(Backbone.Model);    
    var Action = (function (_super) {
        __extends(Action, _super);
        function Action() {
            _super.apply(this, arguments);

        }
        return Action;
    })(Backbone.Model);    
    var Project = (function (_super) {
        __extends(Project, _super);
        function Project() {
            _super.apply(this, arguments);

        }
        return Project;
    })(Backbone.Model);    
    var CodeBlock = (function (_super) {
        __extends(CodeBlock, _super);
        function CodeBlock() {
            _super.apply(this, arguments);

        }
        return CodeBlock;
    })(Backbone.Model);    
    var ConceptCollection = (function (_super) {
        __extends(ConceptCollection, _super);
        function ConceptCollection() {
            _super.apply(this, arguments);

            this.model = Concept;
        }
        ConceptCollection.prototype.url = function () {
            return "/concepts";
        };
        return ConceptCollection;
    })(Backbone.Collection);    
    var ActionCollection = (function (_super) {
        __extends(ActionCollection, _super);
        function ActionCollection() {
            _super.apply(this, arguments);

            this.model = Action;
        }
        ActionCollection.prototype.url = function () {
            return "/actions";
        };
        return ActionCollection;
    })(Backbone.Collection);    
    var InstanceCollection = (function (_super) {
        __extends(InstanceCollection, _super);
        function InstanceCollection() {
            _super.apply(this, arguments);

            this.model = Instance;
        }
        InstanceCollection.prototype.initialize = function () {
            CurrentConcept.bind('change', this.fetch, this);
        };
        InstanceCollection.prototype.url = function () {
            var concept = CurrentConcept.get();
            var name = concept.get('name');
            return "/concepts/" + name + "/instances";
        };
        return InstanceCollection;
    })(Backbone.Collection);    
    var EditorCollection = (function (_super) {
        __extends(EditorCollection, _super);
        function EditorCollection() {
            _super.apply(this, arguments);

            this.model = Editor;
        }
        EditorCollection.prototype.initialize = function () {
            CurrentInstance.bind('change', this.fetch, this);
        };
        EditorCollection.prototype.url = function () {
            var concept = CurrentConcept.get().get('name');
            return "/concepts/" + concept + "/editors";
        };
        return EditorCollection;
    })(Backbone.Collection);    
    var ProjectEditorCollection = (function (_super) {
        __extends(ProjectEditorCollection, _super);
        function ProjectEditorCollection() {
            _super.apply(this, arguments);

            this.model = Editor;
        }
        ProjectEditorCollection.prototype.url = function () {
            return "/project/editors";
        };
        return ProjectEditorCollection;
    })(Backbone.Collection);    
    var Concepts = new ConceptCollection();
    var Instances = new InstanceCollection();
    var Editors = new EditorCollection();
    var ProjectEditors = new ProjectEditorCollection();
    var Actions = new ActionCollection();
    var ConceptListView = (function (_super) {
        __extends(ConceptListView, _super);
        function ConceptListView() {
            _super.apply(this, arguments);

        }
        ConceptListView.prototype.tagName = function () {
            return "li";
        };
        ConceptListView.prototype.className = function () {
            return "concept-li";
        };
        ConceptListView.prototype.getTemplateSelector = function () {
            return "#concept-list-view";
        };
        ConceptListView.prototype.select = function () {
            CurrentConcept.set(this.model);
        };
        ConceptListView.prototype.postRender = function () {
            this.$el.unbind('click').click(_.bind(this.select, this));
            this.setSelectedClass();
        };
        return ConceptListView;
    })(MView);    
    var InstanceListView = (function (_super) {
        __extends(InstanceListView, _super);
        function InstanceListView() {
            _super.apply(this, arguments);

        }
        InstanceListView.prototype.tagName = function () {
            return "li";
        };
        InstanceListView.prototype.className = function () {
            return "instance-li";
        };
        InstanceListView.prototype.getTemplateSelector = function () {
            return "#instance-list-view";
        };
        InstanceListView.prototype.select = function () {
            CurrentInstance.set(this.model);
        };
        InstanceListView.prototype.postRender = function () {
            this.$el.unbind('click').click(_.bind(this.select, this));
            this.setSelectedClass();
        };
        InstanceListView.prototype.getTemplateContext = function () {
            var c = _.extend({
                is_empty: (this.model.get('id') == "undefined"),
                id: null
            }, _super.prototype.getTemplateContext.call(this));
            return c;
        };
        return InstanceListView;
    })(MView);    
    var EditorListView = (function (_super) {
        __extends(EditorListView, _super);
        function EditorListView() {
            _super.apply(this, arguments);

        }
        EditorListView.prototype.tagName = function () {
            return "li";
        };
        EditorListView.prototype.className = function () {
            return "editor-li";
        };
        EditorListView.prototype.getTemplateSelector = function () {
            return "#editor-list-view";
        };
        EditorListView.prototype.getTemplateContext = function () {
            var context = _super.prototype.getTemplateContext.call(this);
            return _.extend(context, {
                body: this.populateTemplate()
            });
        };
        EditorListView.prototype.getEditorTemplateContext = function () {
            var instance = CurrentInstance.get();
            var values = instance.get('values');
            var value = values[this.model.get('value_field')];
            return {
                value: value
            };
        };
        EditorListView.prototype.populateTemplate = function () {
            var template = this.model.get('body');
            var context = this.getEditorTemplateContext();
            return _.template(template)(context);
        };
        EditorListView.prototype.postRender = function () {
            var self = this;
            this.$("input,textarea").unbind('keyup').keyup(function (e) {
                self.recordChange($(e.target).val());
            });
            var options = this.model.get('options');
            if(options.use_codemirror) {
                var cm = CodeMirror.fromTextArea(this.$("textarea").get(0), _.extend({
                    lineNumbers: true,
                    onKeyEvent: function (ed, ev) {
                        self.recordChange(ed.getValue());
                    }
                }, options.codemirror_options));
                setTimeout(function () {
                    cm.refresh();
                }, 20);
            }
        };
        EditorListView.prototype.recordChange = function (new_value) {
            var instance = CurrentInstance.get();
            var values = instance.get('values');
            var value_field = this.model.get('value_field');
            values[value_field] = new_value;
            instance.set({
                values: values
            }, {
                silent: true
            });
        };
        return EditorListView;
    })(MView);    
    var ProjectEditorListView = (function (_super) {
        __extends(ProjectEditorListView, _super);
        function ProjectEditorListView() {
            _super.apply(this, arguments);

        }
        ProjectEditorListView.prototype.getEditorTemplateContext = function () {
            var context = this.model.get('context');
            var value_field = this.model.get('value_field');
            var value = TheProject.get(value_field);
            return _.extend(context, {
                value: value
            });
        };
        ProjectEditorListView.prototype.recordChange = function (new_value) {
            console.log("noop");
        };
        return ProjectEditorListView;
    })(EditorListView);    
    var ActionListView = (function (_super) {
        __extends(ActionListView, _super);
        function ActionListView() {
            _super.apply(this, arguments);

        }
        ActionListView.prototype.tagName = function () {
            return "li";
        };
        ActionListView.prototype.className = function () {
            return "action-li";
        };
        ActionListView.prototype.getTemplateSelector = function () {
            return "#action-list-view";
        };
        ActionListView.prototype.performAction = function (e) {
            e.preventDefault();
            var name = this.model.get('name');
            $.post("/actions/" + name + "/perform", function (data) {
                console.log(data);
                Actions.fetch();
            }, "json");
        };
        ActionListView.prototype.postRender = function () {
            this.$el.unbind('click').click(_.bind(this.performAction, this));
        };
        return ActionListView;
    })(MView);    
    var ConceptList = (function (_super) {
        __extends(ConceptList, _super);
        function ConceptList() {
            _super.apply(this, arguments);

        }
        ConceptList.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            Concepts.bind('reset', this.render, this);
        };
        ConceptList.prototype.getElSelector = function () {
            return "#concept-list";
        };
        ConceptList.prototype.render = function () {
            this.$el.empty();
            var self = this;
            Concepts.each(function (concept) {
                var v = new ConceptListView({
                    model: concept
                });
                self.$el.append(v.render().el);
            });
        };
        return ConceptList;
    })(AppView);    
    var AddInstanceButton = (function (_super) {
        __extends(AddInstanceButton, _super);
        function AddInstanceButton() {
            _super.apply(this, arguments);

        }
        AddInstanceButton.prototype.render = function () {
            var el = $("<a href='#' class='add-instance'>Add</a>");
            el.click(function (e) {
                e.preventDefault();
                var instance = new Instance({
                    parent: CurrentConcept.get().toJSON()
                });
                instance.save();
                Instances.push(instance);
                TheInstanceList.render();
                CurrentInstance.set(instance);
            });
            return el;
        };
        return AddInstanceButton;
    })(Backbone.View);    
    var InstanceList = (function (_super) {
        __extends(InstanceList, _super);
        function InstanceList() {
            _super.apply(this, arguments);

        }
        InstanceList.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            Instances.bind('reset', this.render, this);
        };
        InstanceList.prototype.getElSelector = function () {
            return "#instance-list";
        };
        InstanceList.prototype.render = function () {
            this.$el.empty();
            var self = this;
            Instances.each(function (m) {
                var v = new InstanceListView({
                    model: m
                });
                self.$el.append(v.render().el);
            });
            var v = new AddInstanceButton();
            var button = v.render();
            var li = $("<li>");
            li.append(button);
            self.$el.append(li);
        };
        return InstanceList;
    })(AppView);    
    var EditorsList = (function (_super) {
        __extends(EditorsList, _super);
        function EditorsList() {
            _super.apply(this, arguments);

        }
        EditorsList.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            Editors.bind('reset', this.render, this);
        };
        EditorsList.prototype.getElSelector = function () {
            return "#editors";
        };
        EditorsList.prototype.render = function () {
            this.$el.empty();
            var self = this;
            Editors.each(function (m) {
                var v = new EditorListView({
                    model: m
                });
                self.$el.append(v.render().el);
            });
        };
        return EditorsList;
    })(AppView);    
    var ActionList = (function (_super) {
        __extends(ActionList, _super);
        function ActionList() {
            _super.apply(this, arguments);

        }
        ActionList.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            Actions.bind('reset', this.render, this);
        };
        ActionList.prototype.getElSelector = function () {
            return "#actions";
        };
        ActionList.prototype.render = function () {
            this.$el.empty();
            var self = this;
            Actions.each(function (m) {
                var v = new ActionListView({
                    model: m
                });
                self.$el.append(v.render().el);
            });
        };
        return ActionList;
    })(AppView);    
    var SaveLink = (function (_super) {
        __extends(SaveLink, _super);
        function SaveLink() {
            _super.apply(this, arguments);

        }
        SaveLink.prototype.getElSelector = function () {
            return "#save-link";
        };
        SaveLink.prototype.postInit = function () {
            this.$el.click(_.bind(this.save, this));
        };
        SaveLink.prototype.save = function () {
            var instance = CurrentInstance.get();
            instance.save();
        };
        return SaveLink;
    })(AppView);    
    var ConceptEditor = (function (_super) {
        __extends(ConceptEditor, _super);
        function ConceptEditor() {
            _super.apply(this, arguments);

        }
        ConceptEditor.prototype.getElSelector = function () {
            return "#concept-editor";
        };
        ConceptEditor.prototype.show = function () {
            this.$el.show();
        };
        ConceptEditor.prototype.hide = function () {
            this.$el.hide();
        };
        return ConceptEditor;
    })(AppView);    
    var ProjectEditor = (function (_super) {
        __extends(ProjectEditor, _super);
        function ProjectEditor() {
            _super.apply(this, arguments);

        }
        ProjectEditor.prototype.initialize = function () {
            _super.prototype.initialize.call(this);
            this.editor_list = this.$("#project-editor-list");
        };
        ProjectEditor.prototype.getElSelector = function () {
            return "#project-editor";
        };
        ProjectEditor.prototype.show = function () {
            this.$el.show();
        };
        ProjectEditor.prototype.hide = function () {
            this.$el.hide();
        };
        ProjectEditor.prototype.render = function () {
            this.editor_list.empty();
            var self = this;
            ProjectEditors.each(function (m) {
                var v = new ProjectEditorListView({
                    model: m
                });
                self.editor_list.append(v.render().el);
            });
        };
        return ProjectEditor;
    })(AppView);    
    var CurrentWidget = (function (_super) {
        __extends(CurrentWidget, _super);
        function CurrentWidget() {
            _super.apply(this, arguments);

        }
        CurrentWidget.prototype.getElSelector = function () {
            return "#current-widget";
        };
        CurrentWidget.prototype.postInit = function () {
            this.$el.change(_.bind(this.swapWidget, this));
        };
        CurrentWidget.prototype.swapWidget = function (e) {
            var widget = $(e.target).val();
            var label_to_view = {
                'concept-editor': TheConceptEditor,
                'project-editor': TheProjectEditor
            };
            _.each(label_to_view, function (val, key) {
                if(key == widget) {
                    val.show();
                } else {
                    val.hide();
                }
            });
        };
        return CurrentWidget;
    })(AppView);    
    var TheConceptList = new ConceptList();
    var TheInstanceList = new InstanceList();
    var TheEditors = new EditorsList();
    var TheActionList = new ActionList();
    var TheSaveLink = new SaveLink();
    var TheCurrentWidget = new CurrentWidget();
    TheProjectEditor = new ProjectEditor();
    TheConceptEditor = new ConceptEditor();
    Concepts.fetch();
    Actions.fetch();
    ProjectEditors.fetch();
    edn.setTagAction(new edn.Tag('spiral', 'Project'), function (obj) {
        return new Project(edn.toJS(obj));
    });
    edn.setTagAction(new edn.Tag('spiral', 'Project', 'Action'), function (obj) {
        return new Action(edn.toJS(obj));
    });
    edn.setTagAction(new edn.Tag('spiral', 'CodeBlock'), function (obj) {
        return new CodeBlock(edn.toJS(obj));
    });
    Concepts.bind('reset', function () {
        $.get("/project", function (data) {
            var project = edn.toJS(edn.parse(data));
            TheProject = project;
            TheProjectEditor.render();
        }, "text");
    });
})(Spiral || (Spiral = {}));

