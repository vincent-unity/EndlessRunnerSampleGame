#!/usr/bin/python3
# -*- coding: UTF-8 -*- 
import getopt
import os
import re
import shutil
import sys

quiet = False

def getConfigFiles(directory):
    files = [
            directory + "game.js",
            directory + "game.json",
            directory + "project.config.json"
        ]
    return files

def getWeChatConfigs(project_name, app_id, orientation, cdn):
    configs = [
            {"key": "$GAME_NAME", "value": project_name},
            {"key": "$APP_ID", "value": app_id},
            {"key": "$ORIENTATION", "value": orientation},
            {"key": "$DEPLOY_URL", "value": cdn}
        ]
    return configs

replaceRules = [
    {
        "old": "clientHeight",
        "new": "height"
    },
    {
        "old": "clientWidth",
        "new": "width"
    },
    {
        "old": "document\.URL",
        "new": '""'
    },
    {
        "old": "canvas\.style\.setProperty\(",
        "new": "if(canvas.style.setProperty)canvas.style.setProperty("
    },
    {
        "old": "canvas\.style\.removeProperty\(",
        "new": "if(canvas.style.removeProperty)canvas.style.removeProperty("
    },
    {
        "old": 'if\( *!\( *Module\[\"wasmMemory\"\]',
        "new": 'if(!Module.IsWxGame && !(Module["wasmMemory"]'
    },
    {
        "old": "return *WebAssembly\.instantiate *\( *binary *, *info *\)",
        "new": 'if(Module["wasmBin"]){return WebAssembly.instantiate(Module["wasmBin"], info);}return WebAssembly.instantiate(Module["wasmPath"], info)'
    },
    # {
    #     "old": 'function *_emscripten_set_canvas_element_size_calling_thread.*return *0[\n\r\t\s ]*\} *function *_emscripten_set_canvas_element_size_main_thread',
    #     "new": 'function _emscripten_set_canvas_element_size_calling_thread(target, width, height) {return -4;}function _emscripten_set_canvas_element_size_main_thread'
    # },
    {
        "old": 'var *autoResizeViewport *= *false;',
        "new": 'var autoResizeViewport = false;return -4;'
    },
    {
        "old": 'unityFileSystemInit\(\)',
        "new": '''GameGlobal.FS = FS;GameGlobal.IDBFS = IDBFS;unityFileSystemInit();'''
    },
    {
        "old": 'function *getBinary\( *\) *\{',
        "new": 'function getBinary() {return;'
    },
    # {
    #     "old": 'FS.mkdir.*idbfs.*FS.mount.*idbfs\" *\) *[;]?',
    #     "new": '''
    #     FS.mkdir("/idbfs");FS.mount(IDBFS, {}, "/idbfs");
    #     var rawdata = "";
    #     if (Module["rawData"]) {rawdata = Module["rawData"];} else {rawdata = wx.getFileSystemManager().readFileSync(Module["preLoaDataPath"]);}
    #     var data = new Uint8Array(rawdata);console.log("data", data);var view = new DataView(rawdata);var pos = 0;var prefix = "UnityWebData1.0 ";
    #     console.log("prefix",data.subarray(pos, pos + prefix.length),String.fromCharCode.apply(null,data.subarray(pos, pos + prefix.length)),"end...");
    #     if (!String.fromCharCode.apply(null,data.subarray(pos, pos + prefix.length)) == prefix)throw "unknown data format";
    #     pos += prefix.length;var headerSize = view.getUint32(pos, true);pos += 4;
    #     while (pos < headerSize) {
    #         var offset = view.getUint32(pos, true);pos += 4;var size = view.getUint32(pos, true);pos += 4;
    #         var pathLength = view.getUint32(pos, true);pos += 4;
    #         var path = String.fromCharCode.apply(null,data.subarray(pos, pos + pathLength));
    #         pos += pathLength;
    #         for (var folder = 0, folderNext = path.indexOf("/", folder) + 1;folderNext > 0;folder = folderNext, folderNext = path.indexOf("/", folder) + 1){
    #         Module["FS_createPath"](path.substring(0, folder),path.substring(folder, folderNext - 1),true,true);
    #         }
    #         Module["FS_createDataFile"](path,null,data.slice(offset, offset + size),true,true,true);
    #     }
    #     '''
    # },
]
def adaptFrameworkFile(srcFilePath, dstFilePath):
    result = ""

    if not os.path.isfile(srcFilePath):
        print("File Not Exists Conception: ", srcFilePath)
        return
    with open(srcFilePath, 'r', encoding="utf-8") as reader:
        reader.seek(0, 0)
        _lines = reader.readlines()
        for line in _lines:
            if line.strip() == "" or re.match("^[ \t]*//", line):
                continue
            result = result + line
        reader.close()
    
    for rule in replaceRules:
        result = re.sub(rule["old"], rule["new"], result)
        print("-------++++++")
    
    result = result.strip()
    if result.__contains__("UnityModule"):
        result = result + "\n GameGlobal.UnityModule = UnityModule;"
    else:
        if result.startswith("(") and result.endswith(")"):
            result = result[1 : len(result)-1 : 1]
        result = "GameGlobal.UnityModule = " + result
    fileout = open(dstFilePath, "w", encoding="utf-8")
    fileout.write(result)
    fileout.close()

# Modify wechat configs
def modifyWeChatConfigs(files: [], configs: []):
    for file in files:
        file_data = ""
        with open(file, 'r', encoding="utf-8") as reader:
            reader.seek(0, 0)
            lines = reader.readlines()
            for line in lines:
                for config in configs:
                    if line.__contains__(config["key"]):
                        if config["value"].strip() != '':
                            line = line.replace(config["key"], config["value"])
                        break
                file_data = file_data + line
            reader.close()
        fout = open(file, "w", encoding="utf-8")
        fout.write(file_data)
        fout.close()
    return

def copyFolder(src_path, dest_path):
    if not os.path.exists(dest_path):
        os.mkdir(dest_path)

    files = os.listdir(src_path)

    for file in files:
        shutil.copyfile(src_path + file, dest_path + file)
    return

def main():
    global quiet
    prettier = False
    app_id = ""
    src_dir = "Build/"
    wechat_dir = "wechat-default/"
    dst_dir = ''
    project_name = ""
    orientation = "landscape"
    cdn = ""

    # Parse arguments.
    options, args = getopt.getopt(sys.argv[1:], 's:d:f:a:o:c:',
                                  ['src=', 'dst=', 'file=', 'appid=', 'orientation=', 'cdn='])
    for opt, arg in options:
        if  opt in ('-s', '--src'):
            src_dir = arg
        elif opt in ('-d', '--dst'):
            dst_dir = arg
        elif opt in ('-f', '--file'):
            project_name = arg
        elif opt in ('-a', '--appid'):
            app_id = arg
        elif opt in ('-o', '--orientation'):
            orientation = arg
        elif opt in ('-c', '--cdn'):
            cdn = arg
# python WebGL2WeChat.py -a wx1a6e8263a3437579 -f webgl-disable -c http://10.86.98.91:8080/
    # Step 1: Get current working directory
    pythonScriptPath = os.getcwd()

    # Step 2: Prepare
    if dst_dir == '':
        dst_dir = project_name + "-converted/"
    if not os.path.exists(dst_dir):
        os.mkdir(dst_dir)

    # Step 4: Modify tiny js file
    frameworkFileName = project_name + ".wasm.framework.unityweb"
    print('frameworkFileName  : ' + frameworkFileName)
    adaptFrameworkFile(src_dir + frameworkFileName, dst_dir + frameworkFileName + ".js")

    copyFolder(wechat_dir,dst_dir)
    modifyWeChatConfigs(getConfigFiles(dst_dir), getWeChatConfigs(project_name, app_id, orientation, cdn))

if __name__ == "__main__":
    main()
