let canGoBack = false;
let currentURL = $.args.url || Alloy.CFG.url;

(function constructor({url = 'https://foe.es', title, share = true}) {
    $.navbar.load({
        btnLeft: {
            title: '\uf00d',
            visible: true,
        },
        title: {
            visible: true,
            text: title || 'Noticias',
        },
        btnRight: {
            visible: share,
            title: OS_IOS ? '\uf35d' : '\uf1e0',
        },
    });
    $.webview.url = url;
})($.args);

function close({type}) {
    switch (type) {
        case 'back':
            if (canGoBack) {
                $.webview.goBack();
            } else {
                $.webviewWin.close();
            }
            break;

        case 'action':
            shareArticle();
            break;
    }
}

function shareArticle() {
    const cleanedURL = currentURL.replace(Alloy.CFG.extra_url_parameters, '');

    if (OS_IOS) {
        const docViewer = Ti.UI.iOS.createDocumentViewer({url: cleanedURL});
        docViewer.show({view: $.webviewWin, animated: true});
    } else {
        var content = {
            status: cleanedURL,
            androidDialogTitle: 'Compartir',
        };

        require('com.alcoapps.socialshare').share(content);
    }
}

function checkLink(e) {
    currentURL = e.url;
    Ti.API.info(`e.url = ${e.url}`);

    if (OS_ANDROID) {
        if (currentURL.endsWith('.pdf')) {
            $.webview.stopLoading();
            var win = $.UI.create('Window');
            var pdfView = require('fr.squirrel.pdfview').createView({
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                url: currentURL,
            });
            win.add(pdfView);
            win.open();
            return false;
        }
    } else {
        if (currentURL.startsWith('http') || currentURL.startsWith('tel:') || currentURL.startsWith('mailto:')) {
            Ti.Platform.openURL(currentURL);
        }
    }
    return true;
}

function setCurrentURL(e) {
    currentURL = e.url;
}
