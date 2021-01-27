exports.createNavigationWindow = function(args){
    if (OS_IOS) {
        return Ti.UI.iOS.createNavigationWindow(args);
    }

    args.window.openWindow = function(win) {
        win.open();
    };

    return args.window;
}