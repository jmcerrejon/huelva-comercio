(function constructor() {
    setButtonColor();
})();

function setButtonColor() {
    if (!$.args.buttonType) {
        return;
    }

    let backgroundColor = {
        front: '#3b82f6',
        back: '#1d4ed8',
    };

    switch ($.args.buttonType) {
        case 'pdf':
            $.vwContainer.width = '25%';
            $.btnClick.text = 'Ver PDF';
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
