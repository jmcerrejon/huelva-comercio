let currentPage = 1;
let POSTS_PER_PAGE = 10;
let isMainTitleChange = false;
let scrollableLoop = true;
const OFFSET_CHANGE_HEADER_TITLE = 301;
const SCROLLABLEVIEW_HEIGHT = 175;
const TIME_PER_VIEW_MILISECONDS = 8000;
const cantShare = false;

(function constructor() {
    Alloy.Collections.banners.fetch({
        success: (res) => {
            if (!_.isUndefined($.scrollableView)) {
                $.scrollableView.height =
                    res.length === 0 ? 0 : SCROLLABLEVIEW_HEIGHT;
            }
        },
    });
    Alloy.Collections.news.fetch({
        page: currentPage++,
        guest: Alloy.Globals.guest,
        success: (res) => {
            Alloy.Globals.loading.hide(); // It comes from login.js
            renderNotFoundTemplate(res.length);
            POSTS_PER_PAGE = res.length;
            $.is.init($.listView);
            $.is.setOptions({
                msgTap: '',
                msgDone: '',
                msgError: 'Toca para intentar de nuevo...',
            });
        },
    });

    const interval = setInterval(function () {
        if (
            !_.isUndefined($.scrollableView) &&
            $.scrollableView.views.length === 1
        ) {
            scrollableLoop = false;
            clearInterval(interval);
            interval = null;
            return;
        }
        if (!_.isUndefined($.scrollableView) && scrollableLoop) {
            if (
                $.scrollableView.views.length - 1 ==
                $.scrollableView.currentPage
            ) {
                $.scrollableView.scrollToView(0);
            } else {
                $.scrollableView.moveNext();
            }
        } else {
            scrollableLoop = !scrollableLoop;
        }
    }, TIME_PER_VIEW_MILISECONDS);
})();

Alloy.Globals.events.on('refreshNews', () => {
    if (_.isFunction($.listView.setContentOffset)) {
        $.listView.setContentOffset({
            x: 0,
            y: 0,
        });
    }
    reset();
});

function myLoader(element) {
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: '',
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
        error: function (col) {
            Alloy.Globals.showMessage(
                'No se pueden mostrar. Inténtelo mas tarde.'
            );
        },
    });
}

function searchNews() {
    var dialog = Ti.UI.createAlertDialog(setAlertDialogProperties());
    dialog.addEventListener('click', function (e) {
        const text = OS_IOS ? e.text : e.source.androidView.value;
        if (e.index === e.source.cancel || text === '') {
            return;
        }

        currentPage = 1;

        Alloy.Collections.news.fetch({
            page: currentPage,
            query: text,
            success: (data) => {
                renderNotFoundTemplate(data.length);
            },
        });
    });
    dialog.show();
}

function reset() {
    Alloy.Globals.loading.show('Cargando...');
    renderNotFoundTemplate();
    currentPage = 1;
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: '',
        success: (resource) => {
            Alloy.Globals.loading.hide();
            $.refreshListView.endRefreshing();

            $.is.show();
            $.is.mark();
            currentPage++;
        },
    });
}

function setAlertDialogProperties() {
    let dialogProperties = {
        title: 'Filtrar Noticias',
        message: 'Escriba para buscar una noticia',
        buttonNames: ['Cancelar', 'Buscar'],
        cancel: 0,
    };

    if (OS_IOS) {
        dialogProperties.style = Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT;
    } else {
        dialogProperties.androidView = Ti.UI.createTextField({
            returnKeyType: Ti.UI.RETURNKEY_RETURN,
            maxLength: 50,
        });
    }

    return dialogProperties;
}

function doOpenSettings() {
    if (OS_IOS) {
        Alloy.Globals.tabGroup.tabs[0].openWindow(
            Alloy.createController('settings').getView()
        );
    } else {
        Alloy.createController('settings').getView().open();
    }
}

function doOpenLink(banner) {
    !banner.source || Ti.Platform.openURL(banner.source.url);
}

function doOpenPost(e) {
    const item = e.section.getItemAt(e.itemIndex);
    !item.viewPost || openURL(item.viewPost.url);
}

function goToMeetUsWebLink() {
    openURL('/html/about_us.html', 'Conócenos', cantShare);
}

function goToCovenantLink() {
    openURL('https://foe.es/convenios/', 'Convenios (web)');
}

function goToServicesWebLink() {
    openURL('/html/services.html', 'Servicios', cantShare);
}

function openURL(url, title = 'CECA (web)', share) {
    Alloy.createController('webviewWin', {
        title,
        url,
        share,
    })
        .getView()
        .open();
}

function transformCollection(model) {
    let modelJSON = model.toJSON();
    const isExclusive = modelJSON['exclusive'];

    // if (Alloy.Globals.guest === true && isExclusive) {
    //     modelJSON = {};
    // }
    // modelJSON['exclusive'] = isExclusive ? 'red' : 'gray';
    modelJSON['image'] =
        _.isUndefined(modelJSON['image']) || modelJSON['image'] == ''
            ? 'images/logo_256.png'
            : modelJSON['image'];

    return modelJSON;
}

function touchStart(e) {
    scrollableLoop = false;
}

function renderNotFoundTemplate(sizeData) {
    let item = $.listView.sections[0].items[0];
    // item.properties = {
    //     height: sizeData === 0 ? '250' : 0,
    // };
    // $.listView.sections[0].updateItemAt(0, item);
    // Remove Infinity Scroll when show not items availables on search (Remember do $.is.show() later)
    $.is.hide();
}

function doFilter(e) {
    if (Alloy.Globals.guest) {
        Alloy.Globals.showMessage(
            'Puedes filtrar por contenido exclusivo si eres usuario registrado',
            'Información'
        );
        return;
    }

    currentPage = 1;
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: '',
        guest: Alloy.Globals.guest,
        exclusive: true,
        success: (data) => {
            if (data.length === 0) {
                alert('No se encontraron resultados.');
                reset();
            }
        },
    });
}

function doSearch(e) {
    currentPage = 1;
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: e.value,
        guest: Alloy.Globals.guest,
        success: (data) => {
            if (data.length === 0) {
                alert('No se encontraron resultados.');
                reset();
            }
        },
    });
}

function doLogin() {
    if (!Alloy.Globals.guest) {
        doOpenSettings();
        return;
    }

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

function openView({model, index, path}) {
    const data = Alloy.Collections[model].get(index).toJSON();
    if (OS_IOS) {
        Alloy.Globals.affiliatesWin.openWindow(
            Alloy.createController(path, {
                data,
            }).getView()
        );
    } else {
        Alloy.createController(path, {
            data,
        })
            .getView()
            .open();
    }
}
