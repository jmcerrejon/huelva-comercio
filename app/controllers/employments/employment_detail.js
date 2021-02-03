const utils = require('/utils');
const formElements = ['title', 'contact', 'content', 'requirements'],
    signedUserId = Ti.App.Properties.getObject('user').id,
    employUserId = !_.isUndefined($.args.data) ? $.args.data.user.id : 0,
    employId = !_.isUndefined($.args.data) ? $.args.data.id : 0;
let employHasUpdated = false;
let editModeEnable = false;

(function constructor(args) {
    $.navbar.load({
        btnLeft: {
            visible: true,
        },
        title: {
            visible: true,
            text: 'Centro de negocio',
        },
        btnRight: {
            title: '\uf044',
            visible: userCanEdit(signedUserId, employUserId),
        },
    });
    renderContent(args);
})($.args);

function userCanEdit(userId, employerId) {
    return !($.args.method === 'POST') && userId === employerId;
}

function renderContent(args) {
    switch (args.method) {
        case 'GET':
            setInputValues({
                title: args.data.title || '',
                sector: args.data.sector_name || '',
                content: args.data.content || '',
                requirements: args.data.requirements || '',
                contact: args.data.contact || '',
            });
            $.vSubmit.height = $.vDelete.height = 0;
            break;
        case 'POST':
            $.delEmployment.height = 0;
            editMode();
            break;
    }
}

function fillSectorPicker(list, first = null) {
    $.sector.loadList(renderSectorstList(list, first));
}

function renderSectorstList(sectors, firstElementName) {
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

// TODO Refactor this 💩
function getInputValues(dataInputs) {
    let data = {
        user_id: signedUserId,
        active: true,
    };
    dataInputs.map((key) => {
        data[key] = $[key].textfield.value;
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
    $.employmentDetail.close();
    $.trigger('close', {
        updated: employHasUpdated,
    });
}

function editMode() {
    if (!editModeEnable) {
        editModeEnable = true;
        $.vSubmit.height = $.vDelete.height = Ti.UI.SIZE;
        const firstPickerValue = _.isUndefined($.args.data)
            ? $.args.sectors[0].name
            : $.args.data.sector_name;

        enableInputValues();

        if (OS_ANDROID) {
            fillSectorPicker($.args.sectors, firstPickerValue);
        } else {
            fillSectorPicker($.args.sectors);
            $.sector.setValue(
                _.isUndefined($.args.data)
                    ? $.args.sectors[0].name
                    : $.args.data.sector_name
            );
        }

        $[formElements[0]].views.textfield.focus();
    }
}

function enableInputValues() {
    formElements.map((item) => {
        $[item].setEnable(true);
    });
}

function setSectorId(sectorName) {
    return $.args.sectors.filter((sector) => sector.name === sectorName)[0].id;
}

function submitEmployment(e) {
    if (_.isNull(Alloy.Globals.user)) {
        Alloy.Globals.showMessage(
            'Usted no puede publicar ninguna demanda. Contacte con CECA.'
        );
    }
    const data = getInputValues(formElements);
    data['user_id'] = Alloy.Globals.user.id;
    data['sector_id'] = setSectorId($.sector.getValue());

    if (hasMissingField(data)) {
        return;
    }

    if ($.args.method === 'POST') {
        postEmployment(data);
    } else {
        updateEmployment(data);
    }
}

function hasMissingField(fields) {
    console.log('entro');
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

function postEmployment(body) {
    Alloy.Globals.Api.postEmployment(
        {
            body,
        },
        (response) => {
            if (!response.success) {
                Alloy.Globals.showMessage(
                    `Hubo un problema. Contacte con ${Alloy.CFG.global.mail}`
                );
                return;
            }

            Alloy.Collections.employments.unshift(response.data);
            close();
            Alloy.Globals.showMessage(response.message);
        }
    );
}

function updateEmployment(body) {
    Alloy.Globals.Api.updateEmployment(
        {
            objectId: employId,
            body,
        },
        (response) => {
            if (!response.success) {
                Alloy.Globals.showMessage(
                    `Hubo un problema al actualizar. Contacte con ${Alloy.CFG.global.mail}`
                );
                return;
            }

            employHasUpdated = true;
            close();
            Alloy.Globals.showMessage(response.message);
        }
    );
}

function deleteEmployment() {
    var alertDialog = Ti.UI.createAlertDialog({
        title: '¿Eliminar demanda?',
        message: 'Esta acción no se podrá deshacer.',
        buttonNames: ['No', 'Sí'],
        cancelButton: 0,
    });
    alertDialog.addEventListener('click', function (e) {
        if (e.index === 0) {
            return;
        }
        Alloy.Globals.Api.delEmployment(
            {
                objectId: employId,
            },
            (response) => {
                if (!response.success) {
                    Alloy.Globals.showMessage(
                        `Hubo un problema al eliminar. Contacte con ${Alloy.CFG.global.mail}`
                    );
                    return;
                }

                Alloy.Collections.employments.remove(employId);
                close();
                Alloy.Globals.showMessage(response.message);
            }
        );
    });
    alertDialog.show();
}

function next(e) {
    if ($[e.source.next]) $[e.source.next].focus();
}

function previous(e) {
    if ($[e.source.previous]) $[e.source.previous].focus();
}

function doLostFocus() {
    $.requirements.views.textfield.blur();
}

function copy2Clipboard() {
    if (
        _.isUndefined($.args.data.contact) ||
        $.args.data.contact == '' ||
        editModeEnable
    ) {
        return;
    }

    const checkValue = getValueType($.args.data.contact);
    let options = ['Cancelar', 'Copiar al portapaleles'];
    checkValue === 'email'
        ? options.push('Enviar un correo')
        : checkValue === 'phone'
        ? options.push('Llamar por teléfono')
        : null;

    const resultOptionDialog = Ti.UI.createOptionDialog({
        title: 'Elija una opción',
        options,
        cancel: 0,
    });

    resultOptionDialog.addEventListener('click', function onClick(e) {
        switch (e.index) {
            case 1:
                // Clipboard
                Ti.UI.Clipboard.setText($.args.data.contact);
                break;
            case 2:
                // Phone or Email
                checkValue === 'email'
                    ? utils.openEmailForm({
                          email: $.args.data.contact,
                          messageBody: `Estoy interesado en ofrecerle mis servicios para el siguiente anuncio: ${$.args.data.title}`,
                          subject:
                              'Demanda de un servicio a través de app Huelva Comercio',
                      })
                    : Ti.Platform.openURL(`tel://${$.args.data.contact}`);
                break;
            default:
                return;
        }

        resultOptionDialog.removeEventListener('click', onClick);
    });
    resultOptionDialog.show();
}

function getValueType(element) {
    return element.includes('@')
        ? 'email'
        : utils.isPhoneNumber(element)
        ? 'phone'
        : null;
}
