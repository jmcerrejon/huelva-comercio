let canGoBack = false;
let currentURL = $.args.url || Alloy.CFG.url;

(function constructor({url = 'https://foe.es', title, share = true}) {
    $.navbar.load({
        btnLeft: {
            title: '\uf00d',
            visible: true
        },
        title: {
            visible: true,
            text: title || 'Noticias'
        },
        btnRight: {
            visible: share,
            title: (OS_IOS) ? '\uf35d' : '\uf1e0'
        }
    });
    $.webview.url = url;
})($.args);

function close({type}) {
    switch (type) {
        case 'back':
            if (canGoBack) {
                $.webview.goBack();
                handleCanGoBackButton();
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
    if (OS_IOS) {
        const docViewer = Ti.UI.iOS.createDocumentViewer({url: currentURL});
        docViewer.show({view:$.webviewWin, animated: true});
    } else {
        var content = {
            status: currentURL,
            androidDialogTitle: 'Compartir'
        };

        require('com.alcoapps.socialshare').share(content);
    }
}

function checkLink(e) {
    currentURL = e.url;
    Ti.API.info(`e.url = ${e.url}`);
    handleCanGoBackButton(currentURL);

    if (OS_ANDROID) {
        if (currentURL.endsWith('.pdf')) {
            $.webview.stopLoading();
            var win = $.UI.create("Window");
            var pdfView = require("fr.squirrel.pdfview").createView({
                height: Ti.UI.FILL,
                width: Ti.UI.FILL,
                url: currentURL
            });
            win.add(pdfView);
            win.open();
            return false;
        }
    } else {
        if (currentURL.startsWith('tel:') || currentURL.startsWith('mailto:')) {
            Ti.Platform.openURL(currentURL);
        }
    }
    return true;
}

function handleCanGoBackButton(url = '') {
    canGoBack = (url.startsWith('https://foe.es/convenio-'));

    $.navbar.load({
        btnLeft: {
            title: (canGoBack) ? '\uf053' : '\uf00d'
        }
    });
}

function setCurrentURL(e) {
    currentURL = e.url;
}