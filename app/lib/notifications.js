(function () {
    if (OS_ANDROID) {
        const PlayServices = require('ti.playservices');
    }
    var FirebaseCore = require('firebase.core');
    FirebaseCore.configure();

    var fcm = require('firebase.cloudmessaging');

    var _exports = function () {
        if (OS_IOS) {
            Ti.App.iOS.addEventListener(
                'usernotificationsettings',
                function eventUserNotificationSettings() {
                    // Remove the event again to prevent duplicate calls through the Firebase API
                    Ti.App.iOS.removeEventListener(
                        'usernotificationsettings',
                        eventUserNotificationSettings
                    );

                    // Register for push notifications
                    Ti.Network.registerForPushNotifications({
                        success: function (res) {
                            console.log('success Ti.Network!');
                        },
                        error: function (res) {
                            console.log(
                                'Error Ti.Network!: ' +
                                    JSON.stringify(res, null, 2)
                            );
                        },
                        callback: function (response) {
                            console.log('callback Ti.Network!');
                            onMessage(response);
                        },
                    });
                }
            );

            // Register for the notification settings event
            Ti.App.iOS.registerUserNotificationSettings({
                types: [
                    Ti.App.iOS.USER_NOTIFICATION_TYPE_ALERT,
                    Ti.App.iOS.USER_NOTIFICATION_TYPE_SOUND,
                    Ti.App.iOS.USER_NOTIFICATION_TYPE_BADGE,
                ],
            });

            Ti.App.iOS.addEventListener('notification', function (event) {
                // Handle foreground notification
                console.log('notification. Handle foreground notification');
                console.log(JSON.stringify(event, null, 2));
            });

            Ti.App.iOS.addEventListener(
                'remotenotificationaction',
                function (event) {
                    // Handle background notification action click
                    console.log(
                        'remotenotificationaction. Handle background notification action click'
                    );
                    console.log(JSON.stringify(event, null, 2));
                }
            );
        } else {
            fcm.registerForPushNotifications({
                success: function (res) {
                    console.log('success fcm!');
                    console.log(JSON.stringify(res, null, 2));
                },
                error: function (res) {
                    console.log('Error fcm!: ' + JSON.stringify(res, null, 2));
                },
                callback: function (res) {
                    console.log('callback fcm!');
                    console.log(JSON.stringify(res, null, 2));
                },
            });
            fcm.setForceShowInForeground(true);
        }

        fcm.addEventListener('didRefreshRegistrationToken', onToken);
        fcm.addEventListener('didReceiveMessage', onMessage); // Called when direct messages arrive. Note that these are different from push notifications
        fcm.addEventListener('onMessageReceived', function (res) {
            console.log('inside onMessageReceived!');
            console.log(JSON.stringify(res, null, 2));
        });
        console.log('deviceToken: ' + fcm.fcmToken);

        function onToken(e) {
            console.log(
                `Alloy.Globals.deviceToken = ${Alloy.Globals.deviceToken}`,
                ` | e.fcmToken = ${e.fcmToken}`
            );

            if (Alloy.Globals.deviceToken == e.fcmToken) {
                return;
            }

            console.log('Token mismatch... Refreshing token!: ' + e.fcmToken);

            Ti.App.Properties.setString('deviceToken', e.fcmToken);
            Alloy.Globals.deviceToken = e.fcmToken;
            fcm.subscribeToTopic('offer_notifications');
        }

        function onMessage(response) {
            Alloy.Globals.events.trigger(
                'handle_notification',
                OS_IOS ? response.data : response.message.data
            );
        }

        if (OS_ANDROID) {
            // console.log('last push data: ' + JSON.stringify(fcm.lastData, null, 2));
            Alloy.Globals.androidDataPush = fcm.lastData;
        }
    };
    module.exports = _exports;
})();
