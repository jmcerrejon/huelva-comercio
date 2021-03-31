let currentPage = 1;
let postsPerPage = 10;
let query = '';
const SCROLLABLEVIEW_HEIGHT = 175;
const collectionName = 'leadership';
let pdfFile = null;

(function constructor(args) {
    Alloy.Collections[collectionName].fetch({
        page: currentPage++,
        query,
        success: (res) => {
            Alloy.Globals.loading.hide();
            postsPerPage = res.length;
            if (!$.is) return;
            $.is.init($.listView);
            $.is.setOptions({
                msgTap: '',
                msgDone: '',
                msgError: 'Toca para intentar de nuevo...',
            });
        },
    });
})($.args);

function reset() {
    Alloy.Globals.loading.show('Cargando...');
    // renderNotFoundTemplate();
    currentPage = 1;
    Alloy.Collections[collectionName].fetch({
        page: currentPage,
        query: '',
        success: (resource) => {
            Alloy.Globals.loading.hide();
            $.refreshListView.endRefreshing();
            currentPage++;
            if (!$.is) return;
            $.is.show();
            $.is.mark();
        },
    });
}

function myLoader(element) {
    Alloy.Collections[collectionName].fetch({
        page: currentPage,
        query: '',
        add: true,
        success: function (collection) {
            currentPage++;
            if (_.isUndefined(element)) {
                return;
            }
            collection.length % postsPerPage == 0
                ? element.success()
                : element.done();
        },
        error: function (col) {
            Alloy.Globals.showMessage(
                'No se pueden mostrar. Inténtelo mas tarde.'
            );
        },
    });
}

function doOpenLeaderShip(e) {
    openInsideNavWindow({
        model: 'leadership',
        path: 'affiliates/leadership',
    });
}

function doOpenPDF(item) {
    openRemotePdf(item.source.url);
}

function openInsideNavWindow({model, path}) {
    Alloy.Globals.privateAreaTab.openWindow(
        Alloy.createController(path, {
            model,
        }).getView()
    );
}

function openRemotePdf(url) {
    Alloy.Globals.loading.show();
    var client = Ti.Network.createHTTPClient({
        onload: function () {
            var f = Ti.Filesystem.getFile(
                Ti.Filesystem.applicationDataDirectory,
                'file.pdf'
            );
            f.write(this.responseData);
            if (OS_IOS) {
                var docViewer = Ti.UI.iOS.createDocumentViewer({
                    url: f.nativePath,
                });
                docViewer.show();
            } else {
                var win = $.UI.create('Window');
                var pdfView = require('fr.squirrel.pdfview').createView({
                    height: Ti.UI.FILL,
                    width: Ti.UI.FILL,
                    file: f,
                });
                win.add(pdfView);
                win.open();
            }

            Alloy.Globals.loading.hide();
        },
        onerror: function () {
            Alloy.Globals.loading.hide();
            Alloy.Globals.showMessage('Fichero no encontrado.');
        },
    });
    client.open('GET', url);
    client.send();
}

function close() {
    $.leadership.close();
}

Alloy.Globals.events.on('refreshCommunications', () => {
    reset();
});
