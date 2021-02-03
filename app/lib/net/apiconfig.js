exports.config = {
    debug: Alloy.CFG.logEnable,
    autoValidateParams: false,
    validatesSecureCertificate: false,
    errorsAsObjects: true,
    timeout: 4000,
    url: Alloy.CFG.baseapi,
    requestHeaders: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + Alloy.Globals.token,
    },
    methods: [
        {
            name: 'signin',
            post:
                'auth/user/login?email=<email>&password=<password>&device_name=<device_name>',
            onError: (response, callback) => {
                Alloy.Globals.loading.hide();
                if (_.isFunction(callback)) {
                    callback(response);
                }
            },
        },
        {
            name: 'signup',
            post: 'auth/user/register',
            onError: (response) => {
                Alloy.Globals.loading.hide();
                Ti.UI.createAlertDialog({
                    title: 'Información',
                    message: response.content.message,
                    ok: 'Vale',
                }).show();
            },
        },
        {
            name: 'logout',
            post: 'auth/logout',
        },
        {
            name: 'me',
            post: 'auth/me',
            onError: (response, callback) => {
                if (_.isFunction(callback)) {
                    callback(response);
                }
            },
        },
        {
            name: 'resetPassword',
            post: 'auth/reset-password?email=<email>',
        },
        {
            name: 'photos',
            get: 'photos',
        },
        {
            name: 'getScheduleByMonthYear',
            get: 'schedule?month=<month>&year=<year>',
        },
        {
            name: 'readBanners',
            get: 'banners',
        },
        {
            name: 'readNews',
            get: 'news?page=<page>&q=<query>',
        },
        {
            name: 'readCovenants',
            get: 'covenants',
        },
        {
            name: 'readSectors',
            get: 'sectors',
        },
        {
            name: 'readEvents',
            get: 'events?page=<page>',
        },
        {
            name: 'readEmployments',
            get: 'employments?page=<page>&sector_id=<sector_id>&q=<query>',
        },
        {
            name: 'postEmployment',
            post: 'employments',
            onError: (response) => {
                let message =
                    'Verifique que ha introducido todos los datos y son correctos';
                if (response.content && response.content.message) {
                    message = response.content.message;
                }
                Alloy.Globals.loading.hide();
                Ti.UI.createAlertDialog({
                    title: 'Se ha producido un error',
                    message,
                    ok: 'Vale',
                }).show();
            },
        },
        {
            name: 'updateEmployment',
            put: 'employments/<objectId>',
        },
        {
            name: 'delEmployment',
            delete: 'employments/<objectId>',
        },
        {
            name: 'readCandidates',
            get: 'candidates?page=<page>&sector_id=<sector_id>&q=<query>',
        },
        {
            name: 'postCandidate',
            post: 'candidates',
            onError: (response) => {
                if (ENV_DEV) {
                    console.log(JSON.stringify(response, null, 2));
                }
                Alloy.Globals.loading.hide();
                const message = !_.isUndefined(response.content.errors.email)
                    ? response.content.errors.email[0]
                    : response.content.message;
                Ti.UI.createAlertDialog({
                    title: 'Se ha producido un error',
                    message,
                    ok: 'Vale',
                }).show();
            },
        },
        {
            name: 'updateCandidate',
            put: 'candidates/<objectId>',
            onError: (response) => {
                if (ENV_DEV) {
                    console.log(JSON.stringify(response, null, 2));
                }
                Alloy.Globals.loading.hide();
                Ti.UI.createAlertDialog({
                    title: 'Se ha producido un error',
                    message:
                        'Compruebe que ha validado su currículum en el email enviado o cierre completamente la aplicación.',
                    ok: 'Vale',
                }).show();
            },
        },
        {
            name: 'delCandidate',
            delete: 'candidates/<objectId>',
            onError: (response, callback) => {
                Alloy.Globals.loading.hide();
                Ti.API.error(JSON.stringify(response, null, 2));
                if (_.isFunction(callback)) {
                    callback(response);
                }
            },
        },
        {
            name: 'sendDeviceToken4Notifications',
            post: 'notifications/?token=<device_token>',
        },
        {
            name: 'updateNotificationSettings',
            put: 'notifications/<device_token>',
        },
        {
            name: 'readAssociations',
            get: 'associations?page=<page>&q=<query>',
        },
        {
            name: 'readAffiliates',
            get:
                'affiliates/?page=<page>&q=<query>&association_id=<association_id>',
        },
        {
            name: 'readProfessions',
            get: 'professions/?q=<query>',
        },
        {
            name: 'affiliate',
            get: 'affiliates/<id>',
        },
        {
            name: 'updateAffiliate',
            put: 'affiliates',
            onError: (response) => {
                console.log(JSON.stringify(response, null, 2));
                Alloy.Globals.loading.hide();
                Ti.UI.createAlertDialog({
                    title: 'Error al actualizar candidato',
                    message: 'Verifique que todos los datos son correctos.',
                    ok: 'Vale',
                }).show();
            },
        },
        {
            name: 'sendEmail',
            post: 'mail-info',
            onError: (response) => {
                Alloy.Globals.loading.hide();
                Ti.UI.createAlertDialog({
                    title: 'Se ha producido un error',
                    message: response.content.message,
                    ok: 'Vale',
                }).show();
            },
        },
        {
            name: 'searchProfession',
            get: 'professions?q=<query>',
            onLoad: (response) => {
                if (!response.success && data.lenght === 0) {
                    return;
                }

                Alloy.Collections.professions.reset(
                    response.data.map(function (value, index) {
                        return {
                            id: index,
                            value: value,
                        };
                    })
                );
            },
        },
    ],
    models: [
        {
            name: 'foe',
            collections: [
                {
                    name: 'banners',
                    content: 'data',
                    read: 'readBanners',
                },
                {
                    name: 'news',
                    content: 'data',
                    read: 'readNews',
                },
                {
                    name: 'events',
                    content: 'data',
                    read: 'readEvents',
                },
            ],
        },
        {
            name: 'profession',
            collections: [
                {
                    name: 'professions',
                    content: 'data',
                    read: 'searchProfession',
                },
            ],
        },
        {
            name: 'appointment',
            id: 'id',
            collections: [
                {
                    name: 'selected_appointments',
                },
            ],
        },
        {
            name: 'schedule',
            id: 'event_id',
            collections: [
                {
                    name: 'schedules',
                    content: 'data',
                    read: 'getScheduleByMonthYear',
                },
            ],
        },
        {
            name: 'employment',
            id: 'id',
            create: 'postEmployment',
            update: 'updateEmployment',
            delete: 'delEmployment',
            collections: [
                {
                    name: 'employments',
                    content: 'data',
                    read: 'readEmployments',
                },
            ],
        },
        {
            name: 'association',
            id: 'id',
            collections: [
                {
                    name: 'associations',
                    content: 'data',
                    read: 'readAssociations',
                },
            ],
        },
        {
            name: 'affiliate',
            id: 'id',
            collections: [
                {
                    name: 'affiliates',
                    content: 'data',
                    read: 'readAffiliates',
                },
            ],
        },
        {
            name: 'candidate',
            id: 'id',
            create: 'postCandidate',
            update: 'updateCandidate',
            delete: 'delCandidate',
            collections: [
                {
                    name: 'candidates',
                    content: 'data',
                    read: 'readCandidates',
                },
            ],
        },
    ],
    onError: (response) => {
        Alloy.Globals.loading.hide();
        if (response.success) {
            // success = true, move on...
            return;
        }
        let message = !_.isUndefined(response.message)
            ? response.messag
            : !_.isUndefined(response.error)
            ? response.error
            : response.content.message;

        if (message === 'The given data was invalid.') {
            // TODO Add a function to get all fields: response.errors":{"contact":["El campo contacto es obligatorio."]}}
            message =
                'Por favor, rellene todos los campos y compruebe que son correctos.';
        }

        // Invalid user
        if (response.code === 401) {
            Alloy.Globals.events.trigger('closeSession');
            message =
                'Por motivos de seguridad, debe volver a iniciar sesión.\nSi no puede autentificarse, contacte con CECA.';
        }

        if (response.code === 503) {
            Alloy.Globals.events.trigger('closeSession');
            message =
                'Por motivos de seguridad, debe volver a iniciar sesión.\nSi no puede autentificarse, contacte con CECA.';
        }

        if (ENV_DEV) {
            Ti.API.error(JSON.stringify(response, null, 2));
        }

        // Unable to resolve or 503 (Maintenance mode)
        if (message.indexOf('Unable') > -1 || response.code === 503) {
            message =
                'Servidor en mantenimiento. Inténtelo de nuevo mas tarde. Disculpen las molestias.';
        }

        Ti.UI.createAlertDialog({
            title: 'Atención',
            message,
            ok: 'Vale',
        }).show();
    },
    onLoad: (response, callback) => {
        // if (ENV_DEV) {
        // 	console.log('--- onload=' + JSON.stringify(response, null, 2));
        // }

        Alloy.Globals.loading.hide();

        if (_.isFunction(callback)) {
            callback(response);
        }
    },
};
