import NotificationBanner from 'ti.notificationbanner';
let currentPage = 1;
let POSTS_PER_PAGE = 15;
let scrollableLoop = true;
const OFFSET_CHANGE_HEADER_TITLE = 200;
const SCROLLABLEVIEW_HEIGHT = 175;
const TIME_PER_VIEW_MILISECONDS = 1000 * 8;
const exclusive = getExclusiveValues();
const extraURLParameters = '?app=true';

(function constructor() {
    Alloy.Collections.banners.fetch({
        success: (res) => {
            if (!_.isUndefined($.scrollableView)) {
                $.scrollableView.height =
                    res.length === 0 ? 0 : SCROLLABLEVIEW_HEIGHT;
            }
        },
    });
    Alloy.Globals.loading.show('Cargando ofertas...');
    Alloy.Collections.news.fetch({
        page: currentPage++,
        query: '',
        exclusive: exclusive,
        success: (res) => {
            Alloy.Globals.loading.hide();
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

Alloy.Globals.events.on('refreshOffers', () => {
    if (_.isFunction($.listView.setContentOffset)) {
        $.listView.setContentOffset({
            x: 0,
            y: 0,
        });
    }
    reset();
});

if (OS_IOS) {
    $.listView.addEventListener('scrolling', (e) => {
        const offset =
            $.scrollableView.height === 0
                ? OFFSET_CHANGE_HEADER_TITLE - SCROLLABLEVIEW_HEIGHT
                : OFFSET_CHANGE_HEADER_TITLE;
        $.reqNavbar.lblTitle.text =
            e.targetContentOffset > offset ? 'Ofertas y promos' : 'Inicio';
    });
}
if (OS_ANDROID) {
    $.listView.addEventListener('scrollend', (e) => {
        $.reqNavbar.lblTitle.text =
            e.firstVisibleItemIndex > 0 ? 'Ofertas y promos' : 'Inicio';
    });
}

function myLoader(element) {
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: '',
        exclusive: exclusive,
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
            exclusive: exclusive,
            query: text,
            success: (data) => {
                renderNotFoundTemplate(data.length);
            },
        });
    });
    dialog.show();
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
    Alloy.Collections.news.fetch({
        page: currentPage,
        exclusive: exclusive,
        query: '',
        success: () => {
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

    if (!_.isUndefined(item.viewPost.url) && !_.isNull(item.viewPost.url)) {
        !item.viewPost || openURL(item.viewPost.url + extraURLParameters);
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

function transformCollection(model) {
    let modelJSON = model.toJSON();
    const isExclusive = modelJSON['exclusive'];

    if (Alloy.Globals.guest === true && isExclusive) {
        modelJSON = {
            title: 'Contenido Exclusivo',
            content:
                '¡Regístrate para obtener información sobre ofertas y descuentos especiales!',
        };
    }
    modelJSON['exclusive'] = isExclusive ? 'red' : 'gray';
    modelJSON['exclusiveIcon'] = isExclusive ? Ti.UI.SIZE : 0;
    modelJSON['image'] =
        _.isUndefined(modelJSON['image']) || modelJSON['image'] == ''
            ? 'images/logo_256.png'
            : modelJSON['image'];

    return modelJSON;
}

function touchStart() {
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

function doFilter() {
    if (Alloy.Globals.guest) {
        Alloy.Globals.showMessage(
            'Puedes filtrar por contenido exclusivo si eres usuario registrado',
            'Información'
        );
        return;
    }

    NotificationBanner.show({
        title: 'Promociones',
        subtitle: 'Se muestran las ofertas y promociones exclusivas.',
        duration: 3,
        backgroundColor: '#2178F1',
    });

    if (_.isFunction($.listView.setContentOffset)) {
        $.listView.setContentOffset({
            x: 0,
            y: 0,
        });
    }

    currentPage = 1;
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: '',
        exclusive: 1,
        success: (data) => {
            if (data.length === 0) {
                Alloy.Globals.showMessage('No se encontraron resultados.');
                reset();
            }
        },
    });
}

function doSearch(e) {
    currentPage = 1;
    Alloy.Collections.news.fetch({
        page: currentPage,
        query: e.searchText,
        exclusive: exclusive,
        success: (data) => {
            if (data.length === 0) {
                Alloy.Globals.showMessage('No se encontraron resultados.');
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
        Alloy.Globals.affiliatesTab.openWindow(
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

// 0 = guest user, '' = all offers
function getExclusiveValues() {
    return Alloy.Globals.guest ? 0 : '';
}
