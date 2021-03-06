#!/usr/bin/bash
#
# Description: Zip the current Titanium project on macOS
# File:        backup.sh
# Author:      Jose Cerrejon (ulysess_at_gmail.com)
# Help:        Copy in the root of your Titanium project and Add to package.json the script: "backup": "sh backup.sh",
#
clear

stop_liveview() {
    local TITANIUM_SDK_PATH
    local SELECTED_SDK_VERSION
    local LIVE_SERVER_PATH
    TITANIUM_SDK_PATH=$(ti config paths.sdks)
    SELECTED_SDK_VERSION=$(ti config sdk.selected)
    LIVE_SERVER_PATH="${TITANIUM_SDK_PATH}/mobilesdk/osx/${SELECTED_SDK_VERSION}/node_modules/liveview/bin/liveview-server"

    if [[ -e $LIVE_SERVER_PATH ]]; then
        printf "\nStopping Live servers..."
        "$LIVE_SERVER_PATH" stop
    fi
}

clean() {
    printf "\nCleaning da hause...\n\n"
    ti clean
}

backup() {
    local DATE
    local PROJECT_NAME
    DATE=$(date +%Y%m%e-%H%M%S)
    PROJECT_NAME=$(basename "$(pwd)")

    cd .. || exit 1
    printf "Zipping...\n"
    zip -qq -r "$PROJECT_NAME"_"$DATE".zip "$PROJECT_NAME" -x ".DS*" -x "__MACOSX" -x "$PROJECT_NAME/node_modules/*"
    printf "\nDone!...\n\n"
    ls -lat "$PROJECT_NAME"_*
}

stop_liveview
clean
backup
open -a "Finder" .
printf "\nPress a key to exit...\n"
read -r
exit
