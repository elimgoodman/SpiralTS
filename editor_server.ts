///<reference path='node.d.ts' />
///<reference path='underscore.d.ts' />

import http = module("http")
import url = module("url")
import express = module("express")
import _ = module("underscore")

import Serialization = module("lib/serialization")
import Concepts = module("lib/concepts")
import Fields = module("lib/fields")
import Editors = module("lib/editors")
import Hydrator = module("lib/hydrator")
import Project = module("lib/project")
import Globals = module("lib/globals")

var notemplate = require('express-notemplate');
var ejs = require('ejs');

var app = express.createServer();

// Configuration
app.configure(function(){
 app.set('views', __dirname + '/views');
 app.engine('html', notemplate.__express);
 app.set('view engine', 'html');
 app.use(express.bodyParser());
 app.use(express.methodOverride());
 app.use(express.static(__dirname + '/static'));
});

app.configure('development', function(){
 app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
 app.use(express.errorHandler());
});

var project_path = "./sample_project";

var fields = <Fields.Store> new Serialization.FieldReader(project_path).read();
var editors = <Editors.Store> new Serialization.EditorReader(project_path).read();
var concepts = <Concepts.DefinitionStore> new Serialization.ConceptReader(project_path).read();

var globals = new Globals.Globals();
globals.set('concepts', concepts);

//Hydrate all of the references
var hydrator = new Hydrator.Hydrator(concepts, editors, fields);
_.each(concepts.getAll(), function(concept){
    hydrator.hydrateConceptDefition(concept);
});

var project = new Serialization.ProjectReader(project_path).read();

var reader = new Serialization.InstanceReader(project_path);
var writer = new Serialization.InstanceWriter(project_path);

var project_concepts = _.map(project.concept_refs, function(ref){
    return concepts.getByReference(ref);
});

var instances = <Concepts.InstanceStore> reader.read(project_concepts);

_.each(instances.getAll(), function(instance){
    hydrator.hydrateConceptInstance(instance);
});

// Routes
app.get('/', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.render('index', {});
});

app.get('/concepts', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.json(concepts.getAll());
});

app.get('/actions', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.json(project.actions);
});

app.get('/concepts/:name/instances', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;
    res.json(instances.getByConceptName(name));
});

app.post('/concepts/:name/instances', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;
    
    var parent_ref = new Concepts.Reference(name);
    var instance = new Concepts.Instance(parent_ref, {});
    hydrator.hydrateConceptInstance(instance);

    res.json(instance);
});

app.put('/concepts/:name/instances', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;
    
    var parent_ref = new Concepts.Reference(name);
    var instance = new Concepts.Instance(parent_ref, {});

    instance.setValues(req.body.values);
    hydrator.hydrateConceptInstance(instance);

    writer.write(instance);
    instances.add(instance);

    res.json(instance);
});

app.get('/concepts/:name/editors', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var concept_name = req.params.name;
    
    var concept = concepts.getByName(concept_name);
    var templates = _.map(concept.editors, function(editor){
        return editor.toDict(globals);
    });

    res.json(templates);
});

app.put('/concepts/:name/instances/:instance_id', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var concept_name = req.params.name;
    var instance_id = req.params.instance_id;
    
    var instance = instances.getByParentAndId(concept_name, instance_id);

    instance.setValues(req.body.values);
    hydrator.hydrateConceptInstance(instance);

    writer.write(instance);

    res.json(instance);
});

app.post('/actions/:name/perform', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    var name = req.params.name;

    //project.performAction(name);

    res.json({succes: true});
});

app.get('/project', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {
    res.send(Serialization.serializeProject(project));
});

app.get('/project/editors', function(req: express.ExpressServerRequest, res: express.ExpressServerResponse) {

    var name =  new Editors.Instance(
        new Editors.Reference('name'), 
        'Project Name', 
        'name',
        {}
    );

    var concepts = new Editors.Instance(
        new Editors.Reference('multiselect'), 
        'Concepts', 
        'concepts',
        {options: "return globals.get('concepts').getAll();"}
    );
    
    var actions = new Editors.CompoundEditor("actions", [
        new Editors.Instance(
            new Editors.Reference('name'), 
            'Name', 
            'name',
            {}
        ),
        new Editors.Instance(
            new Editors.Reference('name'), 
            'Display Name', 
            'display_name',
            {}
        )
    ]);

    var editors = [name, concepts, actions];

    editors = _.map(editors, function(editor){
        hydrator.hydrateEditorInstance(editor);
        return editor.toDict(globals);
    });

    res.json(editors);
});

app.listen(3000, function(){
   console.log("Listening on port %d in %s mode", 3000, app.settings.env);
});

export var App = app;
