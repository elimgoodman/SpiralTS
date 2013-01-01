
(function (InstanceReader) {
    var Reader = (function () {
        function Reader(project_path) {
            this.project_path = project_path;
        }
        Reader.prototype.readInstances = function () {
            return [];
        };
        return Reader;
    })();
    InstanceReader.Reader = Reader;    
})(exports.InstanceReader || (exports.InstanceReader = {}));


