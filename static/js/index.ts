///<reference path='../../backbone.d.ts' />
///<reference path='../../jquery.d.ts' />


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
    class Instance extends Backbone.Model {}
    class Editor extends Backbone.Model {}
    class Action extends Backbone.Model {}

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
            var instance_id = CurrentInstance.get().get('id');

            return "/concepts/" + concept + "/instances/" + encodeURIComponent(instance_id) + "/editors";
        }
    }

    var Concepts = new ConceptCollection();
    var Instances = new InstanceCollection();
    var Editors = new EditorCollection();
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

        populateTemplate() {
            var template = this.model.get('body');

            var instance = CurrentInstance.get();
            var values = instance.get('values');

            var value = values[this.model.get('value_field')];

            return _.template(template)({value: value});
        }

        postRender() {
            this.$("input,textarea").unbind('keyup').keyup(_.bind(this.recordChange, this));
        }

        recordChange(e) {
            var new_value = $(e.target).val();

            var instance = CurrentInstance.get();
            var values = instance.get('values');

            var value_field = this.model.get('value_field');
            values[value_field] = new_value;

            instance.set({values:values}, {silent:true});

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

    var TheConceptList = new ConceptList();
    var TheInstanceList = new InstanceList();
    var TheEditors = new EditorsList();
    var TheActionList = new ActionList();
    var TheSaveLink = new SaveLink();

    Concepts.fetch();
    Actions.fetch();
}
