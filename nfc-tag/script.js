function colorCards() { //TEMP
    let elements = document.querySelectorAll('.card');

    elements.forEach( element => {
        let bgColor = `#${randomRange(128,255).toString(16)}${randomRange(128,255).toString(16)}${randomRange(128,255).toString(16)}`;
        element.style.backgroundColor = bgColor
        element.style.color = shadeColor(bgColor,-50)
    });
}
colorCards()
function randomRange(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function addPlus() {
    let element = document.createElement("div")
    element.classList.add("card")
    element.textContent = '+'
    element.style.backgroundColor = 'rgba(255,255,255,0.4)'
    element.id = 'newCard'
    element.style.fontSize = '96px'
    element.style.padding = '150px 160px'
    element.onclick = 'scanNew()'
    cardHolder = document.getElementById("cardHolder")
    cardHolder.appendChild(element)
}
addPlus()

function shadeColor(color, percent) { // https://stackoverflow.com/a/13532993

    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));
    console.log(color,RR,GG,BB)
    return "#"+RR+GG+BB;
}

function scanNew() {
    const ndef = new NDEFReader();
    ndef.scan().then(() => {
        console.log("Scan started successfully.");
    ndef.onreadingerror = (event) => {
        console.log("Error! Cannot read data from the NFC tag. Try a different one?");
    };
    ndef.onreading = (event) => {
        console.log("NDEF message read.");
        console.log(event)
    };
    }).catch(error => {
    console.log(`Error! Scan failed to start: ${error}.`);
    });

}