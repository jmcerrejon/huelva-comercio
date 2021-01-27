(function constructor(args) {
    if (Ti.App.Properties.getBool("isConnected")) {
        Alloy.createController("dashboard")
            .getView()
            .open();
    } else {
        Alloy.createController("login/login", args)
            .getView()
            .open();
    }
})($.args);