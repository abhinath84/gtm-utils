#!/bin/csh -f
#
# aniruddh/rishabh ; 19-Aug-22 ; Created.
#
#############################################################################################

function install_node() {
    echo "### Installing node v16 lts..."
    choco install nodejs-lts
}

function update_npm() {
    echo "### Installing latest npm..."
    npm install -g npm@latest
}

# Check if node is installed, if installed check if it is v16.
node_ver=`node -v`
#echo $node_ver
if [[ -z "$node_ver" ]]; then
    # Install the node lts
    install_node
    result="$?"
    if [ "$result" -ne 0 ]; then
        echo "!!! Node installation failed."
        exit
    fi
    echo "### Node installed successfully."
    
    # Update the NPM
    update_npm
    result2="$?"
    if [ "$result2" -ne 0 ]; then
        echo "!!! NPM update failed."
        exit
    fi
    echo "### NPM updated successfully."
elif [[ $node_ver != *16.* ]]; then
    echo "Current node version is: ${node_ver}. You need to install version 16.* or above"
    echo "Please uninstall it. And run this script again."
    exit
# elif [[ $node_ver == *16.* ]]; then
#     echo $node_ver
#     echo "Required Node version already exists."
#     exit
fi

# install 'gtm-utils' application
curl -o gtm-utils.zip https://github.com/abhinath84/gtm-utils/releases/download/V1.0.0/gtm-utils.zip
unzip gtm-utils.zip
npm install
npm link
