var page = require('webpage').create();
var system = require('system');
var fs = require('fs');
var url = system.args[1] || '';
var filename = system.args[2] || '';

if(url && filename){
  var type = filename.match(/png$/) ? 'image' : 'html';
  page.viewportSize = { width: 1280, height: 1024 };
  page.settings.localToRemoteUrlAccessEnabled = true;
  page.open(url, function (status) {
    if(type === 'html'){
      page.settings.loadImages = false;
    }
    page.clipRect = {top:0, left:0, width:1280, height:1024};
    if (status === 'success') {
      render(page, type, filename);
      phantom.exit();
    }
    else {
      window.setTimeout(function () {
        render(page, type, filename);
        phantom.exit();
      }, 20000); // Change timeout as required to allow sufficient time 
    }
  });
}
var render = function(page, type, filename){
  if(type == 'html'){
    try {
      fs.write(filename, page.content);
    }
    catch(e) {
      console.log(e);
    }
  }
  else{
    page.render(filename);
  }
}
