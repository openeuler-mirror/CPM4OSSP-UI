#!/bin/bash

# Usage:
# sh build.sh RELEASE_SERVER ARCH

# 发布服务器地址，eg，172.30.40.249
RELEASE_SERVER=$1
# amd64
ARCH=$2
# 80
OS_VERSION=$3
# 1.0.3
VERSION=$4

# 发布文件夹： /var/www/html/mpms/UI/amd64/80/
RELEASE_DIR=/var/www/html/mpms/UI/$ARCH/$OS_VERSION
RELEASE_SERVER_PWD=root

SSH_OPTIONS="-o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"


echo "链接依赖目录到项目: /home/rocky/node_modules -> $(pwd)/node_modules"
ln -sf  /home/rocky/node_modules $(pwd)/node_modules
echo "开始打包"
npm run electron:deb
sshpass -p $RELEASE_SERVER_PWD ssh $SSH_OPTIONS root@$RELEASE_SERVER "rm -rf $RELEASE_DIR/*.deb"
sshpass -p $RELEASE_SERVER_PWD scp $SSH_OPTIONS dist_electron/mini*.deb root@$RELEASE_SERVER:$RELEASE_DIR/