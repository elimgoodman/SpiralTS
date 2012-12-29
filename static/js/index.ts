///<reference path='../../backbone.d.ts' />
///<reference path='../../jquery.d.ts' />


module Spiral {
    class MView extends Backbone.View {

        public template: any;

        render(): MView {
            this.$el.html(this.template(this.getTemplateContext()));
            this.$el.data('backbone-model', this.model);
            this.postRender();
            return this;
        }
        postRender() {}
        getTemplateContext() {
            return this.model.toJSON();
        }
        initialize() {
            this.model.bind('change', this.render, this);
            this.postInit();
        }
        postInit() {}
    }

}
