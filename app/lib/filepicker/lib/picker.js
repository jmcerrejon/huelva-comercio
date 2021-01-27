Ti.API.debug('picker.js load first line');
let TiApp = require('Titanium/TiApp');
let UIDocumentMenuViewController = require('UIKit/UIDocumentMenuViewController');
let UIDocumentPickerModeImport = require('UIKit').UIDocumentPickerModeImport;
let UIModalPresentationFormSheet = require('UIKit').UIModalPresentationFormSheet;
let UIModalPresentationPopover = require('UIKit').UIModalPresentationPopover;

let DocumentPickerDelegate = require('filepicker/lib/delegate');

exports.show = show;

function show(params = {}) {
  const isiPad = Ti.Platform.osname === 'ipad';
  const selectCallback = params.select;
  const cancelCallback = params.cancel;
  const utis = params.utis;
  const sourceView = params.sourceView;
  const modalPresentationStyle = isiPad ? UIModalPresentationPopover : UIModalPresentationFormSheet;

  if (!selectCallback) {
    throw new Error('>> doc-picker > Missing "select" callback');
  }

  if (!utis) {
    throw new Error('>> doc-picker > Missing uti\'s');
  }

  if (isiPad && !sourceView) {
    throw new Error('>> doc-picker > Missing required sourceView for iPad');
  }

  const importMenu = UIDocumentMenuViewController.alloc().initWithDocumentTypesInMode(utis || [], UIDocumentPickerModeImport);
  const pickerDelegate = new DocumentPickerDelegate();

  pickerDelegate.didPickDocumentAtURL = function (controller, url) {
    Ti.API.debug('pickerDelegate.didPickDocumentAtURL on doc-picker.js' + ' - url: ' + url);
    selectCallback([String(url)]);
  };

  pickerDelegate.didPickDocumentAtURLs = function (controller, urls) {
    Ti.API.debug('pickerDelegate.didPickDocumentAtURLs on doc-picker.js');
    let results = [];

    for (let i = 0; i < urls.count; i++) {
      results.push(String(urls.objectAtIndex(i)));
    }
    //Ti.API.debug('results: ' + JSON.stringify(results));
    //return results;
    selectCallback(results);
  };

  pickerDelegate.didPickDocumentPicker = function (documentMenu, documentPicker) {
    Ti.API.debug('pickerDelegate.didPickDocumentPicker on doc-picker.js');
    documentPicker.delegate = pickerDelegate;
    TiApp.app().showModalController(documentPicker, true);
  };

  pickerDelegate.documentMenuWasCancelled = function (documentMenu) {
    Ti.API.debug('pickerDelegate.documentMenuWasCancelled on doc-picker.js');
    cancelCallback && cancelCallback();
  };

  importMenu.delegate = pickerDelegate;
  importMenu.modalPresentationStyle = modalPresentationStyle;

  if (isiPad && sourceView) {
    importMenu.popoverPresentationController.sourceView = sourceView;
  }

  TiApp.app().showModalController(importMenu, true);
}
