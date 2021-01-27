const EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
const [Extensions, Types] = prepareMimeData();


function prepareMimeData() {
  const mimedb = require('./mime_db.json');

  const extensions = {};
  const types = {};

  Object.keys(mimedb).forEach((type) => {
    const mime = mimedb[type];
    const exts = mime.extensions;

    //Si no hay extensiones lo ignoramos
    if (!exts || !exts.length) {
      return;
    }

    // mime -> extensions
    extensions[type] = exts;

    // extension -> mime
    exts.forEach((extension) => {
      types[extension] = type;
    });
  });

  return [extensions, types];
}

module.exports = {
  extension: function (type = null) {
    if (!type || typeof type !== 'string') {
      return false;
    }

    const match = EXTRACT_TYPE_REGEXP.exec(type);

    const exts = match && Extensions[match[1].toLowerCase()];

    if (!exts || !exts.length) {
      return false;
    }

    return exts[0];
  },
  type: function (ext = null) {
    if (!ext || typeof ext !== 'string') {
      return false;
    }

    return Types[ext] || null;
  }
};
