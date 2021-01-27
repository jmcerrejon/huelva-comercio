/**
 * Helper para la gestión de ficheros Android
 * @module file-helper
 */

const FilePickerError = require('filepicker/lib/FilePickerError');

const Mime = require('filepicker/lib/mime');

const ERROR = FilePickerError.prototype.ERROR;

exports.createFile = createFile;

/**
 * Normaliza y obtiene el fichero
 * @method  createFile
 * @param   {object}         args Argumentos de Filepicker
 * @returns {object} file
 */
function createFile(args) {
  Ti.API.debug('createFile');

  let file = null;

  if (OS_IOS) {
    file = createFileForIOS(args);
  } else if (OS_ANDROID) {
    file = createFileForAndroid(args);
  }

  return file;
}

/**
 * Creación de fichero en iOS
 * @method createFileForIOS
 * @param {object} args
 * @returns {object} target
 */
function createFileForIOS(args) {
  let source = null;
  let target = null;

  try {
    //Lectura de fichero seleccionado
    source = Ti.Filesystem.getFile(args.uri);
  } catch (e) {
    throw new FilePickerError(ERROR.READ_SOURCE.CODE, ERROR.READ_SOURCE.MESSAGE);
  }

  Ti.API.debug('MAX SIZE', args.maxSize);
  if (source.size && source.size > args.maxSize) {
    throw new FilePickerError(ERROR.MAX_SIZE_REACHED.CODE, ERROR.MAX_SIZE_REACHED.MESSAGE);
  }

  //Si conseguimos leer el fichero seleccionado
  //Generación de directorio si no existe
  let folder = Ti.Filesystem.getFile(args.path);

  if (!folder.isDirectory() && !folder.createDirectory()) {
    throw new FilePickerError(ERROR.CREATE_FOLDER.CODE, ERROR.CREATE_FOLDER.MESSAGE);
  }

  //Vamos a cambiar el nombre del fichero target
  /*const regexp = /(.+)\.([^.]+)$/;
  const filenameParts = regexp.exec(source.name);*/

  target = Ti.Filesystem.getFile(folder.nativePath, normalizeFilename(source.name));

  folder = null;

  target.exists() && target.deleteFile();

  if (!source.copy(target.nativePath)) {
    source = null;
    target = null;
    throw new FilePickerError(ERROR.COPY_FILE.CODE, ERROR.COPY_FILE.MESSAGE);
  }

  /*if (Array.isArray(filenameParts)) {
    targetFilename = `${filenameParts[1]}_${Date.now()}.${filenameParts[2] || 'ext'}`;

    target = Ti.Filesystem.getFile(folder.nativePath, targetFilename);

    if (!source.copy(target.nativePath)) {
      throw new FilePickerError(ERROR.COPY_FILE.CODE, ERROR.COPY_FILE.MESSAGE);
    }
  }*/

  source = null;

  return target;
}

/**
 * Creación de fichero en iOS
 * @method createFileForAndroid
 * @param {object} args
 * @returns {object} target
 */
function createFileForAndroid(args) {
  let target = null;

  const uri = args.uri;
  const activity = args.activity;
  const path = args.path;

  try {
    const normalizedUri = normalizeUri({
      uri: uri,
      activity: activity
    });

    const sourceInfo = getSourceInfo({
      uri: normalizedUri,
      activity: activity
    });

    if (sourceInfo.size && sourceInfo.size > args.maxSize) {
      throw new FilePickerError(ERROR.MAX_SIZE_REACHED.CODE, ERROR.MAX_SIZE_REACHED.MESSAGE);
    }

    const folder = Ti.Filesystem.getFile(path);

    if (!folder.isDirectory() && !folder.createDirectory()) {
      throw new FilePickerError(ERROR.CREATE_FOLDER.CODE, ERROR.CREATE_FOLDER.MESSAGE);
    }

    target = streamToFile({
      uri: normalizedUri,
      path: path,
      activity: activity,
      filename: sourceInfo.name,
      size: sourceInfo.size
    });

  } catch (e) {
    Ti.API.debug('FILE NOT STREAMED');
    throw new FilePickerError(e.code, e.message);
  }

  return target;
}

/**
 * Devuelve el path del fichero
 * @method resolveUri
 * @param {object} args
 * @returns {string} normalizedUri
 */
function normalizeUri(args) {
  Ti.API.debug('FileHelper.normalizeUri');

  const Build = require('android.os.Build');
  const Activity = require('android.app.Activity');
  const Uri = require('android.net.Uri');
  const DocumentsContract = require('android.provider.DocumentsContract');

  //const Environment = require('android.os.Environment');
  //const MediaStore = require('android.provider.MediaStore');
  //const ContentUris = require('android.content.ContentUris');

  let normalizedUri = null;

  try {
    const uri = Uri.parse(args.uri);

    Ti.API.debug('FILE INFO FROM URI');
    Ti.API.debug('Authority', uri.getAuthority());
    Ti.API.debug('Fragment', uri.getFragment());
    Ti.API.debug('Port', uri.getPort());
    Ti.API.debug('Query', uri.getQuery());
    Ti.API.debug('Scheme', uri.getScheme());
    Ti.API.debug('Host', uri.getHost());
    Ti.API.debug('Segments', uri.getPathSegments().toString());

    const isKitKat = Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT;

    const activity = new Activity(args.activity);
    const context = activity.getApplicationContext();

    Ti.API.debug('PARSED URI', uri.toString());

    //A partir de KitKat o superior
    if (isKitKat && DocumentsContract.isDocumentUri(context, uri)) {
      Ti.API.debug('Kitkat o superior y se trata de una uri de tipo documento');
      if (isLocalStorageDocument(uri)) {
        //Local storage
        Ti.API.debug('LocalStorage');
        normalizedUri = uri;
      } else if (isExternalStorageDocument(uri)) {
        //External Storage
        Ti.API.debug('External Storage');
        normalizedUri = uri;
      } else if (isDownloadsDocument(uri)) {
        //DownloadsProvider
        Ti.API.debug('MediaDownloadProvider');
        normalizedUri = uri;
      } else if (isMediaDocument(uri)) {
        //MediaProvider
        Ti.API.debug('MediaProvider');
        normalizedUri = uri;
      } else {
        Ti.API.debug('Podría ser Google Drive');
        normalizedUri = uri;
      }
    } else if ('content'.indexOf(uri.getScheme()) !== -1) {
      Ti.API.debug('MediaStore General');
      //MediaStore (general)
      normalizedUri = uri;
    } else if ('file'.indexOf(uri.getScheme()) !== -1) {
      Ti.API.debug('Fichero');
      normalizedUri = uri;
    }
  } catch (e) {
    throw new FilePickerError(ERROR.NORMALIZE_URI.CODE, ERROR.NORMALIZE_URI.MESSAGE);
  }

  return normalizedUri;
}

/**
 * Obtiene el tamaño y el nombre del fichero origen
 * @method getSourceInfo
 * @param {object} args
 * @returns {object} sourceInfo
 */
function getSourceInfo(args) {
  Ti.API.debug('FilePicker.FileHelper.getSourceInfo');

  const OpenableColumns = require('android.provider.OpenableColumns');
  const Activity = require('android.app.Activity');

  const sourceInfo = {
    name: null,
    size: null
  };

  const activity = new Activity(args.activity);
  const uri = args.uri;

  let cursor = null;

  try {
    cursor = activity.getContentResolver().query(uri, null, null, null, null, null);

    if (cursor !== null && cursor.moveToFirst()) {

      sourceInfo.name = cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME));

      const sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE);

      if (sizeIndex) {
        sourceInfo.size = Number(cursor.getString(sizeIndex));
      }
    }
  } finally {
    cursor.close();
  }

  return sourceInfo;
}

/**
 * @method streamToFile
 * @param {object} args
 * @returns {string} sourcePath
 */
function streamToFile(args) {
  Ti.API.debug('FilePicker.FileHelper.streamToFile');

  const Activity = require('android.app.Activity');
  const FileOutputStream = require('java.io.FileOutputStream');
  const File = require('java.io.File');
  const ByteStreams = require('com.google.common.io.ByteStreams');

  const uri = args.uri;
  const path = args.path;
  const filename = normalizeFilename(args.filename);
  const size = args.size;

  const activity = new Activity(args.activity);

  let target = null;

  try {
    let rootDir = Ti.Filesystem.getFile(path).nativePath;

    rootDir = rootDir.substr('file://'.length, rootDir.length);

    const inputStream = activity.getContentResolver().openInputStream(uri);
    const targetFile = new File(rootDir, filename);
    const outputStream = new FileOutputStream(targetFile);
    const bytesCopied = ByteStreams.copy(inputStream, outputStream);

    inputStream.close();
    outputStream.close();

    if (bytesCopied !== size) {
      throw new FilePickerError(ERROR.FILE_CHECKSUM.CODE, ERROR.FILE_CHECKSUM.MESSAGE);
    }

    target = Ti.Filesystem.getFile(path, filename);

    /*const extension = target.extension();
    const mimeType = target.read().mimeType;

    const normalizedMimeType = Mime.type(extension);
    const normalizedExtension = Mime.extension(mimeType);

    if (!normalizedMimeType && normalizedExtension) {

    }

    if (normalizedMimeType) {
      const n
    }*/

  } catch (e) {
    throw new FilePickerError(e.code, e.message);
  }

  return target;
}

function isLocalStorageDocument(uri) {
  //TODO: Implementar local storage con fileprovider
  return false;
}

function isExternalStorageDocument(uri) {
  const authority = 'com.android.externalstorage.documents';
  return (authority === uri.getAuthority());
}

function isDownloadsDocument(uri) {
  const authority = 'com.android.providers.downloads.documents';
  return (authority === uri.getAuthority());
}

function isMediaDocument(uri) {
  const authority = 'com.android.providers.media.documents';
  return (authority === uri.getAuthority());
}

function isGooglePhotosUri(uri) {
  const authorityContent = 'com.google.android.apps.photos.content';
  const authorityContentProvider = 'com.google.android.apps.photos.contentprovider';
  const authority = uri.getAuthority();
  return (authorityContent === authority || authorityContentProvider === authority);
}

function normalizeFilename(filename) {
  //Obtenemos un arrays de partes si existe extesión
  const REGEXP_EXTENSION = /(.+)\.([^.]+)$/;
  const REGEXP_NON_ALPHA = /[\W_]+/g;

  //Asumimos que no tiene extensión reemplazamos todos los caracteres extraños.
  let normalizedFilename = filename.replace(REGEXP_NON_ALPHA, '_');

  const parts = REGEXP_EXTENSION.exec(filename);

  //Si tenemos extensión preparamos nombre de fichero
  if (parts) {
    //Aplicamos sustitución en nombre de fichero y concatenamos extensión
    const extension = parts[2].replace(REGEXP_NON_ALPHA, '_');

    //Buscamos el mime type de esta extensión
    const mimeType = Mime.type(extension);

    //Si existe, la utilizamos
    if (!mimeType) {
      throw new FilePickerError(ERROR.NO_EXTENSION.CODE, ERROR.NO_EXTENSION.MESSAGE);
    }

    normalizedFilename = [parts[1].replace(REGEXP_NON_ALPHA, '_'), extension].join('.');
  }

  return normalizedFilename;
}
