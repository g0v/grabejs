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
    console.log(url);
    if(type == 'image'){
      var ext = '.png';
    }
    else{
      var ext = '.html';
    }
    var interval;
    interval = setInterval(function(){
      fs.exists(filename+ext, function(exists){
        if(exists){
          if(type == 'image'){
            cropImage(filename+ext, dest);
          }
          else{
            writeHtml(filename+ext, dest);
          }
          clearInterval(interval);
        }
      });
    }, 5000);
    if(type == 'image'){
      exec("wkhtmltoimage --width 1280 --javascript-delay 10000 -q " + url + " " + filename+ext, function (error, stdout, stderr) {
        cropImage(filename+ext, dest);
      });
    }
    else{
      exec("phantomjs --web-security=no --ignore-ssl-errors=true grab.js '"+url+"' "+filename+ext, function (error, stdout, stderr) {
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
    exec("convert -resize 120x -gravity north -crop 120x90+0+0 "+source+" '"+dest+"_t.png'");
    exec("convert -quality 75 "+source+" '"+dest+"_o.png'");
    exec("convert -resize 600x -gravity north -crop 600x400+0+0 "+source+" '"+dest+".png'", function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
      }
      else{
        fs.unlink(source);
        dest += '.png';
        if(fs.existsSync(dest)){
          var img = fs.readFileSync(dest);
          res.writeHead(200, {'Content-Type': 'image/png' });
          res.end(img, 'binary');
        }
        else{
          res.writeHead(404, {'Content-Type': 'text/plain'});
          res.write('404 Not Found\n');
          res.end();
        }
      }
    });
  }
  req.on('error', function (err) {
    notFound();
  });
  var notFound = function(){
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.write('404 Not Found\n');
    res.end();
  }
  // main
  var p = url.parse(req.url);
  if(p.path.match(/^\/shot\//i)){
    var webpage = p.path.replace(/^\/shot\//, '');
    var md5 = crypto.createHash('md5').update(webpage).digest("hex");
    webpage = webpage.replace(/^https?:\/\//i, '');
    var dir = 'public/shot';
    var dest = dir + '/' + webpage;
    var dirs = webpage.replace(/\/*$/, '');
    var domain = webpage.substr(0, webpage.indexOf('/'));
    var remote_url = 'http://'+webpage;
    var md5_path = 'public/shot/'+domain+'/'+md5;

    if(dest.length > 100){
      dest = md5_path;  
    }
    console.log(dirs);
    mkdirp('public/shot/'+dirs);
    if(fs.existsSync(dest+'.png')){
      var img = fs.readFileSync(dest+'.png');
      res.writeHead(200, {'Content-Type': 'image/png' });
      res.end(img, 'binary');
      return;
    }
    else{
      grabe(remote_url, md5, dest, 'image');
    }
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
