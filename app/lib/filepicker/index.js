/**
 * Librería selección de fichero
 * @author Jorge Macías García
 * @copyright Universitat Politècnica de València (c) 2018
 * @module filepicker
 */

exports.pick = pick;

const FileHelper = require('filepicker/lib/file-helper');
const FilePickerError = require('filepicker/lib/FilePickerError');

const ERROR = FilePickerError.prototype.ERROR;

const callback = {
  success: null,
  error: null
};

const CONSTANTS = {
  //5MB
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  IOS: {
    UTIS: ['public.data']
  },
  ANDROID: {
    TYPE: '*/*'
  }
};

const FilePickerManager = {
  activity: null,
  path: null,
  maxSize: null,
  utis: null,
  sourceView: null
};

/**
 * Selección de fichero
 * @method  pick
 * @param {object} params
 */
function pick(params) {
  Ti.API.debug('Filepicker.pick');

  const args = Object(params);

  if (!args.success || !args.error) {
    throw new Error(ERROR.NO_CALLBACK.CODE, ERROR.NO_CALLBACK.MESSAGE);
  }

  FilePickerManager.activity = args.activity || null;
  FilePickerManager.type = args.type || CONSTANTS.ANDROID.TYPE;
  FilePickerManager.utis = args.utis || CONSTANTS.IOS.UTIS;
  FilePickerManager.path = args.path || Ti.Filesystem.tempDirectory;
  FilePickerManager.maxSize = args.maxSize || CONSTANTS.MAX_FILE_SIZE;
  FilePickerManager.sourceView = args.sourceView || null;

  //Intercept user callback
  callback.success = args.success;
  callback.error = args.error;

  if (OS_IOS) {
    pickFileForIos();
  } else {
    pickFileForAndroid();
  }
}

/**
 * Selección de fichero para iOS
 * @method  pickFileForIos
 */
function pickFileForIos() {
  Ti.API.debug('Filepicker.pickFileForIOS');

  const TiDocumentPicker = require('filepicker/lib/picker');

  TiDocumentPicker.show({
    utis: ['com.adobe.pdf'],
    select: success,
    cancel: error,
    sourceView: FilePickerManager.sourceView
  });
}

/**
 * Selecciona archivo en Android
 * @method  pickFileForAndroid
 */
function pickFileForAndroid() {
  Ti.API.debug('Filepicker.pickFileForAndroid');

  if (!FilePickerManager.activity) {
    throw new FilePickerError(ERROR.NO_ACTIVITY.CODE, ERROR.NO_ACTIVITY.MESSAGE);
  }

  const intent = Ti.Android.createIntent({
    action: Ti.Android.ACTION_GET_CONTENT,
    type: 'application/pdf'
  });

  intent.addCategory(Ti.Android.CATEGORY_OPENABLE);

  //Probar con SDK >= 8
  //Ti.Android.currentActivity.startActivityForResult(intent, onActivityResult);
  FilePickerManager.activity.startActivityForResult(intent, onActivityResult);
}

/**
 * Callback activity for result
 * @method  onActivityResult
 * @param   {object} e Evento
 */
function onActivityResult(e) {
  Ti.API.debug('Filepicker.onActivityResult');

  if (e.resultCode === Titanium.Android.RESULT_OK && e.intent.data) {
    success(e.intent.data);
  } else {
    error({
      code: ERROR.NO_ACTIVITY_RESULT.CODE,
      message: ERROR.NO_ACTIVITY_RESULT.MESSAGE
    });
  }
}

/**
 * Filepicker success callback
 * @method  error
 * @param   {object} uri
 */
function success(uri) {
  Ti.API.debug('Filepicker.success', uri);

  try {
    //iOS: uri[0]
    callback.success({
      file: FileHelper.createFile(Object.assign({
        uri: OS_IOS ? uri[0] : uri
      }, FilePickerManager))
    });
  } catch (e) {
    Ti.API.debug('Error on Filepicker.createPickedFile: ' + e.message);
    error({
      code: e.code,
      message: e.message
    });
  }
}

/**
 * Filepicker error callback
 * @method  error
 * @param {object} e
 */
function error(e) {
  Ti.API.debug('Filepicker.error');
  callback.error({
    code: e.code,
    message: e.message
  });
}

