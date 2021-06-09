const utils = require('/utils');
let elements = {
    address: [],
    phones: [],
    emails: [],
    websites: [],
    visible: true,
};

(function constructor(args) {
    let options = {
        btnLeft: {
            visible: true,
        },
        title: {
            visible: true,
            text: args.data.name,
        },
    };
    handleImageLogo(args.data.logo_path);
    renderElements('address', [args.data.address]);
    renderElements('phones', [args.data.phone1, args.data.phone2]);
    renderElements('emails', [
        args.data.email1,
        args.data.email2,
        args.data.email3,
    ]);
    renderElements('websites', [args.data.web]);
    $.lb_category.text = `Categoría\n${args.data.category}`;
    $.lb_description.text = args.data.description;
    if (!_.isNull(args.data.social_network)) {
        renderSocialNetworks(args.data.social_network);
    }
})($.args);

function handleImageLogo(logo = null) {
    if (_.isUndefined($.vw_logo)) {
        return;
    }

    !logo ? ($.vw_logo.height = 0) : ($.logoShow.image = logo);
}

function renderElements(item, argsData) {
    const tmpElements = argsData.filter((element) => Boolean(element));

    if (_.isUndefined($['lb_' + item])) {
        return;
    }
    if (tmpElements.length == 0) {
        $['vw_' + item].height = 0;
        return;
    }
    elements[item] = [...tmpElements];
    $['lb_' + item].text = tmpElements.join(' - ');
}

function doActionNavbar(e) {
    switch (e.type) {
        case 'back':
            close();
            break;
    }
}

function close() {
    $.destroy();
    $.wAffiliateDetail.close();
}

function doAction(params) {
    switch (params.source.id) {
        case 'vw_address':
            showOptionDialog({
                title: 'Ver en el mapa',
                options: elements['address'],
                source: OS_IOS
                    ? 'https://maps.apple.com/?z=8&t=m&q='
                    : 'https://www.google.com/maps/search/',
            });
            break;

        case 'vw_phones':
            showOptionDialog({
                title: 'Llamar al teléfono',
                options: elements['phones'],
                source: 'tel://',
            });
            break;

        case 'vw_emails':
            showOptionDialog({
                title: 'Enviar un correo',
                options: elements['emails'],
                source: 'email',
            });
            break;

        case 'vw_websites':
            showOptionDialog({
                title: 'Visitar página web',
                options: elements['websites'],
            });
            break;
    }
}

function showOptionDialog({title, options, source = ''}) {
    var tmpOptions = [...['Cancelar'], ...options];
    const resultOptionDialog = Ti.UI.createOptionDialog({
        title,
        options: tmpOptions,
        cancel: 0,
    });
    resultOptionDialog.addEventListener('click', function onClick(e) {
        if (e.index === 0) {
            return;
        }

        source === 'email'
            ? utils.openEmailForm({
                  email: tmpOptions[e.index],
              })
            : Ti.Platform.openURL(source + tmpOptions[e.index]);

        resultOptionDialog.removeEventListener('click', onClick);
    });
    resultOptionDialog.show();
}

function getSocialNetworkStyle(social) {
    return (
        {
            facebook: {
                color: '#3b82f6',
                font: {fontFamily: 'FontAwesome5Brands-Regular'},
                touchEnabled: false,
                text: '\uf09a',
                title: '\uf09a',
            },
            whatsapp: {
                color: '#22c55e',
                font: {fontFamily: 'FontAwesome5Brands-Regular'},
                touchEnabled: false,
                text: '\uf232',
                title: '\uf232',
            },
            instagram: {
                color: '#d946ef',
                font: {fontFamily: 'FontAwesome5Brands-Regular'},
                touchEnabled: false,
                text: '\uf16d',
                title: '\uf16d',
            },
            twitter: {
                color: '#60a5fa',
                font: {fontFamily: 'FontAwesome5Brands-Regular'},
                touchEnabled: false,
                text: '\uf099',
                title: '\uf099',
            },
            tripadvisor: {
                color: '#facc15',
                font: {fontFamily: 'FontAwesome5Brands-Regular'},
                touchEnabled: false,
                text: '\uf262',
                title: '\uf262',
            },
            tiktok: {
                color: '#000',
                font: {fontFamily: 'FontAwesome5Brands-Regular'},
                touchEnabled: false,
                text: '\ue07b',
                title: '\ue07b',
            },
        }[social] || `text-blue-500 fab fa-${social}`
    );
}

function renderSocialNetworks(networks) {
    const json = JSON.parse(networks);

    Object.entries(json).forEach((entry) => {
        const [key, value] = entry;

        if (!(!!value)) return;

        const style = getSocialNetworkStyle(key);
        const view = Ti.UI.createView({
            width: 48,
            height: 40,
        });
        const label = Ti.UI.createLabel(style);

        view.add(label);
        view.addEventListener('click', () => {
            if (!Ti.Platform.canOpenURL(value)) {
                return;
            }
            Ti.Platform.openURL(value);
        });

        $.vwSocialNetworksContainer.add(view);
    });
}
