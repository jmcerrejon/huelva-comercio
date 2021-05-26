const REMOVE_FROM_ITEMS_PER_PAGE_FIX_ANDROID_BUG = OS_ANDROID ? 2 : 1;
const pageControl = {
    currentPage: 1,
    itemsPerPage: 15,
};
const marker = {
    sectionIndex: 0,
    itemIndex:
        pageControl['itemsPerPage'] -
        REMOVE_FROM_ITEMS_PER_PAGE_FIX_ANDROID_BUG,
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
            page: pageControl['currentPage'],
            query: query,
        },
        (response) => {
            init({
                model: 'affiliates',
                currentPage: 'currentPage',
                response,
                listView: 'lView',
            });

            // Just for test purposes
            // doOpenAffiliates({
            //     itemId: 1,
            // });
        }
    );
}

function addMarker({listView, itemsPerPage, reset = false}) {
    if (reset) {
        marker['itemIndex'] =
            itemsPerPage - REMOVE_FROM_ITEMS_PER_PAGE_FIX_ANDROID_BUG;
    }
    $[listView].addMarker(marker);
    marker['itemIndex'] +=
        itemsPerPage - REMOVE_FROM_ITEMS_PER_PAGE_FIX_ANDROID_BUG;
}

Alloy.Globals.events.on('affiliates', () => {
    initListView(search['affiliates'].query);
    Alloy.Globals.events.off('affiliates');
});

$.lView.addEventListener('marker', () => {
    initListView(search['affiliates'].query);
});

function init({model, currentPage, response, listView}) {
    if (response.data.length === 0) {
        if (search['affiliates'].query !== '') {
            Alloy.Globals.showMessage('No se encontraron resultados.');
        }
        search['affiliates'].query = '';
        return;
    }

    if (pageControl[currentPage] == 1) {
        Alloy.Collections[model].reset();
    }
    Alloy.Collections[model].add(response.data);

    if (response.data.length < pageControl['itemsPerPage']) {
        return;
    }

    pageControl[currentPage]++;

    addMarker({
        listView: listView,
        itemsPerPage: pageControl['itemsPerPage'],
    });
}

function reset() {
    search['affiliates'].query = '';
    resetListView({
        model: 'affiliates',
        currentPage: 'currentPage',
        refreshControl: 'refreshListView',
    });
}

function resetListView({model, currentPage, refreshControl}) {
    pageControl[currentPage] = 1;

    Alloy.Collections[model].fetch({
        page: pageControl[currentPage],
        query: search[model].query,
        success: (collection) => {
            pageControl[currentPage]++;

            $[refreshControl].endRefreshing();

            addMarker({
                listView: 'lView',
                itemsPerPage: pageControl['itemsPerPage'],
                reset: true,
            });
        },
    });
}

function doSearchAffiliate(e) {
    pageControl.currentPage = 1;
    search['affiliates'].query = e.searchText;
    marker['itemIndex'] = pageControl['itemsPerPage'] - 1;
    initListView(search['affiliates'].query);
}

function doOpenAffiliates(e) {
    openView({
        model: 'affiliates',
        index: e.itemId || 1,
        path: 'affiliates/affiliate_detail',
    });
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

function doTransform(model) {
    var transform = model.toJSON();

    transform.logoUrl = _.isNull(transform.logo_path)
        ? '/images/logo_256.png'
        : transform.logo_path;

    return transform;
}
