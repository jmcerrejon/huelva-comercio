module.exports = FilePickerError;

/**
 * @method FilePickerError
 * @param {number} code
 * @param {description} message
 */
function FilePickerError(code, message) {
  this.code = code;
  this.message = message;
}

FilePickerError.prototype.ERROR = {
  NO_CALLBACK: {
    CODE: -1,
    MESSAGE: 'Error on Filepicker.pick: No callback provided'
  },
  NO_ACTIVITY: {
    CODE: -2,
    MESSAGE: 'Error on Filepicker.pickFileForAndroid: No activity provided'
  },
  NO_ACTIVITY_RESULT: {
    CODE: -6,
    MESSAGE: 'Error on Filepicker.pickFileForAndroid: No activity result'
  },
  CREATE_FOLDER: {
    CODE: -3,
    MESSAGE: 'Error on Filepicker.createFile: Folder not created'
  },
  COPY_FILE: {
    CODE: -4,
    MESSAGE: 'Error on Filepicker.createFile: File not copied'
  },
  READ_SOURCE: {
    CODE: -5,
    MESSAGE: 'Error on Filepicker.createFile: Reading source'
  },
  DELETE_FILE: {
    CODE: -6,
    MESSAGE: 'Error on Filepicker.createFile: File not deleted'
  },
  MAX_SIZE_REACHED: {
    CODE: -7,
    MESSAGE: 'Error on Filepicker.createFile: Max file reached'
  },
  NORMALIZE_URI: {
    CODE: -8,
    MESSAGE: 'Error on Filepicker.createFile: Normalizing uri'
  },
  FILE_CHECKSUM: {
    CODE: -9,
    MESSAGE: 'Error on Filepicker.createFile: File not copied properly. Checksum failed'
  },
  NO_EXTENSION: {
    CODE: -10,
    MESSAGE: 'Invalid selected file. Missing extension'
  }  
};
