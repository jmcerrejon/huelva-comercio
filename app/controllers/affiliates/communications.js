let currentPage = 1;
let postsPerPage = 10;
let query = '';
const collectionName = 'newsletters';

(function constructor() {
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
})();

function reset() {
    console.log('Refresh with reset()');
    Alloy.Globals.loading.show('Cargando...');
    // renderNotFoundTemplate();
    currentPage = 1;
    Alloy.Collections[collectionName].fetch({
        page: currentPage,
        query: '',
        success: () => {
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
        error: function () {
            Alloy.Globals.showMessage(
                'No se pueden mostrar. Inténtelo mas tarde.'
            );
        },
    });
}

// Original functions

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

function doOpenLeaderShip(e) {
    openInsideNavWindow({
        model: 'leadership',
        path: 'affiliates/leadership',
    });
}

function doOpenPDF(item) {
    console.log('PDF', JSON.stringify(item.source.url, null, 2));
    openRemotePdf(item.source.url);
}

function openInsideNavWindow({model, path}) {
    if (OS_IOS) {
        Alloy.Globals.privateAreaTab.openWindow(
            Alloy.createController(path).getView()
        );
    } else {
        Alloy.createController(path).getView().open();
    }
}

function doTransform(model) {
    var transform = model.toJSON();

    transform.pdf_button_height = _.isNull(transform.file_name) ? 0 : 40;

    return transform;
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

Alloy.Globals.events.on('refreshCommunications', () => {
    if (_.isFunction($.listView.setContentOffset)) {
        $.listView.setContentOffset({
            x: 0,
            y: 0,
        });
    }
    reset();
});
