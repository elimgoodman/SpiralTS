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
        }
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

    class ConceptCollection extends Backbone.Collection {
        url() {
            return "/concepts";
        }

        public model = Concept;
    }

    class InstanceCollection extends Backbone.Collection {
        public model = Instance;
    }

    var Concepts = new ConceptCollection();
    var Instances = new InstanceCollection();

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

    var TheConceptList = new ConceptList();
    var TheInstanceList = new InstanceList();

    Concepts.fetch();
}
