const fcm = require('firebase.cloudmessaging');
const isANewRegistry = true;
const maxTrySignIn = 3;

let settings = Ti.App.Properties.getObject('settings');
let signInAttempts = 0;

function doLostFocus() {
    _.each([$.txtEmail, $.txtPassword], function (val) {
        val.blur();
    });
}

function doFocusPasswordField() {
    $.txtPassword.focus();
}

function validatePasswordAndRegister() {
    if (!$.txtPassword.hasText()) return;
    doRegister();
}

// Register

function doRegister() {
    if (!canSubmit(isANewRegistry)) return;

    Alloy.Globals.loading.show('Espere unos instantes...');
    Alloy.Globals.Api.signup(
        {
            body: {
                email: $.txtEmail.value,
                password: $.txtPassword.value,
            },
        },
        function (response) {
            if (response.success) {
                alert(
                    'Revise la bandeja de su correo electrónico y valide su usuario.',
                    'Registro'
                );
            }
        }
    );
}

// Sign In

function doSignIn(e) {
    if (!canSubmit()) return;

    Alloy.Globals.loading.show('Comprobando...');
    Alloy.Globals.Api.signin(
        {
            email: $.txtEmail.value,
            password: $.txtPassword.value,
            device_name: OS_IOS ? 'ios' : 'android',
        },
        (response) => {
            if (!response.success) {
                signInAttempts++;
                if (signInAttempts === maxTrySignIn) {
                    sendChangePassword();
                    return;
                }

                alert(response.content.message, 'Sin acceso');
                return;
            }
            saveUserAndConnect(response.data);
            Alloy.createController('index').getView();
            $.login.close();
        }
    );
}

// Forgot Password

function sendChangePassword() {
    var dialog = Ti.UI.createAlertDialog({
        title: 'No recuerda su contraseña',
        message:
            '¿Desea que le enviemos un nuevo correo para cambiar la contraseña?',
        buttonNames: ['No', 'Si, por favor'],
        cancel: 0,
    });
    dialog.addEventListener('click', function (e) {
        if (e.index === e.source.cancel) {
            signInAttempts = 0;
            return;
        }

        // TODO Reset password
        Alloy.Globals.Api.resetPassword(
            {
                email: $.txtEmail.value,
            },
            (response) => {
                alert(response.message, 'Cambio de contraseña');
            }
        );
    });
    dialog.show();
}

function canSubmit(isRegister = false) {
    if (!$.txtEmail.hasText() || !$.txtPassword.hasText()) {
        alert('Rellene los campos');
        return false;
    }

    if (!require('core').valideEmail($.txtEmail.value)) {
        alert('El Email no tiene un formato correcto.', 'Email inválido');

        return false;
    }

    if (isRegister) {
        console.log(`isRegister = ${isRegister}`);
        if ($.accept_privacy.getValue() === false) {
            alert('Primero debe aceptar las condiciones de privacidad.');
            return false;
        }
    }

    return true;
}

function doReadPrivacy() {
    Alloy.createController('webviewWin', {
        url: Alloy.CFG.url_privacy,
        title: 'Huelva Comercio',
        share: false,
    })
        .getView()
        .open();
}

function doGoToDashboard() {
    Alloy.Globals.loading.show('Cargando contenido...');
    saveUserAndConnect();
    $.login.close();
    Alloy.createController('dashboard').getView().open();
}

function saveUserAndConnect(user = null) {
    const hasAffiliate = !_.isNull(user) && !_.isNull(user.affiliate);

    Ti.App.Properties.setBool('isAffiliate', hasAffiliate);
    Alloy.Globals.isAffiliate = hasAffiliate;

    if (hasAffiliate) {
        Alloy.Globals.isLeadership = !!user.affiliate.leaderships;
        Ti.App.Properties.setBool('isLeadership', !!user.affiliate.leaderships);
    }

    Ti.App.Properties.setBool('guest', _.isNull(user));
    Alloy.Globals.guest = _.isNull(user);

    Ti.App.Properties.setObject('user', _.isNull(user) ? null : user);
    Alloy.Globals.user = _.isNull(user) ? null : user;

    Ti.App.Properties.setString(
        'token',
        _.isNull(user) ? null : user.device_token
    );
    Alloy.Globals.token = _.isNull(user) ? null : user.device_token;

    Ti.App.Properties.setBool('isConnected', true);

    if (!_.isNull(user)) {
        // We need this for refresh token in the file
        Alloy.Globals.Api.setRequestHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Alloy.Globals.token,
        });
    }

    printGlobalVars();
}

function printGlobalVars() {
    console.log('printGlobalVars...');
    console.log(
        'guest = ' +
            Ti.App.Properties.getBool('guest') +
            ' | Alloy.Globals.guest = ' +
            Alloy.Globals.guest
    );

    console.log(
        'user = ' +
            JSON.stringify(Ti.App.Properties.getObject('user'), null, 2) +
            ' | Alloy.Globals.user = ' +
            JSON.stringify(Alloy.Globals.user, null, 2)
    );
    console.log(
        'token = ' +
            Ti.App.Properties.getString('token') +
            ' | Alloy.Globals.token = ' +
            Alloy.Globals.token
    );
    console.log(
        'is affiliate = ' +
            Ti.App.Properties.getBool('isAffiliate') +
            ' | Alloy.Globals.isAffiliate = ' +
            Alloy.Globals.isAffiliate
    );
    console.log(
        'is leadership = ' +
            Ti.App.Properties.getBool('isLeadership') +
            ' | Alloy.Globals.isLeadership = ' +
            Alloy.Globals.isLeadership
    );
}

// TODO Optional features if we are in time

// function handlePushNotifBySectorId(sectorId) {
//     settings['demands']
//         ? fcm.subscribeToTopic(`sector_${sectorId}`)
//         : fcm.unsubscribeFromTopic(`sector_${sectorId}`);
// }

// function next(e) {
//     if ($[e.source.next]) $[e.source.next].focus();
// }

// function previous(e) {
//     if ($[e.source.previous]) $[e.source.previous].focus();
// }

// function activePasswordMask(e) {
//     var isMasked = $.password.lblRight.text === '\uf06e';
//     $.password.textfield.setPasswordMask(isMasked);
//     $.password.lblRight = {
//         text: !isMasked ? '\uf06e' : '\uf070',
//         color: 'gray',
//     };
// }
