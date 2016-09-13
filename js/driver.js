var bluetoothDevice;
var colorCharacteristic;

// Static values


var bytesWithHeader = [
	0xBA, // Static header
    0xBA, // Static header
    0xAA, // Static header
    0xAA // Static header
]; // Blue

var cUpdateColor = 0x03

var byteColor = [0xBA, // Static header
    0xBA, // Static header
    0x03, // len
    0xFF, // Red
    0xFF, // Green
    0xFF]; // Blue



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
    colorCharacteristic = characteristic;
    // Notification start
    /*return characteristic.startNotifications().then(_ => {
      characteristic.addEventListener('characteristicvaluechanged', characteristicValueChanged);
    });*/
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
    //colorCharacteristic.stopNotifications().then(_ => {colorCharacteristic
       if(colorCharacteristic) colorCharacteristic.removeEventListener('characteristicvaluechanged', characteristicValueChanged);
      bluetoothDevice.gatt.disconnect();
      document.getElementById("connectBtn").onclick=function(){connect()};
    //});
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
  colorCharacteristic.writeValue(dataToSend(bytesWithHeader, cUpdateColor, [document.getElementById("red").value, document.getElementById("green").value, document.getElementById("blue").value]))
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

function dataToSend(headerBytes, commandByte, byteValue) {
  var buf = new ArrayBuffer(headerBytes.length + 1 + byteValue.length);
  var bufView = new Uint8Array(buf);
  var idx = 0;
  // Gestion de l'inversion par paire des bytes
  
  for (let i = 0; i < headerBytes.length; i+=1) {
    bufView[idx++] = headerBytes[i];
  }
  
  bufView[idx++] = commandByte;

  // Gestion de l'inversion par paire des bytes
  for (let i = 0; i < byteValue.length; i+=1) {
    bufView[idx++] = byteArray[i];
  }
  return buf;
}

function characteristicValueChanged(e) {
  console.log("characteristicvaluechanged :", characteristicvaluechanged);
};
