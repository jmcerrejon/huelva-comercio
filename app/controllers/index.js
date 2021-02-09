(function constructor(args) {
    Alloy.createController('dashboard').getView().open();
    // Ti.App.Properties.setBool('isConnected', false);
    // if (Ti.App.Properties.getBool('isConnected')) {
    //     Alloy.createController('dashboard').getView().open();
    // } else {
    //     Alloy.createController('login/login', args).getView().open();
    // }
})($.args);
