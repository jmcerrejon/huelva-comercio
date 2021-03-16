(function constructor(args) {
    Alloy.Collections[args.model || 'covenants'].fetch({
        success: (res) => {},
    });
})($.args);

function doOpenURL(params) {
    Ti.Platform.openURL(params.source.itemLink);
}

function close() {
    $.covenants.close();
}
