#!/bin/sh

cd "$(dirname "$0")"

npm run backup
npm run trans_vfile

cd SFCTSVN_zhcn/
make
