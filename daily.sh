#!/bin/sh

cd "$(dirname "$0")"

npm run backup
npm run trans_vfile

