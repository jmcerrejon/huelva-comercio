var args = $.args;
$.textfield.applyProperties(
	_.omit(args, "__parentSymbol", "__itemTemplate", "$model", "top")
);
$.textfield.fireEvent(
	"reload",
	_.omit(args, "__parentSymbol", "__itemTemplate", "$model", "top")
);
var currentChoice = null;

if (args.textfield) {
	$.textfield.applyProperties(args.textfield);
}
if (args.container) {
	$.container2.applyProperties(args.container);
}
if (args.separator) {
	$.separator.applyProperties(args.separator);
}

if (args.required) {
	$.textfield.hintText = args.hintText ? args.hintText + " *" : "";
}



if (args.hintTextTitle) {
	// $.textfield.hintText = "";
	var view = Ti.UI.createView({
		width: "100%",
		height: Ti.UI.SIZE,
		top: 5,
		layout: "vertical"
	});
	var lbl = Ti.UI.createLabel({
		width: "99%",
		font: {
			fontSize: 14,
			fontFamily: Alloy.CFG.FONTS.semibold
		},
		color: "#222222",
		height: Ti.UI.SIZE,
		text: args.hintTextTitle
	});
	view.add(lbl);

	var view2 = Ti.UI.createView({
		width: "100%",
		height: 150
	});
	view2.add($.container2);
	view.add(view2);
	$.container.removeAllChildren();
	$.container.add(view);

	// $.container.height = Ti.UI.SIZE;
}

function getValue() {
	if (args.isDate) {
		return Alloy.Globals.moment($.textfield.date).format();
	} else {
		if (args.isList) {
			return currentChoice.val;
		} else {
			return $.textfield.getValue();
		}
	}
}
$.getValue = getValue;

function returnF(e) {
	$.trigger("previous", e);
}

function next(e) {
	$.trigger("next", e);
}

function handleClick(e) {
	$.trigger("click");
}

function focus() {
	$.textfield.focus();
}
$.focus = focus;

function handleFocus(e) {
	if (args.isList) {
		if (OS_IOS) {
			$.container2.fireEvent("click");
		}
	} else if (args.isDate) {
		$.container.fireEvent("click");
	}
}

function handleChange(e) {
	currentChoice = e;
	$.trigger("change", e);
}

function show() {
	$.container.visible = true;
	//   $.container.height = Ti.UI.SIZE;
}
$.show = show;

function hide() {
	$.container.visible = false;
	$.container.height = 0;
}
$.hide = hide;

function getVisible() {
	return $.container.visible;
}
$.getVisible = getVisible;

function getObj() {
	return currentChoice;
}
$.getObj = getObj;

function setValue(e) {
	if (args.isDate) {
		var date = Alloy.Globals.moment(e);
		if (date.isValid()) {
			$.textfield.date = date;
			$.textfield.value = date ?
				Alloy.Globals.moment(date).format("DD MMMM YYYY") :
				"";
		} else {
			$.textfield.value = "";
		}
	} else {
		if (args.isList && args.data) {
			if (OS_ANDROID) {
				var indexSelected = _.findIndex(args.data, function (ev) {
					return ev.text === e;
				});
			}

			// $.textfield.value = e ? e : "";
			$.textfield.value = e ? L(e) : "";
			$.textfield.val = e ? e : "";
		} else {
			$.textfield.value = e ? e : "";
		}
	}
}

function setEnable(enable = true) {
	$.textfield.enabled = $.textfield.touchEnabled = enable;
}

$.setValue = setValue;
$.setEnable = setEnable;