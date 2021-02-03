const MAX_ATTACHMENT_SIZE = 1 * 1024 * 1024;
const Filepicker = require('filepicker');
const utils = require('/utils');
const minAutocompleteCharacters = 3;
const debouncedDoRequestAutocomplete = _.debounce(
    doRequestAutocomplete,
    500,
    true
);
let formElements = [
        'full_name',
        'email',
        'occupation',
        'phone',
        'description',
        'drive_license',
        'food_license',
        'other_languages',
        'birth_date',
    ],
    signedCandidateId =
        Alloy.Globals.candidate !== null ? Alloy.Globals.candidate.id : null,
    candidateId = $.args.data !== null ? $.args.data.id : 0,
    editModeEnable = false,
    pdfFile = null;

(function constructor(args) {
    $.navbar.load({
        btnLeft: {
            visible: true,
        },
        title: {
            visible: true,
            text: 'Candidato',
        },
        btnRight: {
            title: '\uf044',
            visible: false,
        },
    });
    renderContent(args);
})($.args);

function userCanEdit() {
    return !($.args.method === 'POST') && signedCandidateId === candidateId;
}

function renderContent(args) {
    switch (args.method) {
        case 'PUT':
            editMode();
        case 'GET':
            if (args.data !== null) {
                setInputValues({
                    full_name: args.data.full_name || '',
                    email: args.data.email || '',
                    occupation: args.data.occupation || '',
                    phone: args.data.phone || '',
                    birth_date: formatBirthDate(args.data.birth_date),
                    sector: args.data.sector_name || '',
                    description: args.data.description || '',
                    drive_license: args.data.drive_license || '',
                    food_license: args.data.food_license || '',
                    other_languages: args.data.other_languages || '',
                });
            }

            if (
                signedCandidateId !== candidateId ||
                (!isGuest() && !_.isNull(Alloy.Globals.candidate))
            ) {
                $.vSubmit.height = $.vDelete.height = $.lbPdfMax.height = 0;
            }
            break;

        case 'POST':
            if (ENV_DEV) {
                setInputValues({
                    full_name: 'Pedro Montero',
                    email: 'ulysess@gmail.com',
                    occupation: 'Abogada',
                    phone: '555-4651',
                    description: 'Disponible las 24 horas.',
                    birth_date: formatBirthDate('2020-02-02 10:00:00'),
                });
            }
            $.delCandidate.height =
                Alloy.Globals.candidate !== null ? Ti.UI.SIZE : 0;
            $.vPrivacyPolicy.height = Ti.UI.SIZE;
            editMode();
            break;
    }
    handleCVState(args.data);
}

function formatBirthDate(date) {
    if (!Alloy.Globals.moment(date).isValid()) {
        return '';
    }

    return Alloy.Globals.moment(date);
}

function isGuest() {
    return Alloy.Globals.guest;
}

function doRefreshProfessionsTextField(e) {
    $.occupation.setValue(e.source.text.trim());

    doLostKeyBoardFocus(e);
}

function doLostKeyBoardFocus(e) {
    if (e.source.bindId === 'title') {
        hideListView();
        $.occupation.blur();
    }
}

function hideListView() {
    $.listProfessionsView.height = 0;
}

function doAutocomplete(e) {
    if (
        e.source.value.length >= minAutocompleteCharacters &&
        e.source.value.slice(-1) !== ' '
    ) {
        $.listProfessionsView.height = Ti.UI.SIZE;
        debouncedDoRequestAutocomplete(e);
    } else {
        hideListView();
    }
}

function doRequestAutocomplete(e) {
    Alloy.Globals.Api.searchProfession({
        query: e.source.value.trim(),
    });
}

function fillSectorPicker(list, first = null) {
    $.sector.loadList(renderSectorList(list, first));
}

function handleCVState(data = null) {
    if (!isGuest()) {
        if (_.isNull(data.curriculum_path)) {
            $.vAddPdf.height = 0;
        } else {
            $.btnAddPdf.title = 'VER CURRÍCULUM';
        }
    }
}

function renderSectorList(sectors, firstElementName) {
    let result = [];
    sectors.map((sector) => {
        const item = {
            value: sector.id,
            text: sector.name,
        };
        firstElementName !== null && firstElementName === sector.name
            ? result.unshift(item)
            : result.push(item);
    });

    return result;
}

function setInputValues(item) {
    for (var key in item) {
        _.isUndefined($[key].views.buttonWrapper)
            ? $[key].setValue(item[key])
            : $[key].setActive(item[key]);
    }
}

function getFormValues(dataInputs) {
    let data = {};
    dataInputs.map((key) => {
        data[key] = $[key].getValue();
    });

    return data;
}

function actions(e) {
    switch (e.type) {
        case 'back':
            close();
            break;
        case 'action':
            editMode();
            break;
    }
}

function close() {
    $.trigger('close');
    $.candidateDetail.close();
}

function editMode() {
    if (!editModeEnable) {
        editModeEnable = !editModeEnable;
        $.vSubmit.height = $.vDelete.height = Ti.UI.SIZE;

        enableInputValues();
        if (isGuest() && !_.isNull(Alloy.Globals.candidate)) {
            fillSectorPicker(
                $.args.sectors,
                Alloy.Globals.candidate.sector_name
            );
        } else {
            fillSectorPicker($.args.sectors);
            $.sector.setValue(
                $.args.method === 'PUT'
                    ? $.args.sector_name
                    : $.args.sectors[0].name
            );
        }
        $[formElements[0]].views.textfield.focus();
    }
}

function enableInputValues() {
    disableEmailField();

    formElements.map((item) => {
        $[item].setEnable(true);
    });
}

function disableEmailField() {
    if (!_.isNull(Alloy.Globals.candidate)) {
        // Candidate can't modify the email when submit the cv
        formElements = arrayRemove(formElements, 'email');
    } else {
        $.email.setKeyboardType(Ti.UI.KEYBOARD_TYPE_EMAIL);
    }
}

function arrayRemove(arr, value) {
    return arr.filter(function (ele) {
        return ele != value;
    });
}

function submit() {
    const data = getFormValues(formElements);

    if (hasMissingField(data)) {
        return;
    }

    if ($.args.method === 'POST' && !require('core').valideEmail(data.email)) {
        Alloy.Globals.showMessage(
            'Compruebe que es un email válido.',
            'Email incorrecto'
        );
        return;
    }

    data.sector_id = setSectorId($.sector.getValue());
    data.birth_date = Alloy.Globals.moment($.birth_date.getValue()).format(
        'YYYY-MM-DD'
    );

    if ($.args.method === 'POST') {
        if ($.accept_privacy.getValue() === false) {
            Alloy.Globals.showMessage(
                'Primero debe aceptar las condiciones de privacidad.'
            );
            return;
        }

        if (_.isNull(pdfFile)) {
            showDialogNotPdfAttached(data);
            return;
        }

        postCandidate(data);
    } else {
        updateCandidate(data);
    }
}

function hasMissingField(fields) {
    let d = [];
    _.each(fields, function (elem, key) {
        if (!elem) {
            let view = $[key].views;
            if (view) {
                if (view.textfield && view.textfield.required) {
                    d.push(view.textfield.hintTextTitle + '');
                }
            }
        }
    });

    if (d.length === 0) {
        return false;
    }

    Alloy.Globals.showMessage(d.join('\n'), 'Rellene los campos');

    return true;
}

function showDialogNotPdfAttached(data) {
    var alertDialog = Ti.UI.createAlertDialog({
        title: 'Incluir currículum',
        message: 'No ha adjuntado un currículum. ¿Desea hacerlo ahora?',
        buttonNames: ['No', 'Sí'],
        cancelButton: 0,
    });
    alertDialog.addEventListener('click', function (e) {
        if (e.index === 0) {
            postCandidate(data);
            return;
        }

        doAddCV();
    });
    alertDialog.show();
}

function setSectorId(sectorName) {
    return $.args.sectors.filter((sector) => sector.name === sectorName)[0].id;
}

function postCandidate(body) {
    Alloy.Globals.loading.show('Guardando...');
    Alloy.Globals.Api.postCandidate(
        {
            body,
        },
        cbCreateOrUpdateCandidate
    );
}

function updateCandidate(body) {
    Alloy.Globals.loading.show('Guardando...');
    Alloy.Globals.Api.updateCandidate(
        {
            objectId: signedCandidateId,
            body,
        },
        cbCreateOrUpdateCandidate
    );
}

function cbCreateOrUpdateCandidate(response) {
    Alloy.Globals.loading.hide();
    if (!response.success) {
        Alloy.Globals.showMessage(
            `Hubo un problema al eliminar al candidato. Contacte con ${Alloy.CFG.global.mail}`
        );
        return;
    }

    Ti.App.Properties.setObject('candidate', response.data);
    Alloy.Globals.candidate = response.data;

    if (!_.isNull(pdfFile)) {
        sendFile(response.data.uuid, pdfFile);
    }

    close();
    Alloy.Globals.showMessage(
        response.message,
        $.args.method === 'POST' ? 'Nuevo candidato' : 'Candidato editado'
    );
}

function deleteCandidate() {
    var alertDialog = Ti.UI.createAlertDialog({
        title: '¿Eliminar currículum?',
        message: 'Esta acción no se podrá deshacer.',
        buttonNames: ['No', 'Sí'],
        cancelButton: 0,
    });
    alertDialog.addEventListener('click', function (e) {
        if (e.index === 0) {
            return;
        }

        Alloy.Globals.Api.delCandidate(
            {
                objectId: signedCandidateId,
            },
            (response) => {
                Alloy.Globals.candidate = null;
                Ti.App.Properties.removeProperty('candidate');
                close();
                Alloy.Globals.showMessage(
                    response.success
                        ? response.message
                        : 'Hubo un problema al eliminar el currículum del servidor en este momento. Lo eliminaremos igualmente.',
                    response.success ? 'Currículum eliminado' : 'Error'
                );
            }
        );
    });
    alertDialog.show();
}

function handlePdfDocument() {
    if (!isGuest()) {
        openRemotePdf($.args.data.curriculum_path);
        return;
    }

    Filepicker.pick({
        //Actividad actual
        activity: OS_ANDROID ? Ti.Android.currentActivity : null,
        //Directorio donde almacenar el fichero obtenido
        path: Ti.Filesystem.tempDirectory,
        util: ['com.adobe.pdf'],
        type: 'application/pdf',
        //Tamaño máximo de fichero
        maxSize: MAX_ATTACHMENT_SIZE,
        //Callbacks de éxito y fracaso
        success: (e) => {
            // console.log(JSON.stringify(file, null, 2));
            pdfFile = {
                url: e.file.nativePath,
                fileName: e.file.name,
            };
            $.btnAddPdf.title = pdfFile.fileName;
        },
        error: (error) => {
            const FILEPICKER_ERROR = {
                COPY_FILE: -4,
                READ_SOURCE: -5,
                MAX_SIZE_REACHED: -7,
            };

            switch (error.code) {
                case FILEPICKER_ERROR.COPY_FILE:
                    //Error copiando fichero
                    break;
                case FILEPICKER_ERROR.READ_SOURCE:
                    //Error leyendo fichero seleccionado
                    break;
                case FILEPICKER_ERROR.MAX_SIZE_REACHED:
                    //Error tamaño máximo superado
                    break;
                default:
                    //Cualquier otro error
                    break;
            }
        },
        //Vista específica para iPad donde anclar el
        //cuadro de diálogo de selección de fichero
        sourceView: $.vAddPdf,
    });

    // if (isGuest()) {
    //     files.getPdfFile((url, fileName) => {
    //         pdfFile = {url, fileName};
    //     }, $.btnAddPdf, $.candidateDetail);
    // } else {
    //     openRemotePdf($.args.data.curriculum_path);
    // }
}

function viewCurrentPdf() {
    (_.isNull(pdfFile) && !pdfFile.url) || openLocalPdf(pdfFile.url);
}

function sendFile(uuid, pdfFile) {
    const file = Ti.Filesystem.getFile(pdfFile.url);

    uploadPdf(
        {
            uuid,
            file,
        },
        function (response) {
            if (!response.success) {
                return;
            }

            let candidate = Ti.App.Properties.getObject('candidate');
            candidate.pdf = pdfFile;
            Ti.App.Properties.setObject('candidate', candidate);
            Alloy.Globals.candidate = candidate;
        }
    );
}

function uploadPdf(data, callback) {
    let client = Ti.Network.createHTTPClient({
        onload: function (e) {
            callback(e);
        },
        onerror: function (e) {
            console.error('[ERROR uploadPdf]: ', e.error);
            Alloy.Globals.showMessage(
                'Compruebe que puede acceder al fichero y que es válido.',
                'Error subir pdf'
            );
        },
        timeout: 120000,
    });
    client.open('POST', Alloy.CFG.baseapi + 'file');
    client.send(data);
}

function doReadPrivacy() {
    Alloy.createController('webviewWin', {
        url: Alloy.CFG.url_privacy,
        title: 'Huelva Comercio',
        share: false,
    })
        .getView()
        .open();
}

function next(e) {
    if (e.source.next === 'phone') {
        hideListView();
    }
    if ($[e.source.next]) $[e.source.next].focus();
}

function previous(e) {
    if ($[e.source.previous]) $[e.source.previous].focus();
}

function openLocalPdf(url) {
    var f = Ti.Filesystem.getFile(url);
    if (OS_IOS) {
        var docViewer = Ti.UI.iOS.createDocumentViewer({
            url: f.nativePath,
        });
        docViewer.show();
    } else {
        var win = $.UI.create('Window');
        var pdfView = require('fr.squirrel.pdfview').createView({
            height: Ti.UI.FILL,
            width: Ti.UI.FILL,
            file: f,
        });
        win.add(pdfView);
        win.open();
    }
}

function openRemotePdf(url) {
    Alloy.Globals.loading.show();
    var client = Ti.Network.createHTTPClient({
        onload: function () {
            var f = Ti.Filesystem.getFile(
                Ti.Filesystem.applicationDataDirectory,
                'file.pdf'
            );
            f.write(this.responseData);
            if (OS_IOS) {
                var docViewer = Ti.UI.iOS.createDocumentViewer({
                    url: f.nativePath,
                });
                docViewer.show();
            } else {
                var win = $.UI.create('Window');
                var pdfView = require('fr.squirrel.pdfview').createView({
                    height: Ti.UI.FILL,
                    width: Ti.UI.FILL,
                    file: f,
                });
                win.add(pdfView);
                win.open();
            }

            Alloy.Globals.loading.hide();
        },
        onerror: function () {
            Alloy.Globals.loading.hide();
            Alloy.Globals.showMessage('Fichero no encontrado.');
        },
    });
    client.open('GET', url);
    client.send();
}

function doLostFocus() {
    $.description.views.textfield.blur();
}

if (OS_ANDROID) {
    $.svCandidate.addEventListener('scroll', function () {
        $.occupation.blur();
    });
}

function sendEmail() {
    if (_.isNull($.args.data) || $.args.data.email == '' || editModeEnable) {
        return;
    }

    showOptionDialog({
        title: 'Enviar un correo',
        options: [$.args.data.email],
        source: 'email',
    });
}

function callPhone() {
    if (_.isNull($.args.data) || $.args.data.phone == '' || editModeEnable) {
        return;
    }

    showOptionDialog({
        title: 'Llamar al teléfono',
        options: [$.args.data.phone],
        source: 'tel://',
    });
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
                  subject:
                      'Contacto con candidato a través de app Huelva Comercio',
              })
            : Ti.Platform.openURL(source + tmpOptions[e.index]);

        resultOptionDialog.removeEventListener('click', onClick);
    });
    resultOptionDialog.show();
}
