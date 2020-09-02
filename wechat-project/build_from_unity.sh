#!/bin/sh
game_name=wasm_pub_empty_h5
cp ${game_name}.data.unityweb ./${game_name}.data.unityweb.bin
cp -rf ${game_name}.wasm.code.unityweb ./${game_name}.wasm.code.unityweb.bin
brotli ${game_name}.wasm.code.unityweb -f
cp ${game_name}.wasm.code.unityweb.br ./${game_name}.wasm.br.bin
cp ${game_name}.wasm.framework.unityweb ./${game_name}.wasm.framework.unityweb.js
sed -i '1i\exports.start=' ./${game_name}.wasm.framework.unityweb.js
echo "build succeeded!"

