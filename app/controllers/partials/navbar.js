let isViewSearchVisible = false;
const MIN_CHARACTER_SEARCH = 3;
const debouncedToggleViewSearchVisibility = _.debounce(
    toggleViewSearchVisibility,
    500,
    true
);

(function constructor() {
    if (_.isUndefined($.args.title)) {
        $.lblTitle.text = 'Principal';
    }
    if (!_.isUndefined($.args.leftIcon)) {
        $.addClass($.lblLeftButton, $.args.leftIcon);
    }
    if (!_.isUndefined($.args.rightIcon)) {
        $.addClass($.lblRightButton, $.args.rightIcon);
    }
})();

function handleSearchView() {
    debouncedToggleViewSearchVisibility();
}

function toggleViewSearchVisibility() {
    if ($.vwBody) {
        $.vwBody.animate(
            {
                bottom: isViewSearchVisible ? 0 : 60,
                duration: 250,
            },
            () => {
                isViewSearchVisible ? $.txtSearch.blur() : $.txtSearch.focus();
                isViewSearchVisible = !isViewSearchVisible;
            }
        );
    }
}

function doLogin(params) {
    $.trigger('login');
}

function doAction(e) {
    if (e.value.length < MIN_CHARACTER_SEARCH) {
        Alloy.Globals.showMessage('Por favor, escriba al menos 3 caracteres.');
        return;
    }
    Alloy.Globals.loading.show('Buscando...');
    $.trigger('click', e);
    $.txtSearch.value = '';
    toggleViewSearchVisibility();
}
