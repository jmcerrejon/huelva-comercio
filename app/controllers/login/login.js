const fcm = require('firebase.cloudmessaging');
let settings = Ti.App.Properties.getObject('settings');

/**
 * @method Controller
 * Display login view
 * @param  {Arguments} args Arguments passed to the controller
 */
(function constructor(args) {
    if (args.closeApp && OS_ANDROID) {
        $.win.addEventListener('androidback', () => {
            var activity = Titanium.Android.currentActivity;
            activity.finish();
        });
    }
})($.args);

function activePasswordMask(e) {
    var isMasked = $.password.lblRight.text === '\uf06e';
    $.password.textfield.setPasswordMask(isMasked);
    $.password.lblRight = {
        text: !isMasked ? '\uf06e' : '\uf070',
        color: 'gray'
    };
}

/**
 * doSignup - open Signup or Lost password
 *
 * @param  {Object} e clicked object
 */
function doOpenSignup(e) {
    $.nav.openWindow(Alloy.createController('signup/signup', e).getView());
}

/**
 * connect - connection function
 *
 * @param  {object} e
 */
function doSignin(e) {
    var email = $.login.getValue();
    var password = $.password.getValue();

    if (!require('core').valideEmail(email)) {
        Alloy.Globals.showMessage('Por favor, introduce un Email válido');

        return false;
    }

    if (password && email) {
        Alloy.Globals.loading.show('Comprobando...');
        //WS LOGIN
        var obj = {
            email,
            password
        };

        Alloy.Globals.Api.signin({
            body: obj
        }, (response) => {
            if (!response.success) {
                Alloy.Globals.showMessage(response.content.message, 'Sin acceso');
                return;
            }

            saveUserAndConnect(response.data);
            (!response.data.association.sector_id) || handlePushNotifBySectorId(response.data.association.sector_id);
            Alloy.createController('index').getView();
        });
    }
}

function handlePushNotifBySectorId(sectorId) {
    (settings['demands']) ? fcm.subscribeToTopic(`sector_${sectorId}`): fcm.unsubscribeFromTopic(`sector_${sectorId}`);
}

function doGoToDashboard() {
    Alloy.Globals.loading.show('Cargando contenido...');
    saveUserAndConnect();
    Alloy.createController('dashboard').getView().open();
}

function next(e) {
    if ($[e.source.next]) $[e.source.next].focus();
}

function previous(e) {
    if ($[e.source.previous]) $[e.source.previous].focus();
}

function saveUserAndConnect(user = null) {
    if (user) {
        Ti.App.Properties.setBool('guest', false);
        Alloy.Globals.guest = false;
        Ti.App.Properties.setObject('user', user);
        Alloy.Globals.user = user;
        Ti.App.Properties.setString('token', user.token);
        Alloy.Globals.token = user.token;
        
        // We need this for refresh token in the file
        Alloy.Globals.Api.setRequestHeaders({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + Alloy.Globals.token
        });
    } else {
        Ti.App.Properties.setBool('guest', true);
        Alloy.Globals.guest = true;
        Ti.App.Properties.setObject('user', null);
        Ti.App.Properties.setString('token', null);
        Alloy.Globals.user = Alloy.Globals.token = null;
    }
    Ti.App.Properties.setBool('isConnected', true);
}