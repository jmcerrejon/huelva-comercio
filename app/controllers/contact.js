function call() {
    const resultOptionDialog = Ti.UI.createOptionDialog({
        title: 'Llamar al siguiente número de teléfono:',
        options: [Alloy.CFG.phone, 'Cancelar'],
        cancel: 1,
    });

    resultOptionDialog.addEventListener('click', function (e) {
        if (e.index === 1) {
            return;
        }
        if (
            Ti.Platform.osname !== 'ipad' &&
            Ti.Platform.model !== 'iPod Touch' &&
            Ti.Platform.model !== 'google_sdk' &&
            Ti.Platform.model !== 'Simulator'
        ) {
            Ti.Platform.openURL(
                'tel://' + e.source.options[e.index].replace(/[^0-9]/g, '')
            );
            Ti.API.info(
                'Llamando a...' +
                    e.source.options[e.index].replace(/[^0-9]/g, '')
            );
        } else {
            Alloy.Globals.showMessage(
                'Lo siento, su dispositivo no puede hacer llamadas.',
                'Mensaje'
            );
        }
    });
    resultOptionDialog.show();
}

function selectLocation() {
    const address = `${Alloy.CFG.name}, Huelva`;

    Ti.Platform.openURL(`https://maps.apple.com/?q=${address}&z=8&t=m`);
}

function sendEmail() {
    let formValid = true;

    // Hide the keyboard
    $.content.blur();

    _.each([$.content, $.user], function (val) {
        if (val.value === '' || val.value === 'Escriba aquí su consulta') {
            val.borderColor = 'red';
            formValid = false;
        } else {
            val.borderColor = 'transparent';
        }
    });

    if (!require('core').valideEmail($.user.value)) {
        Alloy.Globals.showMessage(
            'Compruebe que es un email válido.',
            'Email incorrecto'
        );
        return;
    }

    if (formValid) {
        postToEmail(Alloy.Globals.deviceToken, $.user.value, $.content.value);
    }
}

function focusField(e) {
    switch (e.source.id) {
        case 'firstFieldNext':
            $.user.focus();
            break;
        case 'secondFieldNext':
        default:
            $.content.focus();
    }
}

function lostFocus() {
    _.each([$.content, $.user], function (val) {
        val.blur();
    });
}

function postToEmail(token, email, content) {
    Alloy.Globals.loading.show('Enviando...');
    Alloy.Globals.Api.sendEmail(
        {
            body: {
                token: token,
                email: email,
                content: content,
            },
        },
        (response) => {
            Alloy.Globals.loading.hide();
            $.content.value = $.user.value = '';
            Alloy.Globals.showMessage(
                'Le responderemos a la mayor brevedad.\n¡Gracias!.',
                response.message
            );
        }
    );
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

function openInstagram() {
    Ti.Platform.openURL(Alloy.CFG.instagram);
}

function openFacebook() {
    Ti.Platform.openURL(
        Ti.Platform.canOpenURL('fb://')
            ? Alloy.CFG.facebook_scheme
            : Alloy.CFG.facebook_url
    );
}

function openMail() {
    Ti.UI.Clipboard.setText(Alloy.CFG.mail);
    Alloy.Globals.showMessage('Email copiado al portapapeles.', '');
}
