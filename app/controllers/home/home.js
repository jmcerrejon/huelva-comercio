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
            $.scrollableView.height =
                res.length === 0 ? 0 : SCROLLABLEVIEW_HEIGHT;
        },
    });
    Alloy.Collections.news.fetch({
        page: currentPage++,
        success: (res) => {
            Alloy.Globals.loading.hide(); // It comes from login.js
            POSTS_PER_PAGE = res.length;
            $.is.init($.listView);
            $.is.setOptions({
                msgTap: '',
                msgDone: '',
                msgError: 'Toca para intentar de nuevo...',
            });
        },
    });
    // $.navbar.load({
    //     btnLeft: {
    //         visible: false,
    //     },
    //     nav: {
    //         backgroundColor: 'white',
    //     },
    // });
    const interval = setInterval(function () {
        if ($.scrollableView.views.length === 1) {
            scrollableLoop = false;
            clearInterval(interval);
            interval = null;
            return;
        }
        if (scrollableLoop) {
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
    const view = Alloy.createController('settings').getView();
    view.open(
        OS_IOS
            ? {
                  modal: true,
                  modalTransitionStyle:
                      Titanium.UI.iOS.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
              }
            : {}
    );
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
    modelJSON['image'] =
        modelJSON['image'] == '' ? '/images/logo_256.jpg' : modelJSON['image'];

    return modelJSON;
}

function touchStart(e) {
    scrollableLoop = false;
}

function renderNotFoundTemplate(sizeData = 1) {
    let item = $.listView.sections[0].getItemAt(0);
    item.properties = {
        height: sizeData === 0 ? '250' : 0,
    };
    $.listView.sections[0].updateItemAt(0, item);
    // Remove Infinity Scroll when show not items availables on search (Remember do $.is.show() later)
    $.is.hide();
}
