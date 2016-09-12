var bluetoothDevice;
var colorCharacteristic;

// Static values


var byteTest= [0xBA, // Static header
    0xBA, // Static header
    0x03, // len
    0x00, // Red
    0x00, // Green
    0x00]; // Blue



// Gestion de l'inversion par paire des bytes

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
    .then(characteristic => {
    let decoder = new TextDecoder('utf-8');
    return characteristic.readValue().then(value => {
      console.log("characteristic value :", value);
	    console.log("characteristic value :", decoder.decode(value));
	  });

    // Writing 1 is the signal to reset energy expended.
    //var newColor = new Uint8Array([1]);
    //return characteristic.writeValue(newColor);
  }).then(_ => {document.getElementById("connectBtn").onclick=function(){disconnect()};})
  .catch(error => { console.log(error); });
}


function disconnect() {
  if (!bluetoothDevice) {
    return;
  }

  if (bluetoothDevice.gatt.connected) {
    console.log('Deconnexion');
    colorCharacteristic.stopNotifications().then(_ => {
      colorCharacteristic.removeEventListener('characteristicvaluechanged', callback);
      bluetoothDevice.gatt.disconnect();
      document.getElementById("connectBtn").onclick=function(){connect()};
    });
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
  characteristic.writeValue(inverseByte(byteTest))
  .then( () => {
    console.log('New color send.');
  })
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

function inverseByte(byteArray) {
  var buf = new ArrayBuffer(byteArray.length);
  var bufView = new Uint16Array(buf);
  // Gestion de l'inversion par paire des bytes
  for (let i = 0; i < byteArray.length; i+2) {
    bufView[0] = byteArray[i+1] << 8 | byteArray[i];
  }
  return buf;
}
