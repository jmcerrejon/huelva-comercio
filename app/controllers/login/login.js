const fcm = require('firebase.cloudmessaging');
const isANewRegistry = true;
const maxTrySignIn = 3;
let signInAttempts = 0;

(function constructor() {
    if (ENV_DEV) {
        $.txtEmail.value = 'ulysess@gmail.com';
        $.txtPassword.value = 'secret';
    }
})();

function close() {
    $.login.close();
    $.destroy();
}

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

function doRegister() {
    if (!canSubmit(isANewRegistry)) return;

    Alloy.Globals.loading.show('Espere unos instantes...');
    Alloy.Globals.Api.signup(
        {
            body: {
                email: $.txtEmail.value,
                password: $.txtPassword.value,
            },
        }, (response) => {
            if (!response.success) {
                alert('Hubo un problema en el registro. Revise si el correo es correcto o inténtelo de nuevo mas tarde.');

                return;
            }

            alert(response.message);
        }
    );
}

function doSignIn(e) {
    if (!canSubmit()) return;

    Alloy.Globals.loading.show('Comprobando...');
    Alloy.Globals.Api.signin(
        {
            email: $.txtEmail.value.trim(),
            password: $.txtPassword.value,
            device_name: OS_IOS ? 'ios' : 'android',
        }, (response) => {
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
            close();
        }
    );
}

function sendChangePassword() {
    var dialog = Ti.UI.createAlertDialog({
        title: 'No recuerda su contraseña',
        message:
            '¿Desea que le enviemos un nuevo correo para cambiar la contraseña?',
        buttonNames: ['No', 'Si, por favor'],
        cancel: 0,
    });

    function onClick(e) {
        dialog.removeEventListener('click', onClick);
        if (e.index === e.source.cancel) {
            signInAttempts = 0;

            return;
        }

        if (!$.txtEmail.hasText()) {
            alert('Escriba en el formulario el Correo electrónico.');

            return false;
        }

        Alloy.Globals.Api.resetPassword(
            {
                email: $.txtEmail.value.trim(),
            }, (response) => {
                alert(response.message, 'Cambio de contraseña');
            }
        );
    }
    dialog.addEventListener('click', onClick);
    dialog.show();
}

function canSubmit(isRegister = false) {
    if (!$.txtEmail.hasText() || !$.txtPassword.hasText()) {
        alert('Rellene los campos');
        return false;
    }

    if (!require('core').valideEmail($.txtEmail.value.trim())) {
        alert('El Email no tiene un formato correcto.', 'Email inválido');

        return false;
    }

    if (isRegister) {
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
    Alloy.createController('dashboard').getView().open();
    close();
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

    setNotificationsSettings();

    if (!_.isNull(user)) {
        // We need this for refresh token in the file
        Alloy.Globals.Api.setRequestHeaders({
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + Alloy.Globals.token,
        });
    }
}

function setNotificationsSettings() {
    let settings = Ti.App.Properties.getObject('settings');

    settings['dinamization_notifications'] = true;
    fcm.subscribeToTopic('dinamization_notifications');

    if (Alloy.Globals.isAffiliate) {
        settings['communication_notifications'] = true;
        fcm.subscribeToTopic('communication_notifications');
    }

    if (Alloy.Globals.isLeadership) {
        settings['leadership_notifications'] = true;
        fcm.subscribeToTopic('leadership_notifications');
    }

    Ti.App.Properties.setObject('settings', settings);
}
