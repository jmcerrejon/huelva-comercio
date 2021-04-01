(function constructor() {
    if (!Alloy.Globals.guest) {
        Alloy.Collections['dinamizations'].fetch();
    }
})();

function doOpenSign() {
    Alloy.createController('login/login')
        .getView()
        .open(
            OS_IOS
                ? {
                      modal: true,
                      modalTransitionStyle:
                          Ti.UI.iOS.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
                  }
                : {}
        );
}

function doOpenURL(params) {
    Ti.Platform.openURL(params.source.itemLink);
}
