(function constructor(args) {
    Alloy.Collections['services'].fetch({
        success: (res) => {},
    });
})($.args);

function doOpenURL(params) {
    Ti.Platform.openURL(params.source.itemLink);
}

function close() {
    $.services.close();
}
