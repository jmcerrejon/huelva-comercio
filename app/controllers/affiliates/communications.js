let currentPage = 1;
let postsPerPage = 10;
let query = '';
const SCROLLABLEVIEW_HEIGHT = 175;
const collectionName = 'newsletters';

// console.log(JSON.stringify($.args, null, 2));

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
    console.log('Refresh with reset()');
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
    console.log('Inf Scroll with myLoader()');
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

function doOpenPDF(item) {
    console.log('pdf');
}

function openInsideNavWindow({model, path}) {
    Alloy.Globals.privateAreaWin.openWindow(
        Alloy.createController(path, {
            model,
        }).getView()
    );
}
