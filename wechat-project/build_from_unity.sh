#!/bin/sh
cp ../unity_empty_h5/wasm_pub_empty_h5/Build/wasm_pub_empty_h5.data.unityweb ./wasm_pub_empty_h5.data.unityweb.bin
cp -rf ../unity_empty_h5/wasm_pub_empty_h5/Build/wasm_pub_empty_h5.wasm.code.unityweb ./wasm_pub_empty_h5.wasm.code.unityweb.bin
brotli ../unity_empty_h5/wasm_pub_empty_h5/Build/wasm_pub_empty_h5.wasm.code.unityweb -f
cp ../unity_empty_h5/wasm_pub_empty_h5/Build/wasm_pub_empty_h5.wasm.code.unityweb.br ./wasm_pub_empty_h5.wasm.br.bin
cp ../unity_empty_h5/wasm_pub_empty_h5/Build/wasm_pub_empty_h5.wasm.framework.unityweb ./wasm_pub_empty_h5.wasm.framework.unityweb.js
sed -i '1i\exports.start=' ./wasm_pub_empty_h5.wasm.framework.unityweb.js
echo "build succeeded!"
