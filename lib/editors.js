var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
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
exports.Editor = Editor;
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
exports.Name = Name;
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
exports.URL = URL;
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
exports.HTML = HTML;

