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
      name: 'LEO',
      services: ["0000ffe0-0000-1000-8000-00805f9b34fb"]
    }]

  })
  .then(device => {
    console.log("try connect");
	  bluetoothDevice = device;
    device.addEventListener('gattserverdisconnected', onDisconnected);
    return device.gatt.connect();
  })
  .then(server => {
	  document.getElementById("connectBtn").style.backgroundColor = "#0687E6";
	  return server.getPrimaryService("0000ffe0-0000-1000-8000-00805f9b34fb")
  })
  .then(service => service.getCharacteristic("0000ffe1-0000-1000-8000-00805f9b34fb"))
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

class BluetoothDevice{

	constructor(name) {
		this.name = name;
		this.services = {};
		this.device = undefined;
		this.server = undefined;
	}

	void addService(id, uuid) {
		this.services[id] = new BluetoothService(uuid);
	}

	Promise getDevice() {

		if (this.device) {
			return Promise.resolve(this.device);
		} else {

			let filters = [{
				name: this.name
			}];

			if (this.services && this.services.length > 0) {
				filters[0].services = [];
				Object.keys(this.services).forEach((key) => {
		    	filters[0].services.push(this.services[key].uuid)
				});
			}

			return navigator.bluetooth.requestDevice({filters})
		  .then(device => {
		    console.log("device trouve");
			  this.device = device;
		    device.addEventListener('gattserverdisconnected', this.onDisconnected);
		    return device;
		  })
		}

	}

	Promise connect() {
		if (this.server) {
			return Promise.resolve(this.server);
		} else {
			return this.getDevice.then((device) => {
				return device.gatt.connect();
			}).then((server) => {
				this.server = server;
				return server;
			});
		}
	}

	Promise getService(id) {
		if (!this.services[id]) {
			console.error("Service id unknowned :" + id);
		}

		if (this.services[id].service) {
			return Promise.resolve(this.services[id].service);
		} else {
			return this.connect().then(server => {
			  return server.getPrimaryService(this.services[id].uuid)
		  })
			.then((service) => {
				this.services[id].service = service;
				return service;
			});
		}
	}

	void onDisconnected() {
		this.server = undefined;
		this.services = {};
	  console.log('Device ' + device.name + ' is disconnected.');
	}

	void disconnect() {
	  if (!this.device) {
	    return;
	  }

	  if (this.device.gatt.connected) {
	    console.log('Disconnect');
	    //TODO if(colorCharacteristic) colorCharacteristic.removeEventListener('characteristicvaluechanged', characteristicValueChanged);
	    this.device.gatt.disconnect();
	    //});
	  } else {
	    console.log('Bluetooth Device is already disconnected');
	  }
	}
}

class BluetoothService {
	constructor(uuid) {
		this.uuid = name;
		this.characteristics = {};
		this.service = undefined;
	}

	void addCharacteristic(uuid) {
		this.characteristics[id] = new BluetoothCharacteristic(uuid);
	}


	Promise getCharacteristic(id) {
		if (!this.characteristics[id]) {
			console.error("Characteristic id unknowned :" + id);
		}

		if (this.characteristics[id].characteristic) {
			return Promise.resolve(this.characteristics[id].characteristic);
		} else {
			return service.getCharacteristic(this.characteristics[id].uuid)
			.then((characteristic) => {
				this.characteristics[id].characteristic = characteristic;
				return characteristic;
			});
		}
	}

}

class BluetoothCharacteristic{
	constructor(uuid) {
		this.uuid = uuid;
	}
}

class Command{
	constructor(code) {
		this.codeByte = code;
		this.headerBytes = [0xBA, 0xBA, 0xAA, 0xAA ];
	}

	ArrayBuffer dataToSend(byteValue) {
	  var buf = new ArrayBuffer(this.headerBytes.length + 1 + byteValue.length);
	  var bufView = new Uint8Array(buf);
	  var idx = 0;
	  // Gestion de l'inversion par paire des bytes

	  for (let i = 0; i < this.headerBytes.length; i+=1) {
	    bufView[idx++] = headerBytes[i];
	  }

	  bufView[idx++] = this.codeByte;

	  // Gestion de l'inversion par paire des bytes
	  for (let i = 0; i < byteValue.length; i+=1) {
	    bufView[idx++] = byteValue[i];
	  }
	  return buf;
	}
}
