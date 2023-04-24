let ilyPercent = 1

function addNew() {
    let newIly = document.createElement("p");
    newIly.textContent = `${ilyPercent}%`
    document.querySelector("body").appendChild(newIly);
    ilyPercent++
}

let interval = setInterval(addNew,5)