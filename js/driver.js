var bluetoothDevice;
var colorCharacteristic;

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
      name: 'LEO',
	    services: ["0xBABA"]
    }]
  })
  .then(device => {
    console.log("try connect");
	bluetoothDevice = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    device.gatt.connect();})
  .then(server => { console.log("connect"); })
  .then(server => server.getPrimaryService(parseInt("0xBABA")))
  .then(service => service.getCharacteristic(parseInt("0xaaaa")))
  .then(characteristic => {
    let decoder = new TextDecoder('utf-8');
	return characteristic.readValue().then(value => {
	  console.log("characteristic value :", decoder.decode(value));
	});

    // Writing 1 is the signal to reset energy expended.
    //var newColor = new Uint8Array([1]);
    //return characteristic.writeValue(newColor);
  })
  /*.then(_ => {
    console.log('Energy expended has been reset.');
  })*/
  .catch(error => { console.log(error); });
}


function disconnect() {
  if (!bluetoothDevice) {
    return;
  }
  log('Deconnexion');
  if (bluetoothDevice.gatt.connected) {
    bluetoothDevice.gatt.disconnect();
  } else {
    log('> Bluetooth Device is already disconnected');
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
  })
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
