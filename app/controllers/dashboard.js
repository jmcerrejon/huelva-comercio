import NotificationBanner from 'ti.notificationbanner';
let currentController = null;
var fcm = require('firebase.cloudmessaging');
let timeSinceBackgroundApp;
const time2RefreshNewsAndEventsInMinutes = 30;
const tabStacks = [
    {
        tabId: 'main',
        winId: 'mainCtrl',
        winName: 'Principal',
        hasSettingsEnabled: true,
    },
    {
        tabId: 'affiliates',
        winId: 'affiliatesCtrl',
        winName: 'Afilia2',
        hasSettingsEnabled: false,
    },
    {
        tabId: 'dinamizations',
        winId: 'dinamizationsCtrl',
        winName: 'Dinamización',
        hasSettingsEnabled: false,
    },
    {
        tabId: 'contact',
        winId: 'contactCtrl',
        winName: 'Contacto',
        hasSettingsEnabled: false,
    },
];

if (Alloy.Globals.isAffiliate) {
    tabStacks.splice(1, 0, {
        tabId: 'communications',
        winId: 'communicationsCtrl',
        winName: 'Comunicaciones',
        hasSettingsEnabled: false,
    });
}

let oldTab = 'main';

(function constructor() {
    OS_ANDROID
        ? $.tabGroup.addEventListener('androidback', function () {})
        : $.tabGroup.hideNavBar();

    Alloy.Globals.events.off('popToRootWindow');
    Alloy.Globals.events.off('openWindowInTab');
    Alloy.Globals.tabGroup = $.tabGroup;
    Alloy.Globals.homeTab = $.main;
    Alloy.Globals.privateAreaTab = $.communications;
    Alloy.Globals.affiliatesTab = $.affiliates;
    Alloy.Globals.dinamizationsWin = $.dinamizations;
    if (OS_IOS) {
        if ($.communicationsCtrl) $.communicationsCtrl.hideNavBar();
        if ($.affiliatesCtrl) $.affiliatesCtrl.hideNavBar();
    }
})();

// $.tabGroup.setActiveTab($.affiliates); // Just for test purpose

function closeToRoot() {
    if (OS_IOS) {
        $.tabGroup.activeTab.popToRootWindow();
    }
}

Alloy.Globals.events.on('popToRootWindow', closeToRoot);

function focusWindow(e) {
    switch (e.source.id) {
        case 'dinamizationsCtrl':
            Alloy.Globals.events.trigger('dinamizations');
            break;

        case 'affiliatesCtrl':
            Alloy.Globals.events.trigger('affiliates');
            break;
    }
}

function openWindow(o) {
    const tab = $.tabGroup.activeTab;

    _.defaults(o, {
        data: {},
        controller: null,
        dispatcher: null,
    });

    let win = Alloy.createController(o.controller, o.data);
    let currentWin = win.getView();

    function close() {
        if (currentWin) {
            tab.close(currentWin);
            currentWin = null;
        }
        if (win) {
            win.off('close');
        }
        win = null;
    }
    win.on('close', close);
    win.on('select', function (e) {
        if (o.dispatcher) {
            Alloy.Globals.events.trigger(o.dispatcher, e);
        }

        close();
    });

    if (currentController !== o.controller) {
        tab.open(currentWin);
    }
    if (o.controller === 'win') {
        currentController = o.data.controller;
    } else {
        currentController = o.controller;
    }
}

Alloy.Globals.events.on('openWindowInTab', openWindow);

function focus(e) {
    if (e.tab && tabStacks[e.index].tabId.indexOf(e.tab.id) > -1) {
        changeNavBar(e.index);
    }
}

function changeNavBar(index) {
    if (index < 0 || index >= tabStacks.length) {
        return;
    }

    if (!_.isNull($[tabStacks[index].winId].getViewById('title'))) {
        // $[tabStacks[index].winId].getViewById('title').text = tabStacks[index].winName;
        // $[tabStacks[index].winId].getViewById('btnRight').visible =
        //     tabStacks[index].hasSettingsEnabled;
    }
}

// Handle pause or resume

Ti.App.addEventListener('pause', enableBackground);

// HACK This is the only way I found to deal with resume successfully
if (OS_ANDROID) {
    Ti.App.addEventListener('resume', resume);
    // FIX https://gist.github.com/kristjanmik/aefc77b5b05e792ecdd2
    $.tabGroup.addEventListener('open', () => {
        _.isNull(Alloy.Globals.androidDataPush) ||
            notification(Alloy.Globals.androidDataPush);
    });
} else {
    $.tabGroup.addEventListener('open', function () {
        Ti.App.addEventListener('resumed', resume);
    });
}

function enableBackground() {
    console.log('Pause listener...');
    Ti.App.Properties.setBool('background', true);
    Alloy.Globals.background = true;

    timeSinceBackgroundApp = Alloy.Globals.moment();
}

function resume() {
    Ti.API.info(
        `App is resuming from the background at ${new Date()}: Ti.Network.online: ${
            Ti.Network.online
        }`
    );

    if (!Ti.Network.online) {
        return;
    }

    if (isDiffTimePassed()) {
        fetchAllCollections();
    }

    if (checkValidUser()) {
        Alloy.Globals.Api.me(function (response) {
            if (response.success) {
                return;
            }

            closeSession();
            // setTimeout(() => {
            //     Alloy.Globals.showMessage(
            //         'Por motivos de seguridad, se ha cerrado la sesión.'
            //     );
            // }, 1000);
        });
    }

    if (OS_IOS) {
        Ti.UI.iOS.appBadge = 0;
    }

    if (OS_ANDROID) {
        const data = {
            tag: fcm.lastData.tag || null,
            url: fcm.lastData.url || null,
            data: fcm.lastData.data || null,
        };
        if (!_.isNull(data.tag)) {
            notification(data);
        }
        Alloy.Globals.androidDataPush = null;
    }
    console.log('Alloy.Globals.background ...' + Alloy.Globals.background);
}

function checkValidUser() {
    const isValidUser =
        Ti.Network.online &&
        Alloy.Globals.token !== null &&
        !Alloy.Globals.guest;
    console.log(`isValidUser = ${isValidUser}`);

    return isValidUser;
}

function isDiffTimePassed() {
    return (
        Alloy.Globals.moment().diff(timeSinceBackgroundApp, 'minutes') >=
        time2RefreshNewsAndEventsInMinutes
    );
}

Alloy.Globals.events.on('handle_notification', notification);

function fetchAllCollections() {
    Alloy.Globals.events.trigger('refreshOffers');
    // TODO Refresh dinamizations when will be available

    if (Alloy.Globals.isAffiliate) {
        Alloy.Globals.events.trigger('refreshCommunications');
    }
}

function notification(data) {
    console.log('Alloy.Globals.background=' + Alloy.Globals.background);
    if (!data && _.isNull(data.tag)) {
        return;
    }

    switch (data.tag) {
        case 'offer_notifications':
            if (!Alloy.Globals.background) {
                showNotificationBanner('Ofertas y promociones', data.body);
                return;
            }
            closeToRoot();
            $.tabGroup.setActiveTab($.main);
            fetchAllCollections();
            Alloy.createController('webviewWin', {
                url: data.url || 'https://foe.es',
                title: 'Ofertas y promos',
            })
                .getView()
                .open();
            break;
        case 'dinamization_notifications':
            if (!Alloy.Globals.background) {
                showNotificationBanner('Dinamización', data.body);
                return;
            }
            closeToRoot();
            $.tabGroup.setActiveTab($.dinamizations);
            fetchAllCollections();
            break;
        case 'communication_notifications':
            if (!Alloy.Globals.background) {
                showNotificationBanner('Circulares', data.body, '#FC5D4E');
                return;
            }
            closeToRoot();
            $.tabGroup.setActiveTab($.communications);
            fetchAllCollections();
            break;
        case 'leadership_notifications':
            if (!Alloy.Globals.background) {
                showNotificationBanner(
                    'Circulares Junta Directiva',
                    data.body,
                    '#FC5D4E'
                );
                return;
            }
            closeToRoot();
            $.tabGroup.setActiveTab($.communications);
            fetchAllCollections();
            openLeadershipWin();
            break;
    }
    Ti.App.Properties.setBool('background', false);
    Alloy.Globals.background = false;
}

function showNotificationBanner(title, subtitle, backgroundColor = '#0060a5') {
    NotificationBanner.show({
        title,
        subtitle,
        duration: 5,
        backgroundColor,
    });
}

function openLeadershipWin() {
    if (OS_IOS) {
        Alloy.Globals.privateAreaTab.openWindow(
            Alloy.createController('affiliates/leadership').getView()
        );
    } else {
        Alloy.createController('affiliates/leadership').getView().open();
    }
}

function closeSession() {
    Ti.App.removeEventListener('pause', enableBackground);
    Ti.App.removeEventListener('resumed', resume);

    removeProperties();
    disableNotifications();
    require('/dao/database').reset('variable');

    Alloy.createController('dashboard', {
        closeApp: true,
    })
        .getView()
        .open();
    $.tabGroup.close();
    Alloy.Globals.Api.logout({}, (res) => {
        if (res.success) {
            console.log('Logout successfully.');
        }
    });
}
Alloy.Globals.events.on('closeSession', closeSession);

function removeProperties() {
    Ti.App.Properties.removeProperty('');
    Ti.App.Properties.setBool('guest', true);
    Ti.App.Properties.setBool('isAffiliate', false);
    Ti.App.Properties.setBool('isLeadership', false);
    Ti.App.Properties.setObject('user', null);
    Alloy.Globals.guest = true;
    Alloy.Globals.isAffiliate = false;
    Alloy.Globals.isLeadership = false;
    Alloy.Globals.token = Alloy.Globals.deviceToken = Alloy.Globals.user = null;
    Ti.App.Properties.setBool('isConnected', false);
    Alloy.Globals.events.off();
    console.log(
        'guest = ' + Alloy.Globals.guest,
        'isAffiliate = ' + Alloy.Globals.isAffiliate,
        'isLeadership = ' + Alloy.Globals.isLeadership,
        'token = ' + Alloy.Globals.token,
        'deviceToken = ' + Alloy.Globals.deviceToken,
        'user = ' + Alloy.Globals.user
    );
}

function disableNotifications() {
    fcm.unsubscribeFromTopic('offer_notifications');
    fcm.unsubscribeFromTopic('communication_notifications');
    fcm.unsubscribeFromTopic('leadership_notifications');
}
