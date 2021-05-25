(function constructor(args) {
    Alloy.Collections[args.model || 'covenants'].fetch({
        success: (res) => {},
    });
})($.args);

function doOpenURL(params) {
    openURL(params.source.itemLink + Alloy.CFG.extra_url_parameters);
}

function openURL(url, title = 'Huelva Comercio (web)', share = true) {
    Alloy.createController('webviewWin', {
        title,
        url,
        share,
    })
        .getView()
        .open();
}

function close() {
    $.covenants.close();
    $.destroy();
}
