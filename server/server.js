var express = require('express');
var app = express();
var port = 9000;
app.use(express.static(__dirname + '/../src'));
app.listen(port);
console.log('Listening at port: '+ port);
