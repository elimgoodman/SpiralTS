var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
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
        return Instance;
    })(Backbone.Model);    
    var Editor = (function (_super) {
        __extends(Editor, _super);
        function Editor() {
            _super.apply(this, arguments);

        }
        return Editor;
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
            var instance_id = CurrentInstance.get().get('unique_id');
            return "/concepts/" + concept + "/" + encodeURIComponent(instance_id) + "/editors";
        };
        return EditorCollection;
    })(Backbone.Collection);    
    var Concepts = new ConceptCollection();
    var Instances = new InstanceCollection();
    var Editors = new EditorCollection();
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
        return EditorListView;
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
    var TheConceptList = new ConceptList();
    var TheInstanceList = new InstanceList();
    var TheEditors = new EditorsList();
    Concepts.fetch();
})(Spiral || (Spiral = {}));

