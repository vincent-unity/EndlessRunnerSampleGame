require('./weapp-adapter');
GameGlobal.WebAssembly = WXWebAssembly;
canvas.id = "";
canvas.style.width = window.innerWidth * window.devicePixelRatio //获取屏幕实际宽度
canvas.style.height = window.innerHeight * window.devicePixelRatio //获取屏幕实际高度
canvas.width =  window.innerWidth  * window.devicePixelRatio //真实的像素宽度
canvas.height = window.innerHeight * window.devicePixelRatio //真实的像素高度
console.log('innerWidth', window.innerWidth, window.innerHeight, window.devicePixelRatio)

var gameName = "wasm_pub_empty_h5";

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
    preLoaDataPath: gameName + '.data.unityweb.bin',//.bin
    wasmPath: gameName + '.wasm.code.unityweb.br.bin',//.wasm.br.bin // .wasm.code.unityweb.bin
    // wasmBin:"",
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

GameGlobal.alert = function(msg){wx.showToast({title: msg})}

GameGlobal.cdn = "http://10.86.98.91:8080/";// !!!ATTENTION!! please end with "/"

function startUnity(){
  gameInstance.Module.gameInstance = gameInstance;
  gameInstance.popup = function (message, callbacks) { return UnityLoader.Error.popup(gameInstance, message, callbacks); };

  GameGlobal.Module = gameInstance.Module 
  require('./' + gameName + '.wasm.framework.unityweb.js')
  GameGlobal.UnityModule(GameGlobal.Module)
  var gl = canvas.getContext("webgl");
  gl.scissor(0, 0, canvas.width, canvas.height);
}

var platform = wx.getSystemInfoSync().platform;
if(platform == "devtools") {
  gameInstance.Module["wasmPath"] = gameName + '.wasm.code.unityweb.bin';
  gameInstance.Module["preLoaDataPath"] = gameName + '.data.unityweb.bin';
  startUnity();
} else {
  var dataLoaded=0, codeLoaded=0;
  wx.request({
    url: cdn + gameInstance.Module["preLoaDataPath"],
    responseType: 'arraybuffer',
    timeout: 10000,
    success: ({ data }) => {
      dataLoaded = 1;
      gameInstance.Module["rawData"] = data;
      console.log("raw Data loaded  ");
      if(codeLoaded){
        startUnity();
      }
    }
  });
  
  wx.downloadFile({
    url: cdn + gameInstance.Module["wasmPath"],
    success:(res)=>{
      if(res.statusCode == 200){
        var path = wx.getFileSystemManager().saveFileSync(res.tempFilePath, wx.env.USER_DATA_PATH+"/"+gameInstance.Module["wasmPath"]);
        gameInstance.Module["wasmPath"] = path;
        codeLoaded = 1;
        console.log("codeLoaded:  " + path);
        if(dataLoaded){
          startUnity();
        }
      }
    }
  });
}
