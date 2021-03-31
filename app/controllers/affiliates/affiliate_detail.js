const utils = require('/utils');
let elements = {
    address: [],
    phones: [],
    emails: [],
    websites: [],
    visible: true,
};
let editModeEnable = false;
let updateAffiliate = false;

(function constructor(args) {
    let options = {
        btnLeft: {
            visible: true,
        },
        title: {
            visible: true,
            text: args.data.name,
        },
    };
    handleImageLogo(args.data.logo_path);
    if (canEdit(args.data.affiliate_id)) {
        options.btnRight = {
            visible: true,
            title: '\uf044',
        };
        setInputValues({
            visible: args.data.visible || '',
            address: args.data.address || '',
            phone1: args.data.phone1 || '',
            phone2: args.data.phone2 || '',
            email1: args.data.email1 || '',
            email2: args.data.email2 || '',
            email3: args.data.email3 || '',
            category: args.data.category || '',
            web: args.data.web || 'https://',
        });
    }

    // $.navbar.load(options);

    renderElements('address', [args.data.address]);
    renderElements('phones', [args.data.phone1, args.data.phone2]);
    renderElements('emails', [
        args.data.email1,
        args.data.email2,
        args.data.email3,
    ]);
    renderElements('websites', [args.data.web]);
    renderElements('category', [args.data.category]);
})($.args);

function handleImageLogo(logo = null) {
    if (_.isUndefined($.vw_logo)) {
        return;
    }

    !logo
        ? ($.vw_logo.height = 0)
        : ($.logoEdit.image = $.logoShow.image = logo);
}

function canEdit(affiliateId) {
    return (
        Alloy.Globals.guest === false &&
        Alloy.Globals.user.affiliate_id === affiliateId
    );
}

function renderElements(item, argsData) {
    const tmpElements = argsData.filter((element) => Boolean(element));

    if (_.isUndefined($['lb_' + item])) {
        return;
    }
    if (tmpElements.length == 0) {
        $['vw_' + item].height = 0;
        return;
    }
    elements[item] = [...tmpElements];
    $['lb_' + item].text = tmpElements.join(' - ');
}

function setInputValues(item) {
    for (var key in item) {
        _.isUndefined($[key].views.buttonWrapper)
            ? $[key].setValue(item[key])
            : $[key].setActive(item[key]);
    }
    changeCheckboxVisibleText();
}

function changeCheckboxVisibleText() {
    $.visible.setText(
        $.visible.textContent.activer
            ? 'Mi empresa estará publicada en esta aplicación'
            : 'NO quiero que mi empresa aparezca en esta aplicación'
    );
    $.lbVisible.width = $.lbVisible.height = !$.visible.textContent.activer
        ? Ti.UI.SIZE
        : 0;
}

function doActionNavbar(e) {
    switch (e.type) {
        case 'back':
            close();
            break;
        case 'action':
            updateAffiliate = true;
            editMode();
            break;
    }
}

function editMode() {
    editModeEnable = !editModeEnable;
    // $.navbar.load({
    //     btnRight: {
    //         title: editModeEnable ? '\uf06e' : '\uf044',
    //     },
    // });
    $.vwEdit.height = editModeEnable ? Ti.UI.SIZE : '0';
    $.vwShow.height = editModeEnable ? '0' : Ti.UI.SIZE;
}

function close() {
    if (updateAffiliate) {
        var alertDialog = Ti.UI.createAlertDialog({
            title: 'Afiliado actualizado',
            message:
                'Ha modificado datos de la empresa. ¿Desea guardar los cambios?',
            buttonNames: ['No', 'Sí'],
            cancelButton: 0,
        });
        alertDialog.addEventListener('click', function (e) {
            if (e.index === 0) {
                $.wAffiliateDetail.close();
                return;
            }

            Alloy.Globals.loading.show('Enviando...');

            const body = {
                visible: $.visible.getValue(),
                address: $.address.getValue(),
                phone1: $.phone1.getValue(),
                phone2: $.phone2.getValue(),
                email1: $.email1.getValue(),
                email2: $.email2.getValue(),
                email3: $.email3.getValue(),
                web: getWebsiteValue(),
            };

            Alloy.Globals.Api.updateAffiliate(
                {
                    body,
                },
                (response) => {
                    Alloy.Globals.loading.hide();
                    if (!response.success) {
                        Alloy.Globals.showMessage(
                            `Hubo un problema al actualizar el afiliado. Contacte con ${Alloy.CFG.global.mail}`
                        );
                        return;
                    }

                    setAffiliateOnUser(response.data);

                    OS_IOS && Alloy.Globals.affiliatesTab.popToRootWindow();
                    OS_ANDROID && $.wAffiliateDetail.close();

                    Alloy.Globals.showMessage(response.message);
                }
            );
        });
        alertDialog.show();
    } else {
        $.wAffiliateDetail.close();
    }
}

function getWebsiteValue(params) {
    const PROTOCOL_SIZE = 8;
    return $.web.getValue().length > PROTOCOL_SIZE ? $.web.getValue() : '';
}

function setAffiliateOnUser(data) {
    let user = Ti.App.Properties.getObject('user');
    user.affiliate = data;
    Ti.App.Properties.setObject('user', user);
    Alloy.Globals.user = user;
}

function next(e) {
    if ($[e.source.next]) $[e.source.next].focus();
}

function previous(e) {
    if ($[e.source.previous]) $[e.source.previous].focus();
}

function doAction(params) {
    switch (params.source.id) {
        case 'vw_address':
            showOptionDialog({
                title: 'Ver en el mapa',
                options: elements['address'],
                source: OS_IOS
                    ? 'https://maps.apple.com/?z=8&t=m&q='
                    : 'https://www.google.com/maps/search/',
            });
            break;

        case 'vw_phones':
            showOptionDialog({
                title: 'Llamar al teléfono',
                options: elements['phones'],
                source: 'tel://',
            });
            break;

        case 'vw_emails':
            showOptionDialog({
                title: 'Enviar un correo',
                options: elements['emails'],
                source: 'email',
            });
            break;

        case 'vw_websites':
            showOptionDialog({
                title: 'Visitar página web',
                options: elements['websites'],
            });
            break;
    }
}

function showOptionDialog({title, options, source = ''}) {
    var tmpOptions = [...['Cancelar'], ...options];
    const resultOptionDialog = Ti.UI.createOptionDialog({
        title,
        options: tmpOptions,
        cancel: 0,
    });
    resultOptionDialog.addEventListener('click', function onClick(e) {
        if (e.index === 0) {
            return;
        }

        source === 'email'
            ? utils.openEmailForm({
                  email: tmpOptions[e.index],
              })
            : Ti.Platform.openURL(source + tmpOptions[e.index]);

        resultOptionDialog.removeEventListener('click', onClick);
    });
    resultOptionDialog.show();
}

function changeLogo() {
    $.pictureDialog.show();
}

function doPictureSelected({index}) {
    switch (index) {
        case 0:
            utils.requestCameraPermission(function () {
                Ti.Media.showCamera({
                    success: uploadImage,
                    cancel: function () {},
                    error: function () {
                        Alloy.Globals.showMessage(
                            'Hubo un problema al usar la cámara. Revise los permisos en su dispositivo.',
                            'No se tiene acceso a la cámara'
                        );
                    },
                    saveToPhotoGallery: false,
                    mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
                });
            });
            break;
        case 1:
            Ti.Media.openPhotoGallery({
                mediaTypes: [Titanium.Media.MEDIA_TYPE_PHOTO],
                success: uploadImage,
                error: function () {
                    Alloy.Globals.showMessage(
                        'Hubo un problema al abrir la galería. Revise los permisos en su dispositivo.',
                        'No se tiene acceso a la galería'
                    );
                },
            });
            break;

        default:
            break;
    }

    function uploadImage({media}) {
        const newWidth = 128;
        const newHeight = (media.height / media.width) * newWidth;
        const imageResized = media.imageAsResized(newWidth, newHeight);

        Alloy.Globals.loading.show('Guardando imagen...');
        let client = Ti.Network.createHTTPClient({
            onload: function (response) {
                Alloy.Globals.loading.hide();
                if (!response.success) {
                    Alloy.Globals.showMessage(
                        'Vaya, hubo un problema al obtener la imagen. Inténtelo de nuevo mas tarde.',
                        'Error en la subida'
                    );
                }

                $.logoEdit.image = $.logoShow.image = imageResized;
            },
            onerror: function () {
                Alloy.Globals.loading.hide();
                Alloy.Globals.showMessage(
                    'Vaya, hubo un problema al obtener la imagen. Inténtelo de nuevo mas tarde.',
                    'Error en la subida'
                );
            },
            timeout: 120000,
        });
        client.open('POST', Alloy.CFG.baseapi + 'affiliates/upload/logo/');
        client.setRequestHeader(
            'Authorization',
            'Bearer ' + Alloy.Globals.token
        );
        client.send({
            logo: imageResized,
        });
    }
}
