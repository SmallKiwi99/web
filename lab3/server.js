var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var mongoClient = new MongoClient("mongodb+srv://tanya:41PWCKUtJXglDs1B@test-cmnmp.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });
var db;

var jsonPath = path.join(__dirname, '.', 'public', 'clients_files', 'json');
var charset = 'utf8';

var server = express();

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());
server.use('/', express.static(__dirname + '/public'));

server.get('/templates', function(req, res){

    var jsonString = fs.readdirSync(jsonPath, charset);
    return res.json({'files': jsonString});

});

server.get('/raw/:name', function(req, res){

    var file = jsonPath+'/'+req.params.name;

    if (fs.existsSync(file)) {
        fs.readFile(file, charset, function(err, data){
            var sendData = JSON.parse(data);
            return res.json({status:'200', message: 'OK', data: sendData});
        });
    }else{
        return res.json({status:'404', message:'ERROR', data:null});
    }
});

server.get('/database', function(req, res){
    var options = {
        projection: {
            _id: 0
        }
    }
    var cursor = db.collection('info').find({}, options);
    cursor.toArray(function(err, docs){
        if(err) {
            console.log(err);
            return res.sendStatus(500);
        }
        res.send(docs);
    });

});

server.post('/database', function(req, res) {

    var json_templ = (JSON.parse(`${req.body.currentTemplate}`)).data;
    console.log(json_templ);
    var keys = Object.keys(json_templ);

    json_templ[keys[1]] = `${req.body[keys[1]]}`;

    for (var i = 0; i < json_templ[keys[2]].length; i++) {

        var current_obj = json_templ[keys[2]][i];
        var current_keys = Object.keys(current_obj);

        for (var j = 1; j < current_keys.length; j++) {
            current_obj[current_keys[j]] = `${req.body[current_keys[j]]}`;
        }
    }

    var request_data = {
        data:json_templ
    };

    db.collection('info').insertOne(request_data, function(err, result){
        res.send('Данные формы занесены в БД');
        res.redirect('/');
    });

});



server.get('/', function(req, res) {
    res.render('index.html');
});

server.listen(3000, function() {
    console.log(`http://localhost:3000`);
});

mongoClient.connect(function(err, client){
    db = client.db("taxes");
});