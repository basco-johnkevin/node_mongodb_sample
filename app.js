var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , MongoClient = require('mongodb').MongoClient;

app.listen(8000, '127.0.0.1');

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {

  socket.on('submit', function (data) {
    console.log(data);

    MongoClient.connect('mongodb://127.0.0.1:27017/mtest', function(err, db) {
      if(err) throw err;

      var collection = db.collection('test_insert');

      // demo how to insert a record
      collection.insert(
        {
          "title": data.title,
          "body": data.body
        },
        {safe: true},
        function(err, documents) {
          if (err) throw err;
          console.log('Document ID is: ' + documents[0]._id);
        }
      );

      // demo how to find a record
      collection.find({"title": data.title}).toArray(
        function(err, results) {
          if (err) throw err;
          console.log(results);
        }
      );

      socket.emit('new_post', data);
    });

  });

});
