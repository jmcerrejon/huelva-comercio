function doOpenServices(e) {
    openInsideNavWindow({
        model: 'services',
        path: 'affiliates/services',
    });
}

function doOpenCovenants(e) {
    openInsideNavWindow({
        model: 'covenants',
        path: 'affiliates/covenants',
    });
}

function doOpenPDF(item) {
    console.log('pdf');
}

function openInsideNavWindow({model, path}) {
    Alloy.Globals.affiliatesWin.openWindow(
        Alloy.createController(path, {
            model,
        }).getView()
    );
}
