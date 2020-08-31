require('./weapp-adapter');

GameGlobal.WebAssembly = WXWebAssembly;

canvas.id = "";
canvas.style.width = window.innerWidth * window.devicePixelRatio //获取屏幕实际宽度
canvas.style.height = window.innerHeight * window.devicePixelRatio //获取屏幕实际高度
canvas.width =  window.innerWidth  * window.devicePixelRatio //真实的像素宽度
canvas.height = window.innerHeight * window.devicePixelRatio //真实的像素高度
console.log('innerWidth', window.innerWidth, window.innerHeight, window.devicePixelRatio)
 
GameGlobal.Module = {};
GameGlobal.UnityLoader = {
SystemInfo: {

    width:  (function() {
      console.log('width', canvas.width)
      return canvas.width;
    }()),
    height:  (function() {
      console.log('height', canvas.height)
      return canvas.height;
    }()),
    gpu: (function() {
        var gl = canvas.getContext("webgl");
        console.log('gl', gl)
        if(gl) {
          var renderedInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if(renderedInfo) {
            return gl.getParameter(renderedInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
        console.log('unknown gpu')
        return 'unknown';
      })(),
      browser: 'wx',
      browserVersion: '0.0',
      language: window.navigator.userLanguage || window.navigator.language,
      hasWebGL: (function() {     
        // webgl1.0
        return 1;
      })(),   
}

};



var gameInstance = {
  url: 'urlxxx',
  onProgress: undefined,
  compatibilityCheck: undefined,
  Module: {
    IsWxGame: true,
    preLoaDataPath: 'wasm_pub_empty_h5.data.unityweb.bin',
    wasmPath: 'wasm_pub_empty_h5.wasm.code.unityweb.bin',
    graphicsAPI: ["WebGL 2.0", "WebGL 1.0"],
    onAbort: function(what){
      if (what !== undefined) {
        this.print(what);
        this.printErr(what);
        what = JSON.stringify(what);
      } else {
        what = '';
      }
      throw 'abort(' + what + ') at ' + this.stackTrace();
    },
    preRun: [],
    postRun: [],
    print: function (message) { console.log(message); },
    printErr: function (message) { console.error(message); },
    Jobs: {},
    canvas: canvas,
    buildDownloadProgress: {},
    resolveBuildUrl: function (buildUrl) { return buildUrl.match(/(http|https|ftp|file):\/\//) ? buildUrl : url.substring(0, url.lastIndexOf("/") + 1) + buildUrl; },
    streamingAssetsUrl: function () { return resolveURL(this.resolveBuildUrl("../StreamingAssets")) },
    pthreadMainPrefixURL: "Build/",
    webglContextAttributes: 
    {
      premultipliedAlpha: 1,
      preserveDrawingBuffer: 1
    }
  },
  SetFullscreen: function() {
    if (gameInstance.Module.SetFullscreen)
      return gameInstance.Module.SetFullscreen.apply(gameInstance.Module, arguments);
  },
  SendMessage: function() {
    if (gameInstance.Module.SendMessage)
      return gameInstance.Module.SendMessage.apply(gameInstance.Module, arguments);
  },
};

gameInstance.Module.gameInstance = gameInstance;
gameInstance.popup = function (message, callbacks) { return UnityLoader.Error.popup(gameInstance, message, callbacks); };
// gameInstance.Module.postRun.push(function() {
//   gameInstance.onProgress(gameInstance, 1);
// });
GameGlobal.Module = gameInstance.Module
var framework = require('./wasm_pub_empty_h5.wasm.framework.unityweb.js');
framework.start(GameGlobal.Module)
var gl = canvas.getContext("webgl");
gl.scissor(0, 0, canvas.width, canvas.height);

var data = wx.onWindowResize(function(res){
  console.log('onWindowResize', res)
})
// wx.setPreferredFramesPerSecond(30)