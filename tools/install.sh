#!/bin/sh
#
# aniruddh/rishabh ; 19-Aug-22 ; Created.
#
#############################################################################################

# https://community.chocolatey.org/packages/nodejs.install/0.10.3#versionhistory
# choco list -localonly
# choco uninstall <node-install-name> -dvyaf
# choco install nodejs.install --version=0.10.3

function install_node() {
  echo ">>> Installing node v16 lts..."
  # choco install -y --force nodejs.install --version=14.20.0
  choco install -y --force nodejs-lts
}

function update_npm() {
  echo ">>> Installing latest npm..."
  npm install -g npm@latest
}

# Check if node is installed, if installed check if it is v16.
node_ver=`node -v`
# echo $node_ver
if [[ -z "$node_ver" || $node_ver != *16.* ]]; then
    # Install the node lts
    install_node
    result="$?"
    if [ "$result" -ne 0 ]; then
        echo "!!! Node installation failed."
        exit
    fi
    echo "### Node installed successfully."
    
    # add nodejs path to PATH environment variable
    PATH="$PROGRAMFILES\nodejs":$PATH

    # Update the NPM
    update_npm
    result2="$?"
    if [ "$result2" -ne 0 ]; then
        echo "!!! NPM update failed."
        exit
    fi
    echo "### NPM updated successfully."
fi

# working_dir = `pwd`;
# navigate to %APPDATA%
cd $APPDATA

# create 'gtm-utils' folder if not exists
if [ ! -d "gtm-utils" ]; then
   mkdir "gtm-utils"
fi

# move to that folder
cd "gtm-utils"

# remove all files/folder
rm -rf *

# copy .zip file
# --no-check-certificate
echo ">> Downloading gtm-utils.zip ..."
wget https://github.com/abhinath84/gtm-utils/releases/download/V1.0.0/gtm-utils.zip
# curl -LJO https://github.com/abhinath84/gtm-utils/releases/download/V1.0.0/gtm-utils.zip

echo ""
echo ">> Unzip gtm-utils.zip ..."
unzip gtm-utils.zip

echo ""
echo ">> Installing node_modules ..."
# npm install
npm install --production

echo ""
echo ">> Linking gtm-utils ..."
npm install -g

echo ""
echo ">> Removing gtm-utils.zip ..."
rm -rf gtm-utils.zip

echo ""
echo ">> Installation completed ..."
echo ""
# go back to working directory
# cd $working_dir
