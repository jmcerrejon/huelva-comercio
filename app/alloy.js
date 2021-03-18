require('ti.detect');
global.AvImageview = require('av.imageview');
Alloy.Globals.CONTENT_MODE_FIT = AvImageview.CONTENT_MODE_ASPECT_FIT;
Alloy.Globals.CONTENT_MODE_FILL = AvImageview.CONTENT_MODE_ASPECT_FILL;

Alloy.Globals.events = _.clone(Backbone.Events);
Alloy.Globals.moment = require('moment');
Alloy.Globals.moment.locale('es');
Alloy.Globals.loading = Alloy.createWidget('nl.fokkezb.loading');
// Properties
Alloy.Globals.token = Ti.App.Properties.getString('token', '');
Alloy.Globals.deviceToken = Ti.App.Properties.getString('deviceToken', '');
Alloy.Globals.user = Ti.App.Properties.getObject('user', null);
Alloy.Globals.guest = Ti.App.Properties.getBool('guest', true);
Alloy.Globals.isAffiliate = Ti.App.Properties.getBool('isAffiliate', false);
Alloy.Globals.isLeadership = Ti.App.Properties.getBool('isLeadership', false);
Alloy.Globals.background = Ti.App.Properties.getBool('background', false);
Alloy.Globals.candidate = Ti.App.Properties.getObject('candidate', null);
Alloy.Globals.tabGroup = null;
Alloy.Globals.privateAreaWin = null;
Alloy.Globals.affiliatesWin = null;
Alloy.Globals.androidDataPush = null;
Alloy.Globals.showMessage = (message, title = 'Atención') => {
    if (!_.isUndefined(Alloy.Globals.loading)) {
        Alloy.Globals.loading.hide();
    }
    require('core').alertSimple(title, message);
};

// Settings
if (!Ti.App.Properties.hasProperty('settings')) {
    Ti.App.Properties.setObject('settings', {
        news: true,
        events: false,
        demands: true,
    });
}
Alloy.Globals.Device = {
    isiPhoneX: Alloy.CFG.TiDetect.hasNotch,
    version: Ti.Platform.version,
    versionMajor: parseInt(Ti.Platform.version.split('.')[0], 10),
    versionMinor: parseInt(Ti.Platform.version.split('.')[1], 10),
    width:
        Ti.Platform.displayCaps.platformWidth >
        Ti.Platform.displayCaps.platformHeight
            ? Ti.Platform.displayCaps.platformHeight
            : Ti.Platform.displayCaps.platformWidth,
    height:
        Ti.Platform.displayCaps.platformWidth >
        Ti.Platform.displayCaps.platformHeight
            ? Ti.Platform.displayCaps.platformWidth
            : Ti.Platform.displayCaps.platformHeight,
    dpi: Ti.Platform.displayCaps.dpi,
    orientation:
        Ti.Gesture.orientation == Ti.UI.LANDSCAPE_LEFT ||
        Ti.Gesture.orientation == Ti.UI.LANDSCAPE_RIGHT
            ? 'landscape'
            : 'portrait',
};

if (OS_ANDROID) {
    Alloy.Globals.Device.width =
        Alloy.Globals.Device.width / (Alloy.Globals.Device.dpi / 160);
    Alloy.Globals.Device.height =
        Alloy.Globals.Device.height / (Alloy.Globals.Device.dpi / 160);
}

require('install')();
require('core').listenNetwork();

import Reste from 'reste';
Alloy.Globals.Api = new Reste();
Alloy.Globals.Api.config(require('net/apiconfig').config);

if (OS_IOS) {
    Ti.App.addEventListener('resumed', () => {
        setTimeout(() => {
            Ti.UI.iOS.appBadge = 0;
        }, 500);
    });
}

// Push notifications
require('notifications')();

Alloy.Globals.top = OS_IOS ? (Alloy.Globals.Device.isiPhoneX ? 20 : 0) : 0;
Alloy.Globals.footerHeight = OS_IOS
    ? Alloy.Globals.Device.isiPhoneX
        ? 74
        : 54
    : 54;
