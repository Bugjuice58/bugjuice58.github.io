let ilyPercent = 1
let intervalReset = false

function addNew() {
    let newIly = document.createElement("p");
    newIly.textContent = `${ilyPercent}%`
    document.querySelector("body").appendChild(newIly);
    ilyPercent++
    if (ilyPercent >= 5000 && intervalReset) {
        clearInterval(interval);
        interval = setInterval(addNew, 50);
        intervalReset = true;
    }
}

let interval = setInterval(addNew,5)