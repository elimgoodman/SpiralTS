var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Spiral;
(function (Spiral) {
    var MView = (function (_super) {
        __extends(MView, _super);
        function MView() {
            _super.apply(this, arguments);

        }
        MView.prototype.render = function () {
            this.$el.html(this.template(this.getTemplateContext()));
            this.$el.data('backbone-model', this.model);
            this.postRender();
            return this;
        };
        MView.prototype.postRender = function () {
        };
        MView.prototype.getTemplateContext = function () {
            return this.model.toJSON();
        };
        MView.prototype.initialize = function () {
            this.model.bind('change', this.render, this);
            this.postInit();
        };
        MView.prototype.postInit = function () {
        };
        return MView;
    })(Backbone.View);    
})(Spiral || (Spiral = {}));

