var bluetoothDevice;
var urlCharacteristic;
var primaryUUID = "ee0c2080-8786-40ba-ab96-99b91ac981d8";
var characteristicUUID = "ee0c2084-8786-40ba-ab96-99b91ac981d8";

// Static values
//0x77, 0x06D, 0x6F, 0x75, 0x6C, 0x69, 0x6E, 0x2E, 0x67, 0x69, 0x74, 0x68, 0x75, 0x62, 0x2E, 0x69, 0x6F, 0x2F, 0x42, 0x4C, 0x450 0x2F 

var bytesURL = [
	0x02, // https://
  0x77, //w
	0x6D, //m
	0x6F, //o
	0x75, //u
	0x6C, //l
	0x69, //i
	0x6E, //n
	0x2E, //.
	0x67, //g
	0x69, //i
	0x74, //t
	0x68, //h
	0x75, //u
	0x62, //b
	0x2E, //.
	0x69, //i
	0x6F, //o
	0x2F, // /
	0x42, //B
	0x4C, //L
	0x45 //E
]; // Blue

function connect() {
  console.log("connexion");
  navigator.bluetooth.requestDevice({
    filters: [{
      name: 'IBKS105'
    }],
    "optionalServices": [primaryUUID]
  })
  .then(device => {
    console.log("try connect");
	  bluetoothDevice = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  })
  .then(server => {
	  document.getElementById("connectBtn").style.backgroundColor = "#0687E6";
	  return server.getPrimaryService(primaryUUID)
  })
  .then(service => service.getCharacteristic(characteristicUUID))
  .then(characteristic => {
    urlCharacteristic = characteristic;
    let decoder = new TextDecoder('utf-8');
    return characteristic.readValue().then(value => {
      console.log("characteristic value :", value);
	  console.log("characteristic value :", decoder.decode(value));
	  document.getElementById("apercu").innerText = decoder.decode(value);
	});
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
