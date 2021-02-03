(function constructor() {
    setButtonColor();
})();

function setButtonColor() {
    if (!$.args.typeButton) {
        return;
    }

    let backgroundColor = {
        front: '#3b82f6',
        back: '#1d4ed8',
    };

    switch ($.args.typeButton) {
        case 'warning':
            backgroundColor = {
                front: '#f43f5e',
                back: '#9f1239',
            };
            break;
    }

    $.btnClick.backgroundColor = backgroundColor.front;
    $.vwShadow.backgroundColor = backgroundColor.back;
}

function doClick(e) {
    $.btnClick.animate({
        top: 10,
        duration: 50,
        autoreverse: true,
    });

    $.trigger('click', {
        type: e.source.type,
    });
}
