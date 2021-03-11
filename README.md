# Huelva Comercio

👨🏻‍💻 Jose Manuel Cerrejon Gonzalez

✉️ cerrejon@soporttec.es

📍 Huelva, Spain

🏭 Soporttec, S.L.

📚 Copyright ©2021

Dev with ♥️ using [Axway Titanium](https://www.axway.com)

### [ Use ]

-   You must to generate a valid app.tss. Just run npm run `purgetss`

### [ 📦 ]

-   https://github.com/jasonkneen/RESTe

-   https://github.com/Topener/nl.fokkezb.infiniteScroll

-   https://github.com/hansemannn/titanium-firebase-cloud-messaging

-   https://github.com/hansemannn/titanium-ios-document-picker

-   https://github.com/jasonkneen/UTiL/blob/master/docs/xp.ui.md

-   https://github.com/AndreaVitale/av.imageview

-   https://github.com/jasonkneen/TiCons-CLI

-   https://github.com/macCesar/purgeTSS/

### Issues

-   _error: Missing private key for signing certificate. Failed to locate the private key matching certificate in the keychain. To sign with this signing certificate, install its private key in your keychain. If you don't have the private key, select a different signing certificate for CODE_SIGN_IDENTITY in the build settings editor._

SOLUTION: You need to re-build certificates again :(

Follow the next steps:

-   Open XCode > Preferences > Accouts.

-   Click on Role User (Agent later) > Manager Certificates > + and select _Add Apple Development_, later _Add Apple Distribution_.

-   Go to http://appcelerator.com/ios-dev-certs

-   Certificates: Remove old certificates.

-   Devices, Keys: No changes.

-   Profiles: Click on each profiles, then edit button and change the Certificate. Download the new certificates.

-   Double click on certificates already downloader from Finder.

-   On _builder.sh_, change the _PP_UUID_ (You can get the new one it if run _builder.sh_ again).

-   Open keychain Access and remove old certificates.

-   IOS build:

appc "run" "--platform" "ios" "--log-level" "trace" "--project-dir" "/Users/ulysess/Documents/Appcelerator_Studio_Workspace/ceca" "--target" "device" "--device-id" "00008030-001C691001C0802E" "--developer-name" "Apple Development: JOSE CERREJON GONZALEZ (324YU3WC5Y)" "--pp-uuid" "14e72dbd-f2fa-4a50-aa94-e9123d000d5b"
