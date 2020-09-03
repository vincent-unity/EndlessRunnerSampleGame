require('./weapp-adapter');

GameGlobal.WebAssembly = WXWebAssembly;
GameGlobal.alert = function(msg){wx.showToast({title: msg})}
GameGlobal.abort = function(msg){wx.showToast({title: msg});console.error(msg)}

canvas.id = "";
canvas.style.width = window.innerWidth * window.devicePixelRatio //获取屏幕实际宽度
canvas.style.height = window.innerHeight * window.devicePixelRatio //获取屏幕实际高度
canvas.width =  window.innerWidth  * window.devicePixelRatio //真实的像素宽度
canvas.height = window.innerHeight * window.devicePixelRatio //真实的像素高度
canvas.widthNative = 0;//没有用，定义变量
canvas.heightNative = 0;//没有用，定义变量
console.log('innerWidth', window.innerWidth, window.innerHeight, window.devicePixelRatio)

var gameName = "$GAME_NAME";
require('./' + gameName + '.wasm.framework.unityweb.js')

GameGlobal.Module = {};
GameGlobal.cdn = "$DEPLOY_URL";// !!!ATTENTION!! please end with "/"
if(!cdn.endsWith("/")){
  cdn = cdn + "/";
}
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
    wasmPath: gameName + '.wasm.code.unityweb.bin',//.wasm.br.bin // .wasm.code.unityweb.bin
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
    unityFileSystemInit: function () {
      if (!Module.indexedDB) {console.log("IndexedDB is not available. Data will not persist in cache and PlayerPrefs will not be saved.")}
      FS.mkdir("/idbfs");
      FS.mount(IDBFS, {}, "/idbfs");
      var rawdata = "";
      if (Module["rawData"]) {
        rawdata = Module["rawData"];
      } else {
        rawdata = wx.getFileSystemManager().readFileSync(Module["preLoaDataPath"]);
      }
      var data = new Uint8Array(rawdata);
      console.log("data", data);
      var view = new DataView(rawdata);
      var pos = 0;
      var prefix = "UnityWebData1.0 ";
      console.log( "prefix", data.subarray(pos, pos + prefix.length), String.fromCharCode.apply( null, data.subarray(pos, pos + prefix.length) ), "end..." );
      if ( !String.fromCharCode.apply( null, data.subarray(pos, pos + prefix.length) ) == prefix )
        throw "unknown data format";
      pos += prefix.length;
      var headerSize = view.getUint32(pos, true);
      pos += 4;
      while (pos < headerSize) {
        var offset = view.getUint32(pos, true);
        pos += 4;
        var size = view.getUint32(pos, true);
        pos += 4;
        var pathLength = view.getUint32(pos, true);
        pos += 4;
        var path = String.fromCharCode.apply(
          null,
          data.subarray(pos, pos + pathLength)
        );
        pos += pathLength;
        for (
          var folder = 0, folderNext = path.indexOf("/", folder) + 1;
          folderNext > 0;
          folder = folderNext, folderNext = path.indexOf("/", folder) + 1
        ) {
          FS.createPath(
            path.substring(0, folder),
            path.substring(folder, folderNext - 1),
            true,
            true
          );
        }
        FS.createDataFile(
          path,
          null,
          data.slice(offset, offset + size),
          true,
          true,
          true
        );
      }
    },
    preRun: [],
    postRun: [],
    print: function (message) { console.log(message); },
    printErr: function (message) { console.error(message); },
    Jobs: {},
    canvas: canvas,
    buildDownloadProgress: {},
    resolveBuildUrl: function (buildUrl) { return buildUrl.match(/(http|https|ftp|file):\/\//) ? buildUrl : cdn.substring(0, cdn.lastIndexOf("/") + 1) + buildUrl; },
    streamingAssetsUrl: function () { return this.resolveBuildUrl("StreamingAssets") },
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

function readLargeFile(filePath){
  var stats = wx.getFileSystemManager().statSync(filePath);
  var size = stats.size;
  var resultdata = new ArrayBuffer(size);
  var offset = 0;
  var partSize = 8000000;
  for(var offset = 0; offset < size; offset += partSize) {
      var toread = Math.min(partSize, size - offset);
      console.log('read part:', offset, toread);
      var data = wx.getFileSystemManager().readFileSync(filePath, '', offset, toread);
      (new Uint8Array(resultdata)).set(new Uint8Array(data), offset);
  }
  return resultdata;
}

function startUnity(){
  gameInstance.Module.gameInstance = gameInstance;
  gameInstance.popup = function (message, callbacks) { return UnityLoader.Error.popup(gameInstance, message, callbacks); };

  GameGlobal.Module = gameInstance.Module
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
  wx.downloadFile({
    url: cdn + gameInstance.Module["preLoaDataPath"],
    success:(res)=>{
      if(res.statusCode == 200){
        console.log('read data file');
        gameInstance.Module["rawData"] = readLargeFile(res.tempFilePath);
        dataLoaded =1;
        //console.log("dataLoaded:  " + path);
         if(codeLoaded){
          startUnity();
         }
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
