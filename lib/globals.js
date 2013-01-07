var Globals = (function () {
    function Globals() {
        this.vars = {
        };
    }
    Globals.prototype.get = function (key) {
        return this.vars[key];
    };
    Globals.prototype.set = function (key, val) {
        this.vars[key] = val;
    };
    return Globals;
})();
exports.Globals = Globals;

