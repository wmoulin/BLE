var bluetoothDevice;
var colorCharacteristic;

// Static values
var buf = new ArrayBuffer(16);
var bufView = new Uint16Array(buf);

var byte0 = 0xff, // Static header
    byte1 = 0x55, // Static header
    byte2 = 0x09, // len
    byte3 = 0x00, // idx
    byte4 = 0x02, // action
    byte5 = 0x0a, // device
    byte6 = 0x09, // port
    byte7 = 0x64; // slot
//dynamics values
var byte8 = 0x00, // data
    byte9 = 0x00, // data
    byte10 = 0x00, // data
    byte11 = 0x00; // data
//End of message
var byte12 = 0x0a,
    byte13 = 0x00,
    byte14 = 0x00,
    byte15 = 0x00;

// Gestion de l'inversion par paire des bytes
bufView[0] = byte1 << 8 | byte0;
bufView[1] = byte3 << 8 | byte2;
bufView[2] = byte5 << 8 | byte4;
bufView[3] = byte7 << 8 | byte6;
bufView[4] = byte9 << 8 | byte8;
bufView[5] = byte11 << 8 | byte10;
bufView[6] = byte13 << 8 | byte12;
bufView[7] = byte15 << 8 | byte14;

function onTouchEnd() {
  console.log("touchend");
}

function onTouchStart() {
  console.log("touchstart");
}

function connect() {
  console.log("connexion");
  navigator.bluetooth.requestDevice({
    filters: [{
      name: 'LEO'
    }],
    "optionalServices": [parseInt("0xBABA")]
  })
  .then(device => {
    console.log("try connect");
	  bluetoothDevice = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  })
  .then(server => server.getPrimaryService(parseInt("0xBABA")))
  .then(service => service.getCharacteristic(parseInt("0xAAAA")))
  .then(characteristic => {characteristic.writeValue(buf)

  /*.then(characteristic => {
    let decoder = new TextDecoder('utf-8');
    return characteristic.readValue().then(value => {
      console.log("characteristic value :", value);
	    console.log("characteristic value :", decoder.decode(value));
	  });*/

    // Writing 1 is the signal to reset energy expended.
    //var newColor = new Uint8Array([1]);
    //return characteristic.writeValue(newColor);
  }).then(_ => {document.getElementById("connectBtn").onclick=function(){disconnect()};})
  /*.then(_ => {
    console.log('Energy expended has been reset.');
  })*/
  .catch(error => { console.log(error); });
}


function disconnect() {
  if (!bluetoothDevice) {
    return;
  }

  if (bluetoothDevice.gatt.connected) {
    console.log('Deconnexion');
    bluetoothDevice.gatt.disconnect();
    document.getElementById("connectBtn").onclick=function(){connect()};
  } else {
    console.log('Bluetooth Device is already disconnected');
  }
}

function onDisconnected(event) {
  let device = event.target;
  bluetoothDevice = undefined;
  colorCharacteristic = undefined;
  console.log('Device ' + device.name + ' is disconnected.');
}

function colorChange(value) {
  var newColor = hexValue(document.getElementById("red").value) + hexValue(document.getElementById("green").value) + hexValue(document.getElementById("blue").value);
  console.log('newColor :', newColor);
  document.getElementById("apercu").style.backgroundColor = "#" + newColor;
}

function hexValue(value) {
  return ("0"+(Number(value).toString(16))).slice(-2).toUpperCase();
}

function sendColor() {
  console.log("connexion");
  navigator.bluetooth.requestDevice({
    filters: [{
      name: 'LEO',
	    services: [parseInt("0xBABA")]
    }]
  })
  .then(device => {
    console.log("try connect");
    device.addEventListener('gattserverdisconnected', onDisconnected);
    device.gatt.connect();})
  .then(server => { console.log("connect"); })
  .then(server => server.getPrimaryService(parseInt("0xBABA")))
  .then(service => service.getCharacteristic(parseInt("0xaaaa")))
  .then(characteristic => {
    let decoder = new TextDecoder('utf-8');
	  colorCharacteristic = characteristic;
	  return characteristic.readValue().then(value => {
	    console.log("characteristic value :", decoder.decode(value));
	  });

    // Writing 1 is the signal to reset energy expended.
    //var newColor = new Uint8Array([1]);
    //return characteristic.writeValue(newColor);
  }).then(_ => {document.getElementById("connectBtn");})
  /*.then(_ => {
    console.log('Energy expended has been reset.');
  })*/
  .catch(error => { console.log(error); });

}

function initServiceColor() {
  console.log("connexion");
  isDeviceinit();
  device.gatt.connect()
  .then(server => server.getPrimaryService(parseInt("0xBABA")))
  .then(service => service.getCharacteristic(parseInt("0xaaaa")))
  .then(characteristic => {
    colorCharacteristic = characteristic;
  })
  .catch(error => { console.log(error); });

}


function readColor() {
  let decoder = new TextDecoder('utf-8');
  return characteristic.readValue().then(value => {
	console.log("characteristic value :", decoder.decode(value));
  }).catch(error => { console.log(error); });

}

function isDeviceinit() {
  if (!bluetoothDevice) {
    throw new Error("Bluetooth device not initialize !");
  }
}
