#!/usr/bin/python3
# -*- coding: UTF-8 -*- 
import getopt
import os
import re
import shutil
import sys
import brotli

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
    orientation = "portrait"
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

    # Step 1: Get current working directory
    pythonScriptPath = os.getcwd()

    # Step 2: Prepare
    if dst_dir == '':
        dst_dir = project_name + "-converted/"
    if not os.path.exists(dst_dir):
        os.mkdir(dst_dir)

    # Step 3: Patch Framework
    frameworkFileName = project_name + ".wasm.framework.unityweb"
    print('frameworkFileName  : ' + frameworkFileName)
    adaptFrameworkFile(src_dir + frameworkFileName, dst_dir + frameworkFileName + ".js")

    # Step 4: Modify WeChat Configs
    copyFolder(wechat_dir,dst_dir)
    modifyWeChatConfigs(getConfigFiles(dst_dir), getWeChatConfigs(project_name, app_id, orientation, cdn))

    # Step 5: Generate Bin Files
    wasmCodeFile = project_name + ".wasm.code.unityweb"
    dataFile = project_name + ".data.unityweb"
    shutil.copyfile(src_dir + wasmCodeFile, dst_dir + wasmCodeFile + ".bin")
    shutil.copyfile(src_dir + dataFile, dst_dir + dataFile + ".bin")

    # Step 6: Brotli
    with open(src_dir + wasmCodeFile, 'rb') as codeBin:
        codeBr = brotli.compress(codeBin.read())
        fout = open(dst_dir + wasmCodeFile + ".br.bin", "wb")
        fout.write(codeBr)
        fout.close()
    # shutil.move(src_dir + wasmCodeFile + ".br", dst_dir + wasmCodeFile + ".br.bin")

if __name__ == "__main__":
    main()
