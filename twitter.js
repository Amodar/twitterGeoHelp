var twit = require("twitter"),
    twitter = new twit({
        consumer_key: '6pKwgTccwlSCSScYn2otfQWLz',
        consumer_secret: 'eMsyrGu5NtsZO8TYb8PAk7bG6gFNYZFQ29kG7mk7xummK54lwL',
        access_token_key: '46781891-JR2tm5ehhs9nWamKTRtI0ejRtilPUyiOcEcHwnZq8',
        access_token_secret: 'RcuOWg2ranlfRyGPHl3AyOPayWWpkb0RfRK1kSPQtVELL'
    });
  
var http = require('http');
var path = require('path');
var socketio = require('socket.io');
var express = require('express');

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var connections = 0;

router.use(express.static(path.resolve(__dirname, 'client')));
    
io.sockets.on('connection', function(socket) {
    connections++;
    
    console.log("somebody connected! streaming tweets");
    twitter.stream('statuses/filter', {track: '#helpme, help', language: 'en'}, function(stream) {
        stream.on('data', function(data) {
            if(data.geo && !data.entities.user_mentions[0] && !data.entities.urls[0]) {
                socket.emit('tweet', data);
                if(connections === 0 ){
                    stream.destroy();
                }
            }
        });
        stream.on('error', function(err) {
            console.log("Streaming error");
            console.log(err.message);
        });
    });
    
    socket.on('disconnect', function () {
        connections--;
        console.log('Somebody disconnected!');
        console.log('number of connections: ' + connections);
        
        if(connections === 0) {
            console.log('number of connectionssssssssss: ' + connections);
        }
    });
});

router.get('/', function(req, res) {
    res.sendfile(__dirname + '/client/index.html', {
    message : "tweettweet"
    });
});

server.listen(process.env.PORT);
console.log('Express server started on port %s', process.env.PORT);