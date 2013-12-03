var page = require('webpage').create();
var system = require('system');
var url = system.args[1];
var filename = system.args[2];
page.viewportSize = { width: 1280, height: 1024 };
page.settings.localToRemoteUrlAccessEnabled = true;
page.onInitialized = function() {
  page.evaluate(function() {
    setTimeout(function() {
      window.callPhantom();
    }, 10000);
  });
};
page.open(url, function () {
  page.clipRect = {top:0, left:0, width:1280, height:1280};
  page.render(filename);
  phantom.exit();
});
