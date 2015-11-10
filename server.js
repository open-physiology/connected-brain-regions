/**
 * Created by dsar941 on 11/10/2015.
 */

var express = require('express');
var app = express();

app.use(express.static('public'));

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("Server is listening at http://%s:%s", host, port);
})