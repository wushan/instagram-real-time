var express = require("express");
var app = express();
// var port = process.env.PORT || 80;
var port = process.env.PORT || 3700;
var io = require('socket.io').listen(app.listen(port));
var Instagram = require('instagram-node-lib');
var http = require('http');
// var request = ('request');
var intervalID;
var request = require('request');
var mkdirp = require('mkdirp');
var fs = require('fs');
//Create DB Connection
var mysql = require("mysql");

// First you need to create a connection to the db
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "**********",
  database: "sitepoint"
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Connection established');
});

//LIST
con.query('SELECT * FROM employees',function(err,rows){
  if(err) throw err;
  console.log('Data received from Db:\n');
  //list directly
  console.log(rows);
  //Get some formatted thing
  for (var i = 0; i < rows.length; i++) {
    console.log(rows[i].name);
  };
});

//Add Row
var employee = { name: 'Winnie', location: 'Australia' };
con.query('INSERT INTO employees SET ?', employee, function(err,res){
  if(err) throw err;
  console.log('Last insert ID:', res.insertId);
});

con.end(function(err) {
  // The connection is terminated gracefully
  // Ensures all previously enqueued queries are still
  // before sending a COM_QUIT packet to the MySQL server.
});





//Download
var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};
// request
//   .get('https://www.google.com.tw/images/nav_logo231.png')
//   .on('response', function(response) {
//     console.log(response.statusCode) // 200
//     console.log(response.headers['content-type']) // 'image/png'
//   })

// //Save image
// request('https://www.google.com.tw/images/nav_logo231.png').pipe(fs.createWriteStream('doodle.png'));

/**
 * Set the paths for your files
 * @type {[string]}
 */
var pub = __dirname + '/public',
    view = __dirname + '/views';

/**
 * Set the 'client ID' and the 'client secret' to use on Instagram
 * @type {String}
 */
var clientID = '1ef4bf16979c442a8674cb1b58f79bca',
    clientSecret = 'fba9a00c391e493bba5080845f58f249';

/**
 * Set the configuration
 */
Instagram.set('client_id', clientID);
Instagram.set('client_secret', clientSecret);
Instagram.set('callback_url', 'http://middlemiddle.com/callback');
Instagram.set('redirect_uri', 'http://middlemiddle.com');
Instagram.set('maxSockets', 10);

/**
 * Uses the library "instagram-node-lib" to Subscribe to the Instagram API Real Time
 * with the tag "hashtag" lollapalooza
 * @type {String}
 */
Instagram.subscriptions.subscribe({
  object: 'tag',
  object_id: 'sunset',
  aspect: 'media',
  callback_url: 'http://middlemiddle.com/callback',
  type: 'subscription',
  id: '#'
});

// if you want to unsubscribe to any hashtag you subscribe
// just need to pass the ID Instagram send as response to you
Instagram.subscriptions.unsubscribe({ id: '20220865' });

// https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
io.configure(function () {
  io.set("transports", [
    'websocket'
    , 'xhr-polling'
    , 'flashsocket'
    , 'htmlfile'
    , 'jsonp-polling'
  ]);
  io.set("polling duration", 10);
});

/**
 * Set your app main configuration
 */
app.configure(function(){
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(pub));
    app.use(express.static(view));
    app.use(express.errorHandler());
});

/**
 * Render your index/view "my choice was not use jade"
 */
app.get("/views", function(req, res){
    res.render("index");
});

// check subscriptions
// https://api.instagram.com/v1/subscriptions?client_secret=YOUR_CLIENT_ID&client_id=YOUR_CLIENT_SECRET
// https://api.instagram.com/v1/subscriptions?client_secret=fba9a00c391e493bba5080845f58f249&client_id=1ef4bf16979c442a8674cb1b58f79bca
/**
 * On socket.io connection we get the most recent posts
 * and send to the client side via socket.emit
 */
io.sockets.on('connection', function (socket) {
  Instagram.tags.recent({
      name: 'sunset',
      complete: function(data) {
        socket.emit('firstShow', { firstShow: data });
        //Create Folder Structure and save images in the right place.
        var i = 0;
        for (var i = 0; i < data.length && i < 25; i++) {
            // GET THE PICTURE
            var instaPicture = data[i].images.standard_resolution.url;
            var createTime = data[i].created_time;
            var userName = data[i].user.username;
            var date = new Date(createTime*1000);
            var year = date.getFullYear();
            var month = date.getMonth();
            var day = date.getDate();
            var hours = date.getHours();
            var minutes = '0' + date.getMinutes();
            var seconds = '0' + date.getSeconds();
            var formattedStamp = year.toString() + month.toString() + day.toString() + '-' + hours + '-' + minutes + '-' + seconds;
            var pathToDir = 'public/uploads/' + year.toString() + '/' + month.toString() + '/' + day.toString();
            //MAKE DIR
            mkdirp(pathToDir, function (err) {
                if (err){
                  console.error(err);
                } else {
                  // console.log('success');
                }
            });
            //Download image
            download(instaPicture, pathToDir + '/' + formattedStamp + '-' + userName + '.png', function(){
              console.log('done');
            });
        }
      }
  });
});

/**
 * Needed to receive the handshake
 */
app.get('/callback', function(req, res){
    var handshake =  Instagram.subscriptions.handshake(req, res);
});

/**
 * for each new post Instagram send us the data
 */
app.post('/callback', function(req, res) {
    var data = req.body;
    // Grab the hashtag "tag.object_id"
    // concatenate to the url and send as a argument to the client side
    data.forEach(function(tag) {
      var url = 'https://api.instagram.com/v1/tags/' + tag.object_id + '/media/recent?client_id='+clientID;
      sendMessage(url);
      //把 url 丟給 function sendMessage -> 給前端
      goGetit(url);
      //把 url 丟給 function goGetit -> 下載
    });
    res.end();
});

/**
 * Send the url with the hashtag to the client side
 * to do the ajax call based on the url
 * @param  {[string]} url [the url as string with the hashtag]
 */
function sendMessage(url) {
  //把 Url 送給前端執行 ajax request
  io.sockets.emit('show', { show: url });
}

function goGetit(url) {
  //Request the 'url' and get response data (json)
  request(url, function (error, response, body) {
    //如果成功
    if (!error && response.statusCode == 200) {
      //parse JSON data
      query = JSON.parse(body);
      var instaPicture = query.data[0].images.standard_resolution.url;
      var createTime = query.data[0].created_time;
      var userName = query.data[0].user.username;
      var date = new Date(createTime*1000);
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getDate();
      var hours = date.getHours();
      var minutes = '0' + date.getMinutes();
      var seconds = '0' + date.getSeconds();
      var formattedStamp = year.toString() + month.toString() + day.toString() + '-' + hours + '-' + minutes + '-' + seconds;
      var pathToDir = 'public/uploads/' + year.toString() + '/' + month.toString() + '/' + day.toString();
      //MAKE DIR
      mkdirp(pathToDir, function (err) {
          if (err){
            console.error(err);
          } else {
            // console.log('success');
          }
      });
      download(instaPicture, pathToDir + '/' + formattedStamp + '-' + userName + '.png', function(){
        console.log('done');
      });
    } else {
      //Request 錯誤
      console.log(error);
    }
  })
}

console.log("Listening on port " + port);
