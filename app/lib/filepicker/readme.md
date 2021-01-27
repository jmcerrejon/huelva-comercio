# Filepicker

Librería que permite la selección de cualquier fichero dentro del dispositivo

## Dependencias

En Android debemos incluir la librería Guava.

### SDK 9.X

Las librerías se incluyen utilizando el fichero de configuración de Gradle.

`app/platform/android/build.gradle`

```gradle

android {
    compileSdkVersion 29
    buildToolsVersion "29.0.3"

    defaultConfig {
        minSdkVersion 19
        targetSdkVersion 29
        versionCode 35
        versionName "1.4.0"
    }

    dependencies {
      implementation "com.google.guava:guava:29.0-android"
    }
}
```

### SDK 8.X

Incluiremos la librería Guava en formato JAR para versiones de SDK anteriores al API 29

[Descarga Guava 28.2](https://repo1.maven.org/maven2/com/google/guava/guava/28.2-android/)

`app/platform/android/guava-28.2-android.jar`

## Uso

```javascript
//Tamaño máximo expresado en byes: 10MB
const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

const Filepicker = require('filepicker');

Filepicker.pick({
  //Actividad actual
  activity: OS_ANDROID ? Ti.Android.currentActivity : null,
  //Directorio donde almacenar el fichero obtenido
  path: Ti.Filesystem.tempDirectory,
  //Tamaño máximo de fichero
  maxSize: MAX_ATTACHMENT_SIZE,
  //Callbacks de éxito y fracaso
  success: (e) => {
    //Ti.File
    const file = e.file;
  },
  error: (error) => {
    const FILEPICKER_ERROR = {
      COPY_FILE: -4,
      READ_SOURCE: -5,
      MAX_SIZE_REACHED: -7
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
  sourceView: $.anchorView
});

```

## Licencia

[MIT](http://vjpr.mit-license.org/)
