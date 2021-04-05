#!/bin/sh

PROJECT_DIR="/Users/ulysess/Documents/Appcelerator/ceca"

# iOS
ios() {
    echo "Remember: If you change minor version (max.min.path, for example 1.0.0 -> 1.1.0), it takes 24 hours for submit review. Path version are inmediately submitted."
    DISTRIBUTION_NAME="iPhone Distribution: SOPORTTEC SERVICIOS INFORMATICOS INTEGRADOS PARA EMPRESAS SL (WDS48L3DS9)"
    PP_UUID="8b2d99f8-389c-4f5d-ac02-b0f6ed4017e4"

    # appc run -p ios -T dist-appstore --log-level info --project-dir "$PROJECT_DIR" --distribution-name "$DISTRIBUTION_NAME" --pp-uuid "$PP_UUID"
    ti build -f --platform ios --project-dir "$PROJECT_DIR" --deploy-type production --distribution-name "$DISTRIBUTION_NAME" --keychain --pp-uuid "$PP_UUID" --target dist-appstore --no-progress-bars --no-prompt --no-banner --prompt-type socket-bundle --prompt-port 53711
}

# ANDROID
android() {
    # For build keystore: `keytool -genkey -v  -keyalg RSA -validity 10000 -keysize 4096  -dname "CN=Jose Cerrejon, OU=Mobile development, O=Soporttec SL, L=Huelva, ST=Spain, C=ES" -storepass cecaxyz77 -alias ceca -keystore com.soporttec.ceca.jks`
    KEYSTORE="$PROJECT_DIR/cert/android/com.sopportec.ceca.jks"
    OUTPUT_DIR="$PROJECT_DIR/dist"
    appc run -p android -T dist-playstore --log-level info --project-dir "/Users/ulysess/Documents/Appcelerator/ceca" --output-dir "$OUTPUT_DIR" --keystore "$KEYSTORE" --alias ceca --store-password cecaxyz77
}

clear
read -p "Select device for package: iOS or Android? (ios/and): " option
case "$option" in
ios) ios ;;
and) android ;;
*) ios ;;
esac
