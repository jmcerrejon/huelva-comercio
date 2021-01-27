const pageControl = {
	currentPage: 1,
	itemsPerPage: 15,
};
let itemsPerPage = 10;
const search = {
	'associations': {
		query: ''
	}
};
let isSearchBarVisible = false;

function initListView(query) {
	Alloy.Globals.Api.readAssociations({
		page: 1,
		query: query
	}, (response) => {
		init({
			model: 'associations',
			currentPage: 'currentPage',
			response,
			listView: 'lView',
			infScrollWidget: 'is'
		});
	});
}

Alloy.Globals.events.on('associations', () => {
	initListView(search['associations'].query);
	Alloy.Globals.events.off('associations');
});

if (OS_IOS) {
	$.lView.addEventListener('scrollend', function (e) {
		if (e.firstVisibleItemIndex === 0) {
			toggleSearchBar(isSearchBarVisible);
		}
	});
}

function init({ model, currentPage, response, listView, infScrollWidget }) {
	if (pageControl[currentPage] == 1) {
		Alloy.Collections[model].reset();
	}
	Alloy.Collections[model].add(response.data);
	pageControl[currentPage]++;
	if (OS_IOS) {
		toggleSearchBar(isSearchBarVisible);
	}
	$[infScrollWidget].init($[listView]);
	$[infScrollWidget].setOptions({
		msgTap: '',
		msgDone: '',
		msgError: 'Toca para intentar de nuevo...'
	});
}

function myLoaderAssociations(e) {
	myLoader({
		model: 'associations',
		currentPage: 'currentPage',
		itemsPerPage: 'itemsPerPage',
		element: e
	});
}

function myLoader({ model, currentPage, itemsPerPage, element }) {
	console.log(JSON.stringify(pageControl, null, 2));
	Alloy.Collections[model].fetch({
		page: pageControl[currentPage],
		query: search[model].query,
		add: true,
		success: function (collection) {
			pageControl[currentPage]++;
			if (_.isUndefined(element)) {
				console.error('element is undefined!');
				return; 
			}
			((collection.length % pageControl[itemsPerPage]) == 0) ? element.success() : element.done();
		},
		error: function (col) {
			Alloy.Globals.showMessage('No se pueden mostrar. Inténtelo mas tarde.');
		}
	});
}

function reset() {
	console.log(JSON.stringify(pageControl, null, 2));
	search['associations'].query = '';
	resetListView({
		model: 'associations',
		currentPage: 'currentPage',
		infScrollWidget: 'is',
		refreshControl: 'refreshListView'
	});
}

function resetListView({ model, currentPage, infScrollWidget, refreshControl }) {
	pageControl[currentPage] = 1;
	Alloy.Collections[model].fetch({
		page: pageControl[currentPage],
		query: search[model].query,
		success: (collection) => {
			$[refreshControl].endRefreshing();
			if (OS_IOS) {
				toggleSearchBar(isSearchBarVisible = false);
			}
			$[infScrollWidget].load();
			$[infScrollWidget].mark();
		}
	});
}

function doOpenAffiliates(e) {
	if (Alloy.Globals.guest) {
		return;
	}
	openView({
		model: 'associations',
		index: e.itemId,
		path: 'affiliates/affiliates'
	});
}

function openView({model, index, path}) {
	const data = Alloy.Collections[model].get(index).toJSON();

	if (data.affiliates_count === 0) {
		return;
	}
	Alloy.Globals.affiliatesWin.openWindow(Alloy.createController(path, {
		data,
	}).getView());
}

function parseAssociation(model) {
	var transform = model.toJSON();
	transform.logoUrl = (_.isNull(transform.img_path)) ? "/images/logo.png": transform.img_path;

    return transform;
}

function toggleSearchBar(isVisible = false) {
	$.lView.setContentOffset({
		x: 0,
		y: (isVisible) ? 0 : 50
	});
	isSearchBarVisible = !isSearchBarVisible;
}

function doSearchAssociation(e) {
	if (e.value.length < 3) {
		Alloy.Globals.showMessage('Escriba al menos 3 caracteres.');
		return;
	}
	pageControl.currentPage = 1;
	search['associations'].query = e.value;
	Alloy.Collections.associations.reset();
	initListView(search['associations'].query);
	// Trick to hide the control and show the ListView
	$.searchBar.value = '';
	$.searchBar.hide();
	$.searchBar.show();
	// We need the next for Infinity scroll works
	$.is.load();
	$.is.mark();
}
