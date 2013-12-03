var page = require('webpage').create();
var system = require('system');
var url = system.args[1];
var filename = system.args[2];
page.viewportSize = { width: 1280, height: 1024 };
page.settings.localToRemoteUrlAccessEnabled = true;
page.open(url, function (status) {
  page.clipRect = {top:0, left:0, width:1280, height:1024};
  if (status !== 'success') {
    page.render(filename);
    phantom.exit();
  }
  else {
    window.setTimeout(function () {
      page.render(filename);
      phantom.exit();
    }, 15000); // Change timeout as required to allow sufficient time 
  }
});
