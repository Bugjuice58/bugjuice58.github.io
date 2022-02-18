var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var grammar = '#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;'
var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;
let speechCount = 0;
let errorShow = false;
let lastKnownColor;

recognition.onresult = function(event) {
  // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
  // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
  // It has a getter so it can be accessed like an array
  // The first [0] returns the SpeechRecognitionResult at the last position.
  // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
  // These also have getters so they can be accessed like arrays.
  // The second [0] returns the SpeechRecognitionAlternative at position 0.
  // We then return the transcript property of the SpeechRecognitionAlternative object
  console.log('Confidence: ' + event.results[speechCount][0].confidence);
  checkForCommand(event.results[speechCount][0].transcript.toLowerCase())
  console.log(`You said: ${event.results[speechCount][0].transcript}`)
  speechCount++
}

//recognition.onspeechend = function() {
  //recognition.stop();
//}

//recognition.onnomatch = function(event) {
//  diagnostic.textContent = "I didn't recognise that color.";
//}

//recognition.onerror = function(event) {
//  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
//}

//// BEGIN SPEECH COMMAND PARSER CODE

function checkForCommand(speechSent) {
  if (speechSent.includes("color") && speechSent != " color") {
    //console.log(`"${speechSent}"`);
    changeColor(speechSent.split("color ")[1].replace(" ",""));
  } else {
    if (speechSent.includes("darken")) {
      darkBrightColor(parseInt(speechSent.split("darken ")[1]),'darken');
    } else {
      if (speechSent.includes("brighten")) {
        darkBrightColor(parseInt(speechSent.split("brighten ")[1]),'brighten');
      } else {
        if (speechSent.includes("dark")) {
          darkBrightColor(parseInt(speechSent.split("dark ")[1]),'darken');
        } else {
          if (speechSent.includes("bright")) {
            darkBrightColor(parseInt(speechSent.split("bright ")[1]),'brighten');
          } else {
            if (speechSent.includes("off")) {
              //tempColorStore = getComputedStyle(document.querySelector("#p")).color;
              //lastKnownColor = [tempColorStore.split('rgb(')[1].split(',')[0],tempColorStore.split(', ')[1],tempColorStore.split(', ')[2].split(')')[0]];
              //onWriteButtonClick(0,0,0);
            } else {
              if (speechSent.includes("on")) {
                //onWriteButtonClick(lastKnownColor[0],lastKnownColor[1],lastKnownColor[2])
              } else {
                // The rest of this code will be finished here.
                document.querySelector('#errorReporter').textContent = `I didn't recognise any commands, you said: "${speechSent}"`
              }
            }
            }
        }
        // eh i'll do the rest of this later
     }
   }
  }
}

//// BEGIN COLOR PARSER CODE
function changeColor(colorWord) {
  bg = document.querySelector("#p");
  bg.style.color = colorWord;
  tempColorStore = getComputedStyle(document.querySelector("#p")).color;
  tempColorArray = [tempColorStore.split('rgb(')[1].split(',')[0],tempColorStore.split(', ')[1],tempColorStore.split(', ')[2].split(')')[0]];
  onWriteButtonClick(parseInt(tempColorArray[0]),parseInt(tempColorArray[1]),parseInt(tempColorArray[2]));
}

function darkBrightColor(amount,whichChange) {
  tempColorStore = getComputedStyle(document.querySelector("#p")).color;
  tempColorArray = [tempColorStore.split('rgb(')[1].split(',')[0],tempColorStore.split(', ')[1],tempColorStore.split(', ')[2].split(')')[0]];
  tempHslArray = rgbToHsl(parseInt(tempColorArray[0]),parseInt(tempColorArray[1]),parseInt(tempColorArray[2]));
  if (whichChange == 'darken') { 
    tempHslArray[2] -=amount/100;
  } else {
    tempHslArray[2] +=amount/100;
  }
  if (tempHslArray[2] < 0) {
    tempHslArray[2] = 0
  }
  if (tempHslArray[2] > 255) {
    tempHslArray[2] = 255
  }
  onWriteButtonClick(hslToRgb(tempHslArray[0],tempHslArray[1],tempHslArray[2])[0],hslToRgb(tempHslArray[0],tempHslArray[1],tempHslArray[2])[1],hslToRgb(tempHslArray[0],tempHslArray[1],tempHslArray[2])[2]);
}


//// BEGIN BLUETOOTH CODE
var alertLevelCharacteristic;

function onReadButtonClick() {
  //console.log('Requesting Bluetooth Device...');
  navigator.bluetooth.requestDevice({
      filters: [{
        services: [0xffe5]
      }]
    })
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
      //console.log('Reading Alert Level...');
      recognition.start();
      document.querySelector('#btConnect').style.display = none;
    })
    .catch(error => {
      console.log('OOF ' + error);
      document.querySelector("#errorReporter").textContent = error;
    });
}

function onWriteButtonClick(r, g, b) {
  bg = document.querySelector("#p");
  bg.style.color = `rgb(${r},${g},${b})`;
  // If you wish the background to not change, comment this out \/
  document.querySelector("html").style.backgroundColor = `rgb(${r},${g},${b})`;
  if (!alertLevelCharacteristic) {
    return;
  }
  console.log('Setting Alert Level...');
  let value = Uint8Array.of(86, r, g, b, 0, 240, 170);
  console.log(value)
  alertLevelCharacteristic.writeValue(value)
    .then(_ => {
      console.log('> Alert Level changed to: ' + getAlertLevel(new DataView(value.buffer)));
    })
    .catch(error => {
      console.log('Argh! ' + error);
      document.querySelector("#errorReporter").textContent = error
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


/// HSL TO RGB AND RGB TO HSL CODE

function rgbToHsl(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function errorToggle() {
  errorShow = !errorShow
  if (errorShow) {
    document.querySelector("#errorSimple").style.display = 'inline'
  } else {
    document.querySelector("#errorSimple").style.display = 'none'
  }
}

function resetMic() {
  recognition.start();
  speechCount = 0;
}