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
    }]
  })
  .then(device => {
    console.log("try connect");
    device.addEventListener('gattserverdisconnected', onDisconnected);
    device.gatt.connect();})
  .then(server => { console.log("connect"); })
  .then(server => server.getPrimaryService('led'))
  .then(service => service.getCharacteristic('color'))
  .then(characteristic => {
    // Writing 1 is the signal to reset energy expended.
    var newColor = new Uint8Array([1]);
    return characteristic.writeValue(newColor);
  })
  .then(_ => {
    console.log('Energy expended has been reset.');
  })
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
  console.log('Device ' + device.name + ' is disconnected.');
}
