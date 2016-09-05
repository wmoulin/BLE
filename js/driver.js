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
      name: 'leo'
    }]
  })
  .then(device => { console.log("connect"); })
  .catch(error => { console.log(error); });
}
