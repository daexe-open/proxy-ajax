import buble from 'rollup-plugin-buble'

export default {
    entry: 'src/bin/proxy.js',
    dest: 'bin/proxy',
    format: 'cjs',
    banner: '#!/usr/bin/env node',
    external: ['opts', 'pjson', 'path','http-proxy','fs'],
    paths: {
        pjson: '../package.json'
    },
    plugins: [
        buble()
    ]
}