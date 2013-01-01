var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var Field = (function () {
    function Field(name) {
        this.name = name;
    }
    return Field;
})();
exports.Field = Field;
var Str = (function (_super) {
    __extends(Str, _super);
    function Str() {
        _super.apply(this, arguments);

    }
    return Str;
})(Field);
exports.Str = Str;
var URL = (function (_super) {
    __extends(URL, _super);
    function URL() {
        _super.apply(this, arguments);

    }
    return URL;
})(Str);
exports.URL = URL;
var HTML = (function (_super) {
    __extends(HTML, _super);
    function HTML() {
        _super.apply(this, arguments);

    }
    return HTML;
})(Str);
exports.HTML = HTML;

