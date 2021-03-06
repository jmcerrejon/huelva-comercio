const pageControl = {
    currentPage: 1,
    itemsPerPage: 15,
};
const search = {
    affiliates: {
        query: '',
    },
};
let isSearchBarVisible = false;

function initListView(query) {
    Alloy.Globals.Api.readAffiliates(
        {
            page: 1,
            query: query,
        },
        (response) => {
            init({
                model: 'affiliates',
                currentPage: 'currentPage',
                response,
                listView: 'lView',
                infScrollWidget: 'is',
            });
        }
    );
}

Alloy.Globals.events.on('affiliates', () => {
    initListView(search['affiliates'].query);
    Alloy.Globals.events.off('affiliates');
});

function init({model, currentPage, response, listView, infScrollWidget}) {
    if (pageControl[currentPage] == 1) {
        Alloy.Collections[model].reset();
    }
    Alloy.Collections[model].add(response.data);
    pageControl[currentPage]++;
    $[infScrollWidget].init($[listView]);
    $[infScrollWidget].setOptions({
        msgTap: '',
        msgDone: '',
        msgError: 'Toca para intentar de nuevo...',
    });
}

function doTransform(model) {
    var transform = model.toJSON();

    transform.logoUrl = _.isNull(transform.logo_path)
        ? '/images/logo_256.png'
        : transform.logo_path;

    return transform;
}

function myLoaderAssociations(e) {
    myLoader({
        model: 'affiliates',
        currentPage: 'currentPage',
        itemsPerPage: 'itemsPerPage',
        element: e,
    });
}

function myLoader({model, currentPage, itemsPerPage, element}) {
    Alloy.Collections[model].fetch({
        page: pageControl[currentPage],
        query: search[model].query,
        add: true,
        success: function (collection) {
            if (_.isUndefined(element)) {
                return;
            }
            if (pageControl[currentPage] === pageControl[itemsPerPage]) {
                element.done();
            } else {
                pageControl[currentPage]++;
                element.success();
            }
        },
        error: function (col) {
            Alloy.Globals.showMessage(
                'No se pueden mostrar. Inténtelo mas tarde.'
            );
        },
    });
}

function reset() {
    search['affiliates'].query = '';
    resetListView({
        model: 'affiliates',
        currentPage: 'currentPage',
        infScrollWidget: 'is',
        refreshControl: 'refreshListView',
    });
}

function resetListView({model, currentPage, infScrollWidget, refreshControl}) {
    pageControl[currentPage] = 1;
    Alloy.Collections[model].fetch({
        page: pageControl[currentPage],
        query: search[model].query,
        success: (collection) => {
            $[refreshControl].endRefreshing();
            $[infScrollWidget].load();
            $[infScrollWidget].mark();
        },
    });
}

function doOpenAffiliates(e) {
    openView({
        model: 'affiliates',
        index: e.itemId,
        path: 'affiliates/affiliate_detail',
    });
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

function close() {
    $.wAffiliates.close();
}

function doSearchAffiliate(e) {
    const searchText = e.source.value;

    pageControl.currentPage = 1;
    search['affiliates'].query = searchText;
    Alloy.Collections.affiliates.reset();
    initListView(search['affiliates'].query);
    $.is.load();
    $.is.mark();
}
