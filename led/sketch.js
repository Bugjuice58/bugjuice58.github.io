/////////// TO-DO
///////Frontend
// Improve UI for end user
// Fix cycle mode issues: color only collected on start; color fades to white, not black (maybe do a method that lets yofu do both?)
// Organize Presets
////////Backend
// Deal with 2-Digit Hex Overflows (as to not get disconnected from lightbulb)

let weatherAPIKEY = '';

let rh = 0;
let gs = 0;
let bl = 0.3;
let rMax = 255;
let gMax = 255;
let bMax = 255;
let rhHex = 0;
let gsHex = 0;
let blHex = 0;
let maxCycle = 255;
let cycleNumber = 0;
let mode = 'preset7';
let power = false;
let timer = 0;
let currentColorMode = 'hsl';
let connected = false;
let disconnectedFade = "+";
let connectedFade = "+";
let devMode = true;
let speed = 5;
let cycleStatus = '-';
let sendR = 0;
let sendG = 0;
let sendB = 0;
let presetList = ['0: Red Alert', '1: Purple', '2: Cyan', '3: Red', '4: Green', '5: Blue', '6: Yellow','7: Color Cycle','8: Ultimate Color Cycle','9: Connection Search Fade','-: Caramelldansen','+: Pick Color','Law Enforcement','Day - Night Synchronization'];
let preset0Set = '+';
let preset0 = 0;
let secondTimer = 0;
let bluetoothSendRate = 75;
let Caramelldansen = false;
let TIME = 0
let prevMillis = 0
let copColor ='red'
let nightRGB;
let dayRGB;

let lerpDayNight = [0,0,0]

function setup() {
    nightRGB = color(0,0,75) 
    dayRGB = color(92,252,255)
  noCanvas();
  var presetListSetup = 0
  while (presetListSetup < presetList.length) {
    createDiv(`<button id="${presetList[presetListSetup]}" onclick="setPresetMode(${presetListSetup});">${presetList[presetListSetup]}</button>`)
    presetListSetup++
  }
}

function devLoop() {
  if (!connected) {
    currentColorMode = 'hsl'
    document.querySelector('#status').textContent = `Looking For Connection, Please Try Refreshing if the Issue Persists.`
    rh = 180
    gs = 1
    if (disconnectedFade === "+") {
      bl += 0.002
    } else {
      bl -= 0.002
    }
    if (bl >= 0.5 && disconnectedFade === "+") {
      disconnectedFade = "-"
    } else {
      if (bl <= 0.3 && disconnectedFade === "-") {
        disconnectedFade = "+"
      }
    }
  } else {
    document.querySelector('#status').textContent = `Connected Device(s) ID: browserTest`
  }
  bl = round(bl, 4)
}

function draw() {
  if (currentColorMode === 'rgb') {
    sendR = rh
    sendG = gs
    sendB = bl
  } else {
    sendR = hslToRgb(rh,gs,bl)[0]
    sendG = hslToRgb(rh,gs,bl)[1]
    sendB = hslToRgb(rh,gs,bl)[2]
  }
  if (sendR > 255) {
  sendR = 255    
  }
  if (sendG > 255) {
  sendG = 255    
  }
  if (sendB > 255) {
  sendB = 255    
  }
  onWriteButtonClick();
  if (document.querySelector('#writeButton').disabled) {
    document.querySelector("#bluetoothActivate").style.display = 'block';
    document.querySelector("#technicalStatus").style.bottom = '75px';
  }
  
  if (currentColorMode === 'rgb') {
    rhHex = rh.toString(16)
    gsHex = gs.toString(16)
    blHex = bl.toString(16)
  } else {
    rhHex = hslToRgb(rh,gs,bl)[0].toString(16)
    gsHex = hslToRgb(rh,gs,bl)[1].toString(16)
    blHex = hslToRgb(rh,gs,bl)[2].toString(16)
  }
  if (rhHex === '0') {
    rhHex = '00'
  }
  if (gsHex === '0') {
    gsHex = '00'
  }
  if (blHex === '0') {
    blHex = '00'
  } 
  presetLoop();
  if (mode === 'preset7' && currentColorMode === 'hsl') {
    document.querySelector("#rgbColorPicker").style.display = 'none'
  } else {
    document.querySelector("#rgbColorPicker").style.display = 'inline'
  }
  document.querySelector("#technicalStatus").textContent = `This web app looks for Bluetooth Lightbulbs with the characteristic FFE5 with the service FFE9 and then writes [56,${rhHex},${gsHex},${blHex},00,f0,aa] in hex. If need be, this may be changed in the future. If you notice the changerate of the lightbulb to be slower than expected (very choppy), then refresh the page.`
  document.querySelector("#cycle").textContent = `Cycle Mode: Current Mode = ${mode}`
  bl = round(bl, 4)
  devLoop();
  if (currentColorMode === 'hsl') {
    document.querySelector("#colorExample").style.background = `${currentColorMode}(${rh},${gs*100}%,${round(bl*100,1)}%)`
    document.querySelector("#mode").textContent = `${currentColorMode}(${rh},${gs*100}%,${round(bl*100)}%)`
  } else {
    if (currentColorMode === 'rgb') {
      document.querySelector("#colorExample").style.background = `${currentColorMode}(${rh},${gs},${bl})`
      document.querySelector("#mode").textContent = `${currentColorMode}(${rh},${gs},${bl})`
    }
  }
  if (!power) {
    off();
    document.querySelector("#power").textContent = 'Power On'
    document.querySelector("#power").style.color = 'red'
  } else {
    rgbCycle();
    document.querySelector("#power").textContent = 'Power Off'
    document.querySelector("#power").style.color = 'green'
  }
}

function off() {
  if (connected) {
    rh = 0;
    gs = 0;
    bl = 0;
  }
}

function powerCycle() {
  if (power) {
    power = false
  } else {
    power = true
  }
}

function hslToRgb(h,s,l) {
  let c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs((h / 60) % 2 - 1)),
      m = l - c/2,
      r = 0,
      g = 0,
      b = 0;
    if (0 <= h && h < 60) {
    r = c; g = x; b = 0;  
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return([r,g,b]);
}

function rgbCycle() {
  if (currentColorMode === 'rgb' && mode === 'fade') {
    rh = timer
    gs = timer
    bl = timer
    if (h > 256) {
      connectedFade = "-"
      timer = 255
    } else {
      if (h < 0) {
        connectedFade = "+"
        timer = 1
      }
    }
    if (connectedFade === "+") {
      timer++
    } else {
      if (connectedFade === "-")
        timer--
    }
  }
  if (currentColorMode === 'hsl' && mode === 'preset7') {
    rh = timer
    gs = 1
    bl = 0.5
    if (timer < 361) {
      timer++
    } else {
      timer = 0
    }
  }
  if (currentColorMode === 'rgb' && (mode === 'solid' || mode === 'fade')) {
    var colorValue = document.querySelector("#rgbColorPicker").value
    var splitColorValue = colorValue.split("");
    rh = parseInt(splitColorValue[1] + splitColorValue[2], 16);
    gs = parseInt(splitColorValue[3] + splitColorValue[4], 16);
    bl = parseInt(splitColorValue[5] + splitColorValue[6], 16);
  }
  if (currentColorMode === 'rgb' && mode === 'preset7') {
    rh = round(rh, 3)
    gs = round(gs, 3)
    if (cycleStatus === '-') {
      rh -= rMax / maxCycle
      gs -= gMax / maxCycle
      bl -= bMax / maxCycle
      cycleNumber--
    }
    if (cycleStatus === '+') {
      rh += rMax / maxCycle
      gs += gMax / maxCycle
      bl += bMax / maxCycle
      cycleNumber++
    }
    if (cycleNumber >= maxCycle) {
      cycleStatus = '-'
    } else {
      if (cycleNumber <= 0) {
        cycleStatus = '+'
      }
    }
  }
}

function modeCycle() { // Remove mode = 'preset7' after other sequences are programmed in.
  if (currentColorMode === 'rgb') {
    currentColorMode = 'hsl'
    mode = 'preset7'
  } else {
    if (currentColorMode === 'hsl') {
      currentColorMode = 'rgb'
    }
  }
}


function keyPressed() {
  if (key === 'd' && devMode) {
    devMode = false
  } else {
    if (key === 'd') {
      devMode = true
    }
  }
}

function bluetoothButtonPressed() { // During Merge, make bluetooth connection sensing a thing and dynamically show and remove button as needed.
  document.querySelector("#bluetoothActivate").style.display = 'none';
  document.querySelector("#technicalStatus").style.bottom = "0px"
  onReadButtonClick();
}

function cycleMode() {
if (mode === 'fade') {
      mode = 'solid'
    } else {
      if (mode === 'solid') {
        mode = 'fade'
      }
    }
if (mode != 'fade' && mode != 'solid') {
  mode = 'fade'
}
}

function setPresetMode(x) {
    mode = `preset${x}`
  if (mode === 'preset7' || mode === 'preset8' || mode === 'preset9') {
    currentColorMode = 'hsl'
  } else {
    currentColorMode = 'rgb'
  }
}

function presetLoop() {
  if (power) {
    if (mode === 'preset0') {
      bl = 0
      gs = 0
      rh = preset0
      if (preset0Set === '-') {
        preset0 -= speed
      } else {
        preset0 += speed
      }
      if (preset0 > 255) {
        preset0Set = '-'
      }
      if (preset0 <= 0) {
        preset0Set = '+'
      }
    }
    if (mode === 'preset1') {
      bl = 255
      gs = 0
      rh = 255
    }
    if (mode === 'preset2') {
      bl = 255
      gs = 255
      rh = 0
    }
    if (mode === 'preset3') {
      bl = 0
      gs = 0
      rh = 255
    }
    if (mode === 'preset4') {
      bl = 0
      gs = 255
      rh = 0
    }
    if (mode === 'preset5') {
      bl = 255
      gs = 0
      rh = 0
    }
    if (mode === 'preset6') {
      bl = 0
      gs = 255
      rh = 255
    }
    if (mode === 'preset8') {
      rh += 50
      gs = 1
      bl = 0.5
      if (rh >= 360) {
        rh = random(0,360)
    }
    }
    if (mode === 'preset9') {
      rh = 180
      gs = 1
      if (bl >= 0.5) {
        disconnectedFade = '-'
         bl = 0.5
      }
      if (bl <= 0.3) {
        disconnectedFade = '+'
        bl = 0.3
      }
      if (disconnectedFade === '-') {
      bl -= 0.002
      }
      if (disconnectedFade === '+') {
      bl += 0.002
      }
    }
    if (mode === 'preset10') {
      if (prevMillis+200 < millis()) {
       prevMillis = millis()
      if (TIME === 0) {
        rh = 255
        gs = 0
        bl = 0
      }
      if (TIME === 1) {
        rh = 255
        gs = 0
        bl = 255
      }
      if (TIME === 2) {
        rh = 255
        gs = 255
        bl = 0
      }
      if (TIME === 3) {
        rh = 255
        gs = 255
        bl = 255
      }
      if (TIME === 4) {
        rh = 0
        gs = 255
        bl = 0
      }
      if (TIME === 5) {
        rh = 0
        gs = 255
        bl = 255
      }
      if (TIME === 6) {
        rh = 0
        gs = 0
        bl = 255
      }
      if (TIME === 7) {
        rh = 255
        gs = 0
        bl = 255
        TIME = -1
      }
      TIME += 0.002
      }
    }
    if (mode === 'preset11') {
      var colorValue = document.querySelector("#rgbColorPicker").value
    var splitColorValue = colorValue.split("");
    rh = parseInt(splitColorValue[1] + splitColorValue[2], 16);
    gs = parseInt(splitColorValue[3] + splitColorValue[4], 16);
    bl = parseInt(splitColorValue[5] + splitColorValue[6], 16);
    }
   if (mode === 'preset12') {
     gs = 0
     if (prevMillis+600 < millis()) {
       prevMillis = millis()
       if (copColor === 'red') {
         bl = 255
         rh = 0
         copColor = 'blue'
       } else {
         bl = 0
         rh = 255
         copColor = 'red'
       }
     }
   }
    if (mode === 'preset13') {
      // Winter Hours
      if (month() == 11 || month() == 12 || month() == 1 || month() == 2) {
        if (hour() > 18) {
          bl = nightRGB.levels[2]
          rh = nightRGB.levels[0]
          gs = nightRGB.levels[1]
        } else {
          if (hour() < 7) {
            bl = nightRGB.levels[2]
            rh = nightRGB.levels[0]
            gs = nightRGB.levels[1]
          } else {
            if(hour()+1 < 7) {
              lerpDayNight = lerpColor(nightRGB,dayRGB,(minute()+1)/60);
            } else {
              if(hour()-1 > 18) {
                lerpDayNight = lerpColor(dayRGB,nightRGB,minute()+1/60);
              } else {
                rh = dayRGB.levels[0]
                gs = dayRGB.levels[1]
                bl = dayRGB.levels[2]
              }
            }
          }
        }
      } else {
        // Summer Hours
          if (hour() > 21) {
          bl = nightRGB.levels[2]
          rh = nightRGB.levels[0]
          gs = nightRGB.levels[1]
        } else {
          if (hour() == 6) {
            lerpDayNight = lerpColor(nightRGB,dayRGB,(minute()+1)/60);
            rh = lerpDayNight.levels[0]
            gs = lerpDayNight.levels[1]
            bl = lerpDayNight.levels[2]
          } else {
            if(hour() < 5) {
              gs = nightRGB.levels[1]
              bl = nightRGB.levels[2]
              rh = nightRGB.levels[0]
            } else {
              if(hour()-1 > 21) {
                lerpDayNight = lerpColor(dayRGB,nightRGB,minute()+1/60);
              } else {
                rh = dayRGB.levels[0]
                gs = dayRGB.levels[1]
                bl = dayRGB.levels[2]
              }
            }
          }
        }
      }
    }
  }
}

function keyPressed() {
  if (key === '`') {
    powerCycle();
  }
  if (key === '-') {
  setPresetMode(10);
  }
  if (key === '+') {
    setPresetMode(11);
  }
  if (keyCode >= 48) {
  if (keyCode <= 57) {
  setPresetMode(key);
  }
}
}




///////// BEGIN BLUETOOTH CODE

var alertLevelCharacteristic;

function onReadButtonClick() {
  //console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({ filters: [{ services: [0xffe5] }] })
  .then(device => {
    //console.log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    //console.log('Getting Service...');
    return server.getPrimaryService(0xffe5);
  })
  .then(service => {
    //console.log('Getting Characteristic...');
    return service.getCharacteristic(0xffe9);
  })
  .then(characteristic => {
    alertLevelCharacteristic = characteristic;
    document.querySelector('#writeButton').disabled = false;
    //console.log('Reading Alert Level...');
    connected = true;
  })
  .catch(error => {
    document.querySelector('#writeButton').disabled = true;
  //console.log('OOF ' + error);
  });
}

function onWriteButtonClick() {
  if (!alertLevelCharacteristic) {
    return;
  }
  //console.log('Setting Alert Level...');
  let value = Uint8Array.of(86,sendR,sendG,sendB,0,240,170);
  //console.log(value)
  alertLevelCharacteristic.writeValue(value)
  .then(_ => {
    //console.log('> Alert Level changed to: ' + getAlertLevel(new DataView(value.buffer)));
  })
  .catch(error => {
    //console.log('Argh! ' + error);
  });
}

/* Utils */

const valueToAlertLevel = {
  0x00: 'No Alert',
  0x01: 'Mild Alert',
  0x02: 'High Alert'
};

function getAlertLevel(value) {
  let v = value.getUint8(0);
  return v + (v in valueToAlertLevel ?
      ' (' + valueToAlertLevel[v] + ')' : 'Unknown');
}

//////////////////// BEGIN WEATHER SEGMENT ////////////////////

let sunriseTime;
let sunsetTime;
let weatherData;
let coords;
let locationSuccess = false;

function getCurrentSunTime() {
    if (locationSuccess) {
        // https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}
        fetch(`https://api.openweathermap.org/data/3.0/onecall?lat=${coords.latitude}&lon=${coords.longitude}&appid=${weatherAPIKEY}`)
         .then((response) => response.json())
         .then((data) => weatherData=JSON.parse(data));
         sunriseTime = weatherData.current.sunrise;
         sunsetTime = weatherData.current.sunset;
        console.log(sunsetTime,sunriseTime);
    }
}

function success(x) {
    coords = x.coords
    locationSuccess = true;
    getCurrentSunTime();
}

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

navigator.geolocation.getCurrentPosition(success, error, options);

function error(x) {
    //nah chief im not dealing with error code rn
}
