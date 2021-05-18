let isViewSearchVisible = false;
const MIN_CHARACTER_SEARCH = 3;
const debouncedToggleViewSearchVisibility = _.debounce(
    toggleViewSearchVisibility,
    500,
    true
);

(function constructor(args) {
    if (_.isUndefined(args.title)) {
        $.lblTitle.text = 'Principal';
    }
    if (!_.isUndefined(args.leftIcon)) {
        $.addClass($.lblLeftButton, args.leftIcon);
    }
    if (!_.isUndefined(args.rightIcon)) {
        $.addClass($.lblRightButton, args.rightIcon);
    }
    if (!_.isUndefined(args.filterVisibility)) {
        $.addClass($.lblFilter, args.filterVisibility);
    }
})($.args);

function handleSearchView() {
    debouncedToggleViewSearchVisibility();
}

function toggleViewSearchVisibility() {
    if (OS_IOS) {
        $.vwSearch.height = isViewSearchVisible ? 0 : 60;
        isViewSearchVisible ? $.txtSearch.blur() : $.txtSearch.focus();
        isViewSearchVisible = !isViewSearchVisible;
    } else {
        $.vwSearch.animate(
            {
                height: isViewSearchVisible ? 0 : 60,
                duration: 250,
            },
            () => {
                isViewSearchVisible ? $.txtSearch.blur() : $.txtSearch.focus();
                isViewSearchVisible = !isViewSearchVisible;
            }
        );
    }
}

function doLogin() {
    $.trigger('login');
}

function doFilter() {
    toggleViewSearchVisibility();
    $.trigger('filter');
}

function searchIconClick() {
    doAction();
}

function doAction() {
    if ($.txtSearch.value < MIN_CHARACTER_SEARCH) {
        Alloy.Globals.showMessage('Por favor, escriba al menos 3 caracteres.');
        return;
    }
    Alloy.Globals.loading.show('Buscando...');
    $.trigger('click', {
        searchText: $.txtSearch.value,
    });
    $.txtSearch.value = '';
    toggleViewSearchVisibility();
}
