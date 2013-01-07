///<reference path='../../backbone.d.ts' />
///<reference path='../../jquery.d.ts' />

var CodeMirror = CodeMirror || {};
var edn = edn || {};

module Spiral {
    
    var SelectionKeeper = function() {
        this.selected = null;
    };

    _.extend(SelectionKeeper.prototype, Backbone.Events, {

        set: function(selected: Backbone.Model) {
            if(this.selected) {
                this.selected.set({selected: false});
            }

            this.selected = selected;
            this.selected.set({selected: true});

            this.trigger('change');
        },

        get: function(): Backbone.Model {
            return this.selected;
        }
    });
    
    var CurrentConcept = new SelectionKeeper();
    var CurrentInstance = new SelectionKeeper();

    class AppView extends Backbone.View {
        getElSelector() {
            return "";
        }

        initialize() {
            this.setElement($(this.getElSelector()), true);
            this.postInit();
        }

        postInit() {}
    }

    class MView extends Backbone.View {
        render(): MView {
            var template_selector = this.getTemplateSelector();
            var template = _.template($(template_selector).html());
            this.$el.html(template(this.getTemplateContext()));
            this.$el.data('backbone-model', this.model);
            this.postRender();
            return this;
        }
        postRender() {}
        getTemplateContext() {
            return this.model.toJSON();
        }
        getTemplateSelector(): string {
            return "";
        }
        initialize() {
            this.model.bind('change', this.render, this);
            this.postInit();
        }
        postInit() {}
        setClassIf(if_cb:() => bool, class_name: string) {
            if(if_cb()) {
                this.$el.addClass(class_name);
            } else {
                this.$el.removeClass(class_name);
            }
        }
        setSelectedClass() {
            var self = this;
            this.setClassIf(function() {
                return self.model.get('selected') == true;
            }, 'selected');
        }
    }
    
    class Concept extends Backbone.Model {}
    class Instance extends Backbone.Model {
        url() {
            var parent = this.get('parent');
            return "/concepts/" + parent.name + "/instances";
        }
    }
    class Editor extends Backbone.Model {}
    class Action extends Backbone.Model {}
    class Project extends Backbone.Model {}
    class CodeBlock extends Backbone.Model {}

    declare var TheProject:Project;

    class ConceptCollection extends Backbone.Collection {
        url() {
            return "/concepts";
        }

        public model = Concept;
    }

    class ActionCollection extends Backbone.Collection {
        url() {
            return "/actions";
        }

        public model = Action;
    }

    class InstanceCollection extends Backbone.Collection {
        public model = Instance;
        initialize() {
            CurrentConcept.bind('change', this.fetch, this);
        }
        url() {
            var concept = CurrentConcept.get();
            var name = concept.get('name');
            return "/concepts/" + name + "/instances";
        }
    }

    class EditorCollection extends Backbone.Collection {
        public model = Editor;
        initialize() {
            CurrentInstance.bind('change', this.fetch, this);
        }
        url() {
            var concept = CurrentConcept.get().get('name');

            return "/concepts/" + concept + "/editors";
        }
    }

    class ProjectEditorCollection extends Backbone.Collection {
        public model = Editor;
        url() {
            return "/project/editors";
        }
    }

    var Concepts = new ConceptCollection();
    var Instances = new InstanceCollection();
    var Editors = new EditorCollection();
    var ProjectEditors = new ProjectEditorCollection();
    var Actions = new ActionCollection();

    class ConceptListView extends MView {
        tagName() {return "li"};
        className() {return "concept-li"};
        
    
        getTemplateSelector() {
            return "#concept-list-view";
        }

        select() {
            CurrentConcept.set(this.model);
        }

        postRender() {
            this.$el.unbind('click').click(_.bind(this.select, this));
            this.setSelectedClass();
        }
    }

    class InstanceListView extends MView {
        tagName() {return "li"};
        className() {return "instance-li"};
        
    
        getTemplateSelector() {
            return "#instance-list-view";
        }

        select() {
            CurrentInstance.set(this.model);
        }

        postRender() {
            this.$el.unbind('click').click(_.bind(this.select, this));
            this.setSelectedClass();
        }

        getTemplateContext() {
            var c = _.extend({
                is_empty: (this.model.get('id') == "undefined"),
                id: null
            }, super.getTemplateContext());
            return c;
        }
    }

    class EditorListView extends MView {
        tagName() {return "li"};
        className() {return "editor-li"};
        
    
        getTemplateSelector() {
            return "#editor-list-view";
        }

        getTemplateContext() {
            var context = super.getTemplateContext();

            return _.extend(context, {
                body: this.populateTemplate()
            });
        }

        getEditorTemplateContext():any {
        
            var instance = CurrentInstance.get();
            var values = instance.get('values');

            var value = values[this.model.get('value_field')];

            return {value: value};
        }

        populateTemplate() {
            var template = this.model.get('body');

            var context = this.getEditorTemplateContext();

            return _.template(template)(context);
        }

        postRender() {
            var self = this;
            this.$("input,textarea").unbind('keyup').keyup(function(e) {
                self.recordChange($(e.target).val());
            });

            var options = this.model.get('options');

            //CodeMirror
            if(options.use_codemirror) {
                var cm = CodeMirror.fromTextArea(this.$("textarea").get(0), _.extend({
                    lineNumbers: true,
                    onKeyEvent: function(ed, ev) {
                        self.recordChange(ed.getValue());
                    }
                }, options.codemirror_options));

                //HACK: this won't show up without this...
                setTimeout(function(){cm.refresh();}, 20);
            }
        }

        recordChange(new_value) {
            var instance = CurrentInstance.get();
            var values = instance.get('values');

            var value_field = this.model.get('value_field');
            values[value_field] = new_value;

            instance.set({values:values}, {silent:true});
        }
    }

    class ProjectEditorListView extends EditorListView {
        getEditorTemplateContext():any {
            var context = this.model.get('context');

            var value_field = this.model.get('value_field');
            var value = TheProject.get(value_field);

            return _.extend(context, {value: value});
        }

        recordChange(new_value) {
            console.log("noop");
        }
    }

    class ActionListView extends MView {
        tagName() {return "li"};
        className() {return "action-li"};
        
        getTemplateSelector() {
            return "#action-list-view";
        }

        performAction(e) {
            e.preventDefault();
            var name = this.model.get('name');
            $.post("/actions/" + name + "/perform", function(data){
                console.log(data);
                Actions.fetch();
            }, "json");
        }

        postRender() {
            this.$el.unbind('click').click(_.bind(this.performAction, this));
        }
    }

    class ConceptList extends AppView {
        initialize() {
            super.initialize();
            Concepts.bind('reset', this.render, this);
        }

        getElSelector() {
            return "#concept-list";
        }
        
        render() {
            this.$el.empty();

            var self = this;
            Concepts.each(function(concept){
                var v = new ConceptListView({model: concept});
                self.$el.append(v.render().el);
            });
        }
    }

    class AddInstanceButton extends Backbone.View {
        
        render() {
            var el = $("<a href='#' class='add-instance'>Add</a>");
            el.click(function(e) {
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
        }
    }    

    class InstanceList extends AppView {
        initialize() {
            super.initialize();
            Instances.bind('reset', this.render, this);
        }

        getElSelector() {
            return "#instance-list";
        }
        
        render() {
            this.$el.empty();

            var self = this;
            Instances.each(function(m){
                var v = new InstanceListView({model: m});
                self.$el.append(v.render().el);
            });
            
            //Add an add button
            var v = new AddInstanceButton();
            var button = v.render();
            var li =$("<li>");
            li.append(button);
            self.$el.append(li);
        }
    }

    class EditorsList extends AppView {
        initialize() {
            super.initialize();
            Editors.bind('reset', this.render, this);
        }

        getElSelector() {
            return "#editors";
        }
        
        render() {
            this.$el.empty();

            var self = this;
            Editors.each(function(m){
                var v = new EditorListView({model: m});
                self.$el.append(v.render().el);
            });
        }
    }

    class ActionList extends AppView {
        initialize() {
            super.initialize();
            Actions.bind('reset', this.render, this);
        }

        getElSelector() {
            return "#actions";
        }
        
        render() {
            this.$el.empty();

            var self = this;
            Actions.each(function(m){
                var v = new ActionListView({model: m});
                self.$el.append(v.render().el);
            });
        }
    }

    class SaveLink extends AppView {

        getElSelector() {
            return "#save-link";
        }

        postInit() {
            this.$el.click(_.bind(this.save, this));
        }

        save() {
            var instance = CurrentInstance.get();
            instance.save();
        }
    }

    class ConceptEditor extends AppView {

        getElSelector() {
            return "#concept-editor";
        }

        show() {
            this.$el.show();
        }

        hide() {
            this.$el.hide();
        }
    }  
    
    class ProjectEditor extends AppView {
        private editor_list;

        initialize() {
            super.initialize();
            this.editor_list = this.$("#project-editor-list");
        }

        getElSelector() {
            return "#project-editor";
        }

        show() {
            this.$el.show();
        }

        hide() {
            this.$el.hide();
        }

        render() {
            this.editor_list.empty();

            var self = this;
            ProjectEditors.each(function(m){
                var v = new ProjectEditorListView({model: m});
                self.editor_list.append(v.render().el);
            });
        }
    }  

    declare var TheConceptEditor;
    declare var TheProjectEditor;

    class CurrentWidget extends AppView {

        getElSelector() {
            return "#current-widget";
        }

        postInit() {
            this.$el.change(_.bind(this.swapWidget, this));
        }

        swapWidget(e) {
            var widget = $(e.target).val();
            var label_to_view = {
                'concept-editor': TheConceptEditor,
                'project-editor': TheProjectEditor
            }

            _.each(label_to_view, function(val, key){
                if(key == widget) {
                    val.show();
                } else {
                    val.hide();
                }
            });
        }
    }

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
    
    //PARSING STUFF
    edn.setTagAction(new edn.Tag('spiral', 'Project'), function(obj){
        return new Project(edn.toJS(obj));
    });    
    
    edn.setTagAction(new edn.Tag('spiral', 'Project', 'Action'), function(obj){
        return new Action(edn.toJS(obj));
    });    

    edn.setTagAction(new edn.Tag('spiral', 'CodeBlock'), function(obj){
        return new CodeBlock(edn.toJS(obj));
    });    

    Concepts.bind('reset', function(){
        $.get("/project", function(data){
            var project = edn.toJS(edn.parse(data));
            TheProject = project;
            TheProjectEditor.render();
        }, "text");
    });
}
