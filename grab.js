var page = require('webpage').create();
var system = require('system');
var fs = require('fs');
var url = system.args[1] || '';
var filename = system.args[2] || '';

if(url && filename){
  var type = filename.match(/png$/) ? 'image' : 'html';
  page.viewportSize = { width: 1280, height: 800};
  page.settings.localToRemoteUrlAccessEnabled = true;
  page.open(url, function (status) {
    if(type === 'html'){
      page.settings.loadImages = false;
    }
    window.setTimeout(function () {
      render(page, type, filename);
      phantom.exit();
    }, 1500);

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
