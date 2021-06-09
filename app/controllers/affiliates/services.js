(function constructor(args) {
    Alloy.Collections['services'].fetch({
        success: (res) => {},
    });
})($.args);

function doOpenURL(params) {
    openURL(params.source.itemLink + Alloy.CFG.extra_url_parameters);
}

function openURL(url, title = 'Huelva Comercio', share = true) {
    Alloy.createController('webviewWin', {
        title,
        url,
        share,
    })
        .getView()
        .open();
}

function close() {
    $.services.close();
    $.destroy();
}
