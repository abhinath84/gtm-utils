#!/bin/sh
#
# aniruddh/rishabh ; 19-Aug-22 ; Created.
#
#############################################################################################

# https://community.chocolatey.org/packages/nodejs.install/0.10.3#versionhistory
# choco list -localonly
# choco uninstall <node-install-name> -dvyaf

# navigate to %APPDATA%
cd $APPDATA

# call npm uninstall
echo ">> Uninstalling gtm-utils application ..."
npm uninstall -g gtm-utils

# remove gtm-utils folder
echo ">> Removing gtm-utils application related data..."
rm -rf gtm-utils
