#!/bin/sh

PROJECT_DIR="/Users/ulysess/Documents/Appcelerator_Studio_Workspace/foe-ahora"

# iOS
ios() {
    echo "Remember: If you change minor version (max.min.path, for example 1.0.0 -> 1.1.0), it takes 24 hours for submit review. Path version are inmediately submitted."
    DISTRIBUTION_NAME="Apple Distribution: SOPORTTEC SERVICIOS INFORMATICOS INTEGRADOS PARA EMPRESAS SL (WDS48L3DS9)"
    PP_UUID="20bb2139-0cd2-4a65-8195-fc4b5421e4c0"

    appc run -p ios -T dist-appstore --log-level info --project-dir "$PROJECT_DIR" --distribution-name "$DISTRIBUTION_NAME" --pp-uuid "$PP_UUID"
}

# ANDROID
android() {
    KEYSTORE="$PROJECT_DIR/cert/android/com.sopportec.foeahora.jks"
    OUTPUT_DIR="$PROJECT_DIR/dist"
    appc run -p android -T dist-playstore --log-level info --project-dir "/Users/ulysess/Documents/Appcelerator_Studio_Workspace/foe-ahora" --output-dir "$OUTPUT_DIR" --keystore "$KEYSTORE" --alias foeahora --store-password SoporFOE42!
}

clear
read -p "Select device for package: iOS or Android? (ios/and): " option
case "$option" in
ios) ios ;;
and) android ;;
*) ios ;;
esac
