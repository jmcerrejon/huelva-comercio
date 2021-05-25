const MINUTES_IN_MILLISECONDS_30 = 1800000;

exports.showMessage = (message, title = 'Atención') => {
    Alloy.Globals.loading.hide();
    Ti.UI.createAlertDialog({
        title,
        message,
        ok: 'Vale',
    }).show();
};

// exports.requestCameraPermission = (callback) => {
//     if (Ti.Media.hasCameraPermissions()) {
//         callback(true);
//     } else {
//         if (OS_IOS) {
//             if (
//                 Ti.Media.cameraAuthorization ===
//                 Ti.Media.CAMERA_AUTHORIZATION_DENIED
//             ) {
//                 var dialog = Ti.UI.createAlertDialog({
//                     buttonNames: ['Si', 'No'],
//                     message: '¿Desea confirmar los permisos a la Cámara?',
//                     title: 'Permisos Cámara',
//                 });
//                 dialog.addEventListener('click', (e) => {
//                     if (e.index === 0) {
//                         Ti.Platform.openURL(
//                             Ti.App.iOS.applicationOpenSettingsURL
//                         );
//                     }
//                 });
//                 dialog.show();

//                 // return success:false without an error since we already informed the user
//                 callback(false);
//             } else {
//                 Ti.Media.requestCameraPermissions((e) => {
//                     if (!e.success) {
//                         callback(false);
//                     } else {
//                         callback(true);
//                     }
//                 });
//             }
//         } else if (OS_ANDROID) {
//             Ti.Media.requestCameraPermissions((e) => {
//                 if (!e.success) {
//                     callback(false);
//                 } else {
//                     callback(true);
//                 }
//             });
//         }
//     }
// };

exports.hideView = (view) => {
    view.applyProperties({
        height: 0,
        visible: false,
    });
};

exports.showView = (visible = true, height = Ti.UI.SIZE) => {
    view.applyProperties({
        height,
        visible,
    });
};

exports.ucfirst = (string) => {
    var result = (string || '').toLowerCase();

    return result.charAt(0).toUpperCase() + result.slice(1);
};

exports.openPDF = (remotePDF) => {
    Alloy.Globals.loading.show('Cargando PDF... ', false);

    var tempFile = Ti.Filesystem.getFile(
        Ti.Filesystem.tempDirectory,
        'info.pdf'
    );

    downloadRemoteFile(tempFile, remotePDF, () => {
        Alloy.Globals.loading.hide();

        if (OS_IOS) {
            Ti.UI.iOS
                .createDocumentViewer({
                    url: tempFile.nativePath,
                })
                .show();
        } else {
            try {
                Ti.Android.currentActivity.startActivity(
                    Ti.Android.createIntent({
                        action: Ti.Android.ACTION_VIEW,
                        type: 'application/pdf',
                        data: tempFile.nativePath,
                    })
                );
            } catch (e) {
                Alloy.Globals.alert(
                    'No PDF apps installed. Please install a PDF viewer to view this file.'
                );
            }
        }
    });
};

// exports.add2Calendar = (calendar) => {
//     if (Ti.Calendar.hasCalendarPermissions()) {
//         setCalendar(calendar);
//     } else {
//         Ti.Calendar.requestCalendarPermissions((e) => {
//             if (e.success) {
//                 setCalendar(calendar);
//             } else {
//                 Ti.API.error(e.error);
//                 alert(
//                     'No tenemos acceso al calendario. Revise los permisos de la aplicación en los Ajustes.'
//                 );
//             }
//         });
//     }
// };

exports.isPhoneNumber = (element) => {
    let isPhone = true;

    if (element.length < 8 || element.length > 9) {
        isPhone = false;
    }

    for (let i = 0, len = element.length; i < len; i++) {
        if (isNaN(element[i])) {
            isPhone = false;
        }
    }

    return isPhone;
};

exports.openEmailForm = ({email, messageBody, subject}) => {
    var emailDialog = Ti.UI.createEmailDialog({
        toRecipients: [email],
        messageBody: messageBody || '',
        subject: subject || 'Correo desde App Huelva Comercio',
    });

    if (emailDialog.isSupported()) {
        try {
            emailDialog.open();
            if (OS_ANDROID) {
                emailDialog.addEventListener('complete', function (e) {
                    if (e.result === emailDialog.FAILED) {
                        Alloy.Globals.showMessage('E-Mail no pudo ser enviado');
                    }
                });
            }
        } catch (e) {
            Alloy.Globals.showMessage('E-mail no configurado en el sistema');
        }
        return;
    }
    Alloy.Globals.showMessage('E-mail no configurado en el sistema');
};

exports.hasBlacklistedEmail = (email) => {
    const blackEmailList = ['hotmail', 'outlook'];
    return blackEmailList.some((el) => email.includes(el));
};

exports.openIOSSettings = () => {
    //  NOTE I think UIApplicationOpenSettingsURLString is required on tiapp.xml.
    if (OS_ANDROID) {
        console.log('This function is only for iOS');
        return;
    }
    var settingsURL = Ti.App.iOS.applicationOpenSettingsURL;
    if (settingsURL != undefined) {
        if (Ti.Platform.canOpenURL(settingsURL)) {
            Ti.Platform.openURL(settingsURL);
        } else {
            alert('No se puede abrir la configuración.');
        }
    } else {
        alert('No se puede abrir applicationOpenSettingsURL');
    }
};

// function setCalendar({begin, end, title, info}) {
//     const endEvent = end ? end : parseInt(begin + MINUTES_IN_MILLISECONDS_30);
//     var details = {
//         title,
//         begin: new Date(begin),
//         end: new Date(endEvent),
//     };
//     if (OS_IOS) {
//         details.notes = info;
//         // Some specific detail values
//         var ical = Ti.Calendar.defaultCalendar;
//         if (null !== calendar) {
//             details.availability = Ti.Calendar.AVAILABILITY_BUSY;
//             detailsallDay = false;
//             var event = ical.createEvent(details);
//             var millis = 24 * 60 * 60 * 1000;

//             // Create the event
//             event.alerts = [
//                 event.createAlert({
//                     relativeOffset: -millis,
//                 }),
//             ];
//             event.save(Ti.Calendar.SPAN_FUTUREEVENTS);
//             alert(
//                 'Cita guardada en el calendario. Se la recordaremos 24 horas antes.'
//             );
//         } else {
//             alert('No existe ningún calendario.');
//         }
//     } else if (OS_ANDROID) {
//         details.description = info;
//         var CALENDAR_TO_USE = 1;
//         var calendar = Ti.Calendar.getCalendarById(CALENDAR_TO_USE);

//         // Create the event

//         if (null !== calendar) {
//             var event = calendar.createEvent(details);
//             var reminderDetails = {
//                 minutes: 1440,
//                 method: Ti.Calendar.METHOD_ALERT,
//             };

//             event.createReminder(reminderDetails);
//             alert('Cita guardada en el calendario.');
//         } else {
//             alert('Necesita tener algún calendario para agregarle una cita.');
//             return false;
//         }
//     }
// }

function isiOS13() {
    var version = Ti.Platform.version.split('.');
    return parseInt(version[0]) >= 13 && parseInt(version[1]) >= 1;
}

function downloadRemoteFile(file, remoteUrl, callback) {
    if (Ti.Network.online) {
        var client = Ti.Network.createHTTPClient();
        client.setTimeout(120000);
        client.onload = function () {
            if (client.status == 200) {
                file.write(this.responseData);

                callback();
            }
        };
        client.open('GET', remoteUrl);
        client.send();
    }
}
