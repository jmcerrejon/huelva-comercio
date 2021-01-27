let availableDays = [];
let scheduleCollection = null;
let currentDate = new Date();
const moment = require('alloy/moment');
const utils = require('/utils');
const commonLocale = {
	weekdays: ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'],
	weekdaysShort: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
	months: [
		'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio',
		'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
	],
	monthsShort: [
		'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL',
		'AGO', 'SEP', 'OCT', 'NOV', 'DIC'
	],
	week: {
		dow: 1,
		doy: 4
	}
};
moment.updateLocale('es', commonLocale);

(function constructor() {
	Alloy.Globals.loading.show('Cargando calendario...', false);
	$.vCalendar.init();

	getRemoteMonthData(currentDate.getMonth(), currentDate.getFullYear());
})();

Alloy.Globals.events.on('refreshSchedule', () => {
	$.vCalendar.init();
	currentDate = new Date();
	getRemoteMonthData(currentDate.getMonth(), currentDate.getFullYear());
});

function getRemoteMonthData(month, year) {
	Alloy.Collections.schedules.fetch({
		month: (month + 1),	// Jan = (0 + 1) = 1
		year,
		success: function (response) {
			$.refreshListView.endRefreshing();
			scheduleCollection = new Backbone.Collection(Alloy.Collections.schedules.toJSON());
			availableDays = getAvailableDays();
			drawDaysOnCalendar();
		}
	});
}

function reset(e) {
	getRemoteMonthData(moment(currentDate).get('month'), moment(currentDate).get('year'));
}

function calendarChange(e) {
	if (e.type === 'month') {
		$.lMonth.text = e.date.format('MMMM');
		return;
	}

	if (isDayAvailable(e.date)) {
		changeClickedDayColor(e);
	}

	function isDayAvailable(date) {
		return availableDays.indexOf(date.format('YYYY-MM-DD')) !== -1;
	}
}


function changeClickedDayColor(e) {
	const itemsSelected = filterCollectionByDate(scheduleCollection, e.date);
    Alloy.Collections.schedules.reset(itemsSelected);
}

function filterCollectionByDate(col, date) {
    return col.filter(function (model) {
        return formatDateTime(model.get('event_start_unix'), 'YYYY-MM-DD') === moment(date).format('YYYY-MM-DD');
    });
}

function getAvailableDays() {
	const daysSet = new Set();
	Alloy.Collections.schedules.map((model) => {
		daysSet.add(formatDateTime(model.get('event_start_unix'), 'YYYY-MM-DD'));
	});

	return Array.from(daysSet);
}

function doAction(e) {
	const item = e.section.getItemAt(e.itemIndex);
	const id = item.properties.itemId;
	const appointment = Alloy.Collections.schedules.get(id).toJSON();
	switch (e.bindId) {
		case 'vwCalendarIcon':
			const calendar = {
				title: appointment.event_title,
				begin: moment.unix(appointment.event_start_unix).subtract(1, 'hours'),
				end: moment.unix(appointment.event_end_unix).subtract(1, 'hours'),
				info: appointment.event_url
			};
			showAdd2Calendar(calendar);
			break;
	
		default:
			if (!appointment.event_url) {
				return;
			}
			Alloy.createController('webviewWin', {
				url: appointment.event_url,
				title : 'Evento (web)'
			})
			.getView()
			.open();
			break;
	}
}

function showAdd2Calendar(calendar) {
	var alertDialog = Ti.UI.createAlertDialog({
			title: 'Añadir evento al calendario',
			message: '¿Desea añadir a su calendario este evento?',
			buttonNames: ['No', 'Sí'],
			cancelButton: 0
		});
		alertDialog.addEventListener('click', function (e) {
			if (e.index === 0) {
				return;
			}

			utils.add2Calendar(calendar);
		});
		alertDialog.show();
}

function drawDaysOnCalendar() {
	Alloy.Collections.schedules.map(function (model) {
		availableDays.push(moment(model.get('date')).format('YYYY-MM-DD'))
	});

	const children = $.vCalendar.getView().children[1].children;

	_.each(availableDays, function (day) {
		let availableDay = _.filter(children, function (elem, index) {
			// We take advantage of the filter to paint Sundays. 6 = Sunday
			if (moment(elem.date).weekday() == 6) {
				children[index].getChildren()[0].color = Alloy.CFG.COLORS.RED;
			}

			return elem.date.indexOf(moment(day).format('YYYY-MM-DD')) !== -1;
		});

		if (availableDay.length > 0) {
			if (isToday(day)) {
				// availableDay[0].backgroundImage = '/images/circle-red.png';
				availableDay[0].getChildren()[0].color = '#fff';
			} else {
				// We add a dot under the day
				availableDay[0].add(Ti.UI.createImageView({
					top: 25,
					image: '/images/dot-red.png'
				}));
			}
		}
	});
	Alloy.Globals.loading.hide();
}

function prevMonth(e) {
	$.vCalendar.previous();
	currentDate = moment(currentDate).subtract(1, 'M');
	getRemoteMonthData(moment(currentDate).get('month'), moment(currentDate).get('year'));
	// drawDaysOnCalendar();
}

function nextMonth(e) {
	$.vCalendar.next();
	currentDate = moment(currentDate).add(1, 'M');
	getRemoteMonthData(moment(currentDate).get('month'), moment(currentDate).get('year'));
	// drawDaysOnCalendar();
}

function isToday(date) {
    return moment(date, 'YYYY-MM-DD').format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
}

function transformCollection(model) {
	const modelJSON = model.toJSON();
	let dataFormatted = '';
	//  formatDateTime(modelJSON['event_start_unix'], '[Día] DD [de] MMMM');
	if (!_.isNull(modelJSON['event_start_unix'])) {
		dataFormatted += 'Hora: ' + formatDateTime(modelJSON['event_start_unix'], 'HH:mm');
	}
	if ((!_.isNull(modelJSON['event_start_unix'])) && (!_.isNull(modelJSON['event_end_unix']))) {
		dataFormatted += " - " +formatDateTime(modelJSON['event_end_unix'], 'HH:mm');
	}

	modelJSON['data_formatted'] = dataFormatted;
	modelJSON.day = moment.unix(modelJSON['event_start_unix']).format('DD');

	return modelJSON;
}

function formatDateTime(unixTime, format) {
	return moment.unix(unixTime).subtract(1, 'hours').format(format);
}