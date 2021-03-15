(function constructor(args) {
    if (!Alloy.Globals.guest) {
        $.vwGuest.width = $.vwGuest.height = 0;
        $.scrDinamizations.width = '100%';
        $.scrDinamizations.height = '100%';
        Alloy.Collections['dinamizations'].fetch({
            success: (res) => {},
        });
    }
})($.args);

function doOpenSign(params) {
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
