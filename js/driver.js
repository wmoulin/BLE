// ADR E1:D3:90:5B:F9:2C
// Service UUID 6e400001-b5a3-f393-e0a9-e50e24dcca9e
// Characteristic Tx UUID 6e400003-b5a3-f393-e0a9-e50e24dcca9e (notify)
// Characteristic Rx UUID 6e400002-b5a3-f393-e0a9-e50e24dcca9e (write)

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
    "optionalServices": ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"]
  })
  .then(device => {
    console.log("try connect");
	  bluetoothDevice = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  })
  .then(server => {
		console.log("connect ok");
		console.log("try get service");
	  document.getElementById("connectBtn").style.backgroundColor = "#0687E6";
	  return server.getPrimaryService("6e400001-b5a3-f393-e0a9-e50e24dcca9e")
  })
  .then((service) => {
		console.log("service ok");
		console.log("try get characteristic");
		return service.getCharacteristic("6e400002-b5a3-f393-e0a9-e50e24dcca9e");
	})
  .then((characteristic) => {
		console.log("characteristic ok : " + characteristic);
		console.log("try get characteristic value");
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
    //});
  } else {
    console.log('Bluetooth Device is already disconnected');
  }
}

function onDisconnected(event) {
  let device = event.target;
  bluetoothDevice = undefined;
  colorCharacteristic = undefined;
  document.getElementById("connectBtn").style.backgroundColor = "red";
  document.getElementById("connectBtn").onclick=function(){connect()};
  console.log('Device ' + device.name + ' is disconnected.');
}

function colorChange(value) {
  let hexRedColor = hexValue(document.getElementById("red").value);
  let hexGreenColor = hexValue(document.getElementById("green").value);
  let hexBlueColor = hexValue(document.getElementById("blue").value);
  let newColor = hexRedColor + hexGreenColor + hexBlueColor;
  console.log('newColor :', newColor);
  document.getElementById("apercu").style.backgroundColor = "#" + newColor;
  document.getElementById("redValue").innerText = "0x" + hexRedColor;
  document.getElementById("greenValue").innerText = "0x" + hexGreenColor;
  document.getElementById("blueValue").innerText = "0x" + hexBlueColor;
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
    bufView[idx++] = byteValue[i];
  }
  return buf;
}

function characteristicValueChanged(e) {
  console.log("characteristicvaluechanged :", characteristicvaluechanged);
};


class Command{
	constructor(code) {
		this.code = code;
		this.headerBytes = [0xBA, 0xBA, 0xAA, 0xAA ];
	}
}
