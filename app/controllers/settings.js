let settings = Ti.App.Properties.getObject('settings');
let user = Ti.App.Properties.getObject('user');
const fcm = require('firebase.cloudmessaging');
let showHiddenInfoCounter = 0;

(function constructor() {
    $.navbar.load({
        btnLeft: {
            title: '\uf00d',
            visible: true,
        },
        title: {
            visible: true,
            text: 'Ajustes',
        },
    });
    renderView();
    getGlobalVariableInfo();
})();

function close() {
    if (!_.isEqual(settings, Ti.App.Properties.getObject('settings'))) {
        saveSettings();
    }
    $.settings.close();
}

function saveSettings() {
    Ti.App.Properties.setObject('settings', settings);

    Alloy.Globals.Api.updateNotificationSettings(
        {
            device_token: Alloy.Globals.deviceToken,
            body: {
                enabled_notif_news: settings['news'] ? 1 : 0,
                enabled_notif_events: settings['events'] ? 1 : 0,
                enabled_notif_demands: settings['demands'] ? 1 : 0,
            },
        },
        (response) => {
            settings['news']
                ? fcm.subscribeToTopic('news')
                : fcm.unsubscribeFromTopic('news');
            settings['events']
                ? fcm.subscribeToTopic('events')
                : fcm.unsubscribeFromTopic('events');
            if (!Alloy.Globals.guest) {
                const sectorId = user.association.sector_id;
                settings['demands']
                    ? fcm.subscribeToTopic(`sector_${sectorId}`)
                    : fcm.unsubscribeFromTopic(`sector_${sectorId}`);
            }
        }
    );
}

function renderView() {
    let content = [
        {
            name: {
                text: _.isNull(user) ? 'Iniciar sesión' : 'Cerrar sesión',
            },
            icon: {
                text: '\uf011',
            },
        },
    ];
    // if (!_.isNull(user)) {
    //     content.push({
    //         name: {
    //             text: 'Cambio de contraseña',
    //         },
    //         icon: {
    //             text: '\uf084',
    //         },
    //     });
    // }
    $.section.setItems(content);
    const version = Ti.App.getVersion();
    const year = '\n©' + new Date().getFullYear();
    $.lblVersion.text = `Versión ${version} ${year} Soporttec, S.L. `;
    initSwitchNotifications();
}

function initSwitchNotifications() {
    const section = $.elementsList.sections[0],
        itemNew = section.getItemAt(0),
        itemEvents = section.getItemAt(1);

    itemDemands = section.getItemAt(2);

    itemNew.swAmIAvailable.value = settings.news;
    // itemEvents.swAmIAvailable.value = settings.events;
    // itemDemands.swAmIAvailable.value = settings.demands;

    section.updateItemAt(0, itemNew);
    // section.updateItemAt(1, itemEvents);
    // section.updateItemAt(2, itemDemands);
}

function doSelectOption(item) {
    if (item.sectionIndex === 1) {
        switch (item.itemIndex) {
            case 0:
                closeSession();
                break;
            case 1:
                doResetPassword();
                break;
            case 2:
                setAffiliateVisible();
                break;
        }
    }
}

function doResetPassword() {
    Alloy.Globals.loading.show('Verificando usuario');
    setTimeout(() => {
        Alloy.Globals.loading.hide();
        makeChangeresetRequest();
    }, 3000);
}

function setAffiliateVisible() {
    Alloy.Globals.Api.updateAffiliate(
        {
            id: user.id,
            body: {
                visible: true,
            },
        },
        (response) => {
            if (!response.success) {
                alert(
                    `Hubo un problema al actualizar el afiliado. Contacte con ${Alloy.CFG.global.mail}`,
                    'Error'
                );
                return;
            }

            setAffiliateOnUser(response.data);

            alert(response.message, 'Visibilidad cambiada');
        }
    );
}

function setAffiliateOnUser(data) {
    user.affiliate = data;
    Ti.App.Properties.setObject('user', user);
    Alloy.Globals.user = user;
}

function makeChangeresetRequest() {
    var dialog = Ti.UI.createAlertDialog(setAlertDialogProperties());
    dialog.addEventListener('click', function (e) {
        const password = OS_IOS ? e.text : e.source.androidView.value;
        if (e.index === e.source.cancel || password === '') {
            return;
        }

        const email = Alloy.Globals.user.email;
        Alloy.Globals.Api.resetPassword(
            {
                email,
                password,
            },
            (response) => {
                Alloy.Globals.showMessage(
                    response.message,
                    'Cambio de contraseña'
                );
            }
        );
    });
    dialog.show();
}

function setAlertDialogProperties() {
    let dialogProperties = {
        title: 'Cambio de contraseña',
        message: 'Introduzca nueva contraseña',
        buttonNames: ['Cancelar', 'Cambiar'],
        cancel: 0,
    };

    if (OS_IOS) {
        dialogProperties.style = Ti.UI.iOS.AlertDialogStyle.SECURE_TEXT_INPUT;
    } else {
        dialogProperties.androidView = Ti.UI.createTextField({
            passwordMask: true,
            hintText: 'Introduzca texto aquí',
            returnKeyType: Ti.UI.RETURNKEY_RETURN,
            maxLength: 70,
        });
    }

    return dialogProperties;
}

function doChangeSwitch(e) {
    settings[
        $.elementsList.sections[0].getItemAt(e.itemIndex).lblAmIAvailable.textId
    ] = e.source.value;
}

function closeSession() {
    Alloy.Globals.events.trigger('closeSession');
    $.settings.close();
}

function showHiddenInfo() {
    showHiddenInfoCounter++;

    if (showHiddenInfoCounter > 5) {
        $.elementsList.canScroll = true;
        $.lblVersion.text = getGlobalVariableInfo();
    }
}

function getGlobalVariableInfo() {
    const info = `settings: ${JSON.stringify(settings, null, 2)},
user: ${JSON.stringify(user, null, 2)},
guest: ${JSON.stringify(Alloy.Globals.guest, null, 2)},
candidate: ${JSON.stringify(Alloy.Globals.candidate, null, 2)},
token: ${JSON.stringify(Alloy.Globals.token, null, 2)},
deviceToken: ${JSON.stringify(Alloy.Globals.deviceToken, null, 2)},`;

    if (ENV_DEV) {
        console.log(info);
    }

    return info;
}
