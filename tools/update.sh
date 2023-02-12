#!/bin/sh
#
# aniruddh/rishabh ; 19-Aug-22 ; Created.
#
#############################################################################################

# check gtm-utils installed or not
installedNpmApp=`npm list --global gtm-utils`
if [[ $installedNpmApp = *"gtm-utils"* ]]; then
# if grep -q "gtm-utils" <<< $installedNpmApp; then
  # navigate to %APPDATA%
  cd $APPDATA

  # removing old packages
  if [ ! -d "gtm-utils" ]; then
    echo ""
    echo ">> gtm-utils application is not installed inside '$APPDATA' folder. Please install it properly before update."
    echo ""
  else
    # move to that folder
    cd "gtm-utils"

    # remove old packages
    echo ""
    echo ">> Removing old packages ..."
    rm -rf *

    # download zip file
    echo ">> Downloading gtm-utils.zip ..."
    wget https://github.com/abhinath84/gtm-utils/releases/download/V1.0.0/gtm-utils.zip

    echo ""
    echo ">> Unzip gtm-utils.zip ..."
    unzip gtm-utils.zip

    echo ""
    echo ">> Installing node_modules ..."
    # npm install
    npm install --production

    echo ""
    echo ">> Removing gtm-utils.zip ..."
    rm -rf gtm-utils.zip

    echo ""
    echo ">> Update completed ..."
    echo ""
  fi
else
  echo ""
  echo ">> gtm-utils application is not installed. Please install before update."
  echo ""
fi
