let currentPage = 1;
let POSTS_PER_PAGE = 15;
const extraURLParameters = '?app=true';

(function constructor() {
    if (!Alloy.Globals.guest) {
        Alloy.Collections['dinamizations'].fetch({
            page: currentPage++,
            success: (res) => {
                POSTS_PER_PAGE = res.length;
                if (POSTS_PER_PAGE === 0) {
                    renderNotFoundTemplate(res.length);
                    return;
                }
                $.is.init($.listView);
                $.is.setOptions({
                    msgTap: '',
                    msgDone: '',
                    msgError: 'Toca para intentar de nuevo...',
                });
            },
        });
    }
})();

function myLoader(element) {
    Alloy.Collections['dinamizations'].fetch({
        page: currentPage,
        add: true,
        success: function (collection) {
            currentPage++;
            if (_.isUndefined(element)) {
                return;
            }
            collection.length % POSTS_PER_PAGE == 0
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

function reset() {
    if (!Ti.Network.online) {
        $.refreshListView.endRefreshing();
        Alloy.Globals.showMessage(
            'Intente primero obtener conexión a internet.'
        );
        return;
    }
    Alloy.Globals.loading.show('Cargando ofertas...');
    renderNotFoundTemplate();
    currentPage = 1;
    Alloy.Collections['dinamizations'].fetch({
        page: currentPage,
        success: () => {
            Alloy.Globals.loading.hide();
            $.refreshListView.endRefreshing();

            $.is.show();
            $.is.mark();
            currentPage++;
        },
    });
}

function renderNotFoundTemplate(sizeData = 0) {
    if (sizeData !== 0) {
        return;
    }
    let item = $.listView.sections[0].items[0];
    item.vwNoNewsFound.height = '100%';
    $.listView.sections[0].updateItemAt(0, item);
}

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

function doOpenPost(e) {
    const item = e.section.getItemAt(e.itemIndex);

    if (
        !_.isUndefined(item.vwDinamizations.url) &&
        !_.isNull(item.vwDinamizations.url)
    ) {
        !item.vwDinamizations ||
            openURL(item.vwDinamizations.url + extraURLParameters);
    }
}

function openURL(url, title = 'Huelva Comercio (web)', share) {
    Alloy.createController('webviewWin', {
        title,
        url,
        share,
    })
        .getView()
        .open();
}
