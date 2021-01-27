/**
 * @class Controller.signup.signup
 * Display signup view
 *
 */
const MIN_PASSWORD_CHAR = 4;

/**
 * @method Controller
 * Display signup view
 * @param  {Arguments} args Arguments passed to the controller
 */
(function constructor(args) {
    $.navbar.load({
        btnLeft: {
            visible: true,
        },
        title: {
            text: 'Registro',
        },
    });
})($.args);

/**
 * submit - description
 *
 * @param  {type} e description
 * @return {type}   description
 */
function submit(e) {
    var obj = {
        email: $.email.getValue(),
        password: $.password.getValue(),
        passwordConfirm: $.passwordConfirm.getValue(),
    };

    if (obj.email && obj.password && obj.passwordConfirm) {
        if (
            obj.password !== $.passwordConfirm.getValue() ||
            obj.password.length < MIN_PASSWORD_CHAR
        ) {
            Alloy.Globals.showMessage(
                `La contraseña no coincide o tiene menos de ${MIN_PASSWORD_CHAR} caracteres.`
            );

            return false;
        }
        if (!require('core').valideEmail(obj.email)) {
            Alloy.Globals.showMessage(
                'El Email no tiene un formato correcto.',
                'Email inválido'
            );

            return false;
        }

        if ($.accept_privacy.getValue() === false) {
            Alloy.Globals.showMessage(
                'Primero debe aceptar las condiciones de privacidad.'
            );
            return;
        }

        Alloy.Globals.loading.show('Registrando afiliado...');
        //WS LOGIN
        Alloy.Globals.Api.signup(
            {
                body: _.omit(obj, 'passwordConfirm'),
            },
            function (response) {
                if (response.success) {
                    close();
                    Alloy.Globals.showMessage(
                        'Revise la bandeja de su correo electrónico y valide su usuario.',
                        'Registrado'
                    );
                }
            }
        );
    } else {
        var d = [];
        _.each(obj, function (elem, key) {
            if (!elem) {
                var view = $[key];
                if (view) {
                    if (view.textfield.required) {
                        var keyEntire = 'form.' + key;
                        d.push(L(keyEntire) + '');
                    }
                }
            }
        });

        Alloy.Globals.showMessage(d.join('\n'), 'Rellene los campos');

        return false;
    }
}

function helpRecoverEmailDialog({index}) {
    switch (index) {
        case 0:
            callCECA();
            break;

        default:
            break;
    }
}

function callCECA() {
    const phoneNumber = Alloy.CFG.phone.split(' ').join('');
    if (Ti.Platform.model.includes('Simulator')) {
        Alloy.Globals.showMessage(
            `Lo siento, su dispositivo no puede llamar al ${phoneNumber}`,
            'Mensaje'
        );
        return;
    }
    Ti.Platform.openURL(`tel://${phoneNumber}`);
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

function helpRecoverEmail() {
    $.dlgHelp.show();
}

/**
 * close - description
 *
 * @param  {type} e description
 * @return {type}   description
 */
function close(e) {
    $.win.close();
}

function activePasswordMask(e) {
    var isMasked = $.password.lblRight.text === '\uf06e';
    $.password.textfield.setPasswordMask(isMasked);
    $.password.lblRight = {
        text: !isMasked ? '\uf06e' : '\uf070',
        color: 'gray',
    };
}

/**
 * next - description
 *
 * @param  {type} e description
 * @return {type}   description
 */
function next(e) {
    if ($[e.source.next]) $[e.source.next].focus();
}

function previous(e) {
    if ($[e.source.previous]) $[e.source.previous].focus();
}
