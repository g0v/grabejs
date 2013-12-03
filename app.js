var http = require('http');
var sys = require('sys');
var fs = require('fs');
var url = require('url');
var crypto = require('crypto');
var exec = require('child_process').exec;
var mkdirp = require('mkdirp');
var port = 11111;

var server = http.createServer(function(req, res){
  var grabe = function(url, filename, dest, type){
    if(type == 'image'){
      var ext = '.png';
    }
    else{
      var ext = '.html';
    }
    exec("phantomjs --ignore-ssl-errors=true grab.js '"+url+"' "+filename+ext, function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      else{
        if(type == 'image'){
          cropImage(filename+ext, dest);
        }
        else{
          writeHtml(filename+ext, dest);
        }
      }
    });
  }

  var writeHtml = function(filename, dest){
    fs.exists(filename, function(exists){
      if(exists){
        fs.readFile(filename, function (err, data) {
          if (!err){
            dest = dest.replace(/\.htm|\.html$/g, '')+'.html';
            fs.writeFile(dest, data, function(err){
              if(!err){
                fs.unlink(filename);
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.end(data);
              }
              else{
                notFound();
              }
            });
          }
          else{
            console.log(err);
            notFound();
          }
        });
      }
      else{
        notFound();
      }
    });
  }
  var cropImage = function(source, dest){
    exec("convert -resize 600x -quality 80 "+source+" '"+dest+".jpg'", function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      else{
        fs.unlink(source);
        dest += '.jpg';
        if(fs.existsSync(dest)){
          var img = fs.readFileSync(dest);
          res.writeHead(200, {'Content-Type': 'image/jpeg' });
          res.end(img, 'binary');
        }
        else{
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.write('404 Not Found\n');
          res.end();
        }
      }
    });
    exec("convert -resize 100x -quality 50 "+source+" '"+dest+"_t.jpg'");
    exec("convert -quality 90 "+source+" '"+dest+"_o.jpg'");
  }
  req.on('error', function (err) {
    notFound();
  });
  var notFound = function(){
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write('404 Not Found\n');
    res.end();
  }
  // main
  var p = url.parse(req.url);
  if(p.path.match(/^\/shot\//i)){
    var webpage = p.path.replace(/^\/shot\//,'');
    webpage = webpage.replace(/^https?:\/\//i, '');
    mkdirp('public/shot/'+webpage.substr(0, webpage.lastIndexOf('/')));
    var tmp = crypto.createHash('md5').update(webpage).digest("hex");
    var dir = 'public/shot';
    var dest = dir + '/' + webpage;
    var remote_url = 'http://'+webpage;
    grabe(remote_url, tmp, dest, 'image');
  }
  else if(p.path.match(/^\/html\//i)){
    var webpage = p.path.replace(/^\/html\//,'');
    webpage = webpage.replace(/^https?:\/\//i, '');
    mkdirp('public/html/'+webpage.substr(0, webpage.lastIndexOf('/')));
    var tmp = crypto.createHash('md5').update(webpage).digest("hex");
    var dir = 'public/html';
    var dest = dir + '/' + webpage;
    var remote_url = 'http://'+webpage;
    grabe(remote_url, tmp, dest, 'html');
  }
  else{
    notFound();
  }
});
server.listen(port);
