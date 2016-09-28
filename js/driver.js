var bluetoothDevice = new BluetoothDevice("LEO", onDisconnected);
bluetoothDevice.addService("sCommand", "0000ffe0-0000-1000-8000-00805f9b34fb");
bluetoothDevice.addCharacteristic("sCommand", "cCommand", "0000ffe1-0000-1000-8000-00805f9b34fb");
var colorCharacteristic;

var cUpdateColor = new Command(0x03);
var cDirection = new Command(0x02);


function connect() {
  console.log("connexion");
	bluetoothDevice.connect()
	.then(() => {
		return bluetoothDevice.getService("sCommand");
	})
	.then((bluetoothService) => {
		return bluetoothService.getCharacteristic("cCommand");
	})
	.then(() => {
		document.getElementById("connectBtn").onclick=function(){disconnect()};
	})
  .catch(error => { console.log(error); });
}


function disconnect() {
  if (!bluetoothDevice) {
    return;
  }

	bluetoothDevice.disconnect();
}

function onDisconnected() {
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
	bluetoothDevice.getService("sCommand")
	.then((service) => {
		return service.getCharacteristic("cCommand");
	})
	.then((characteristic) => {
		return characteristic.write(cUpdateColor.dataToSend([document.getElementById("red").value, document.getElementById("green").value, document.getElementById("blue").value]));
	})
  .then( () => {
    console.log('New color send.');
  })
  .catch(error => { console.log(error); });

}


class BluetoothDevice {

	constructor(name, disconnectFct) {
		this.name = name;
		this.services = {};
		this.device = undefined;
		this.server = undefined;
		this.disconnectFct = disconnectFct;
	}

	void addService(id, uuid) {
		this.services[id] = new BluetoothService(uuid);
	}

	void addCharacteristic(id, id, uuid) {
		if (!this.services[id]) {
			throw new Error("Service id unknowned :" + id);
		}
		this.services[id].characteristics[id] = new BluetoothCharacteristic(uuid);
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
			throw new Error("Service id unknowned :" + id);
		}
		if (!this.server) {
			throw new Error("Server GATT not initialized.");
		}
		if (this.services[id].service) {
			return Promise.resolve(this.services[id].service);
		} else {
			return this.connect().then(server => {
			  return this.server.getPrimaryService(this.services[id].uuid)
		  })
			.then((service) => {
				this.services[id].service = service;
				return this.services[id];
			});
		}
	}

	void onDisconnected() {
		this.server = undefined;
		for(serviceId in this.services) {
			let serv = this.services[serviceId];
			delete serv.service;
			for(characteristicId in serv.characteristics) {
				let charact = serv.characteristics[characteristicId];
				delete charact.characteristic;
			}
		}

		if (this.disconnectFct) {
			this.disconnectFct();
		}
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

	void addCharacteristic(id, uuid) {
		this.characteristics[id] = new BluetoothCharacteristic(uuid);
	}


	Promise getCharacteristic(id) {
		if (!this.characteristics[id]) {
			throw new Error("Characteristic id unknowned :" + id);
		}
		if (!this.service) {
			throw new Error("Service not initialized.");
		}
		if (this.characteristics[id].characteristic) {
			return Promise.resolve(this.characteristics[id].characteristic);
		} else {
			return this.service.getCharacteristic(this.characteristics[id].uuid)
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
		this.characteristic = undefined;
	}

	Promise write(arrayBuffer) {
		if (!this.characteristic) {
			throw new Error("Characteristic not initialized, use getCharacteristic on service.");
		}
		return this.characteristic.writeValue(arrayBuffer);
	}
}

class Command{
	constructor(code) {
		this.codeByte = code;
		this.headerBytes = [0xBA, 0xBA, 0xAA, 0xAA ];
	}

	ArrayBuffer dataToSend(bytesValue) {
	  var buf = new ArrayBuffer(this.headerBytes.length + 1 + byteValue.length);
	  var bufView = new Uint8Array(buf);
	  var idx = 0;
	  // Gestion de l'inversion par paire des bytes

	  for (let i = 0; i < this.headerBytes.length; i+=1) {
	    bufView[idx++] = headerBytes[i];
	  }

	  bufView[idx++] = this.codeByte;

	  // Gestion de l'inversion par paire des bytes
	  for (let i = 0; i < bytesValue.length; i+=1) {
	    bufView[idx++] = bytesValue[i];
	  }
	  return buf;
	}
}
