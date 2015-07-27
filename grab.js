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
    page.evaluate(function() {
        var body = document.body;
        body.style.backgroundColor = '#fff';
        var style = document.createElement('style');
        style.innerHTML = '@font-face { font-family: "Droid Sans Fallback"; src: url("/usr/share/fonts/opentype/droid/DroidSansFallbackFull.otf") format("opentype"); } html * { font-family: "Droid Sans Fallback"; }'
        style.type = 'text/css';
        document.getElementsByTagName("head")[0].appendChild(style);
    });
    if(type === 'html'){
      page.settings.loadImages = false;
    }
    page.clipRect = {top:0, left:0, width:1280, height:1024};
    window.setTimeout(function () {
      render(page, type, filename);
      phantom.exit();
    }, 3500);
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
