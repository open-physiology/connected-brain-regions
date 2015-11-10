/**
 * Created by dsar941 on 11/10/2015.
 */

var express = require('express');
var app = express();

app.use(express.static('public'));

app.get('/index.html', function (req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.get('/index.js', function (req, res) {
    console.log("Hello World!");
})

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Example app listening at http://%s:%s", host, port)
})