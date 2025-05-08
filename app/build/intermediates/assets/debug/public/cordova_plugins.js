
  cordova.define('cordova/plugin_list', function(require, exports, module) {
    module.exports = [
      {
          "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
          "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
          "pluginId": "phonegap-plugin-barcodescanner",
        "clobbers": [
          "cordova.plugins.barcodeScanner"
        ]
        },
      {
          "id": "cordova-pdf-generator.pdf",
          "file": "plugins/cordova-pdf-generator/www/pdf.js",
          "pluginId": "cordova-pdf-generator",
        "clobbers": [
          "cordova.plugins.pdf",
          "pugin.pdf",
          "pdf"
        ]
        },
      {
          "id": "cordova-plugin-bluetooth-serial.bluetoothSerial",
          "file": "plugins/cordova-plugin-bluetooth-serial/www/bluetoothSerial.js",
          "pluginId": "cordova-plugin-bluetooth-serial",
        "clobbers": [
          "window.bluetoothSerial"
        ]
        }
    ];
    module.exports.metadata =
    // TOP OF METADATA
    {
      "cordova-pdf-generator": "2.1.1",
      "cordova-plugin-bluetooth-serial": "0.4.7",
      "phonegap-plugin-barcodescanner": "8.1.0"
    };
    // BOTTOM OF METADATA
    });
    