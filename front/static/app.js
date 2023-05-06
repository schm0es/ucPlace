const canvas = document.getElementById('drawingCanvas');
const pixelSize = 10;
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');

let pixels = [];
let userId;

canvas.addEventListener('mousedown', drawPixel);
canvas.addEventListener('mousemove', showPixelId);
canvas.addEventListener('mouseout', clearHoverInfo);

//Gets all pixels currently stored in database
async function loadPixels() {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "http://127.0.0.1:5000/pixels");
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                const rawData = JSON.parse(this.responseText);
                const processedData = rawData.map(pixel => ({
                    id: pixel.id,
                    x: pixel.x,
                    y: pixel.y,
                    color: pixel.color
                }));
                console.log(processedData)
                resolve(processedData);
            } else {
                reject(new Error("Failed to load pixel data"));
            }
        };
        xhttp.send();
    });
}
//Display the pixels loaded from db into canvas
async function displayDBPixels() {
    const pixelData = await loadPixels();
    for (const pixel of pixelData) {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(pixel.x * pixelSize, pixel.y * pixelSize, pixelSize, pixelSize);

        const pixelInfo = {
            id: pixel.id,
            x: pixel.x,
            y: pixel.y,
            color: pixel.color
        };

        pixels.push(pixelInfo);
    }
    setTimeout(displayDBPixels, 5000);
}
//Send newly drawn pixels to db
async function sendPixels(pixelInfo) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://127.0.0.1:5000/pixels/" + encodeURIComponent(pixelInfo.id)
        + "/" + encodeURIComponent(pixelInfo.x)
        + "/" + encodeURIComponent(pixelInfo.y)
        + "/" + encodeURIComponent(pixelInfo.color));

    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function () {
        if (xhttp.status === 200) {
        }
    };
    xhttp.send();
}
//Update pixel if its already drawn on
async function updatePixel(pixelInfo) {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("PUT", "http://127.0.0.1:5000/pixels/" + encodeURIComponent(pixelInfo.id)
                                                           + "/" + encodeURIComponent(pixelInfo.x)
                                                           + "/" + encodeURIComponent(pixelInfo.y)
                                                           + "/" + encodeURIComponent(pixelInfo.color));
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                resolve(this.responseText);
            } else {
                reject(new Error("Failed to update pixel"));
            }
        };
        xhttp.send();
    });
}

function fetchUserId() {
    return new Promise((resolve, reject) => {
        var xhttp = new XMLHttpRequest();
        xhttp.open("GET", "http://127.0.0.1:5000/get_user_id");
        xhttp.onload = function () {
            if (xhttp.status === 200) {
                userId = this.responseText
                console.log(userId)
                resolve(userId);
            } 
        };
        xhttp.send();
    });
}

function drawPixel(event) {
    event.preventDefault(); // Add this line to prevent any default event behavior
    const rect = canvas.getBoundingClientRect();

    console.log((event.clientX - rect.left) / pixelSize, (event.clientY - rect.top) / pixelSize)

    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    const existingPixel = pixels.find(pixel => pixel.x === x && pixel.y === y);

    if (existingPixel) {
        // Update the existing pixel color
        existingPixel.color = colorPicker.value;
        ctx.fillStyle = existingPixel.color;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
        const pixelInfo = {
            id: existingPixel.id,
            x: x,
            y: y,
            color: existingPixel.color
        };
        updatePixel(pixelInfo);
    } else {
        // Draw a new pixel
        ctx.fillStyle = colorPicker.value;
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

        const pixelInfo = {
            id: userId,
            x: x,
            y: y,
            color: ctx.fillStyle
        };

        sendPixels(pixelInfo);

        pixels.push(pixelInfo);
    }
}

function showPixelId(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    const hoveredPixel = pixels.find(pixel => pixel.x === x && pixel.y === y);
    //console.log(hoveredPixel)

    if (hoveredPixel) {
        displayHoverInfo(event.clientX, event.clientY, hoveredPixel.id);
    } else {
        clearHoverInfo();
    }
}

function displayHoverInfo(x, y, id) {
    const hoverInfo = document.getElementById('hoverInfo');

    if (!hoverInfo) {
        const newHoverInfo = document.createElement('div');
        newHoverInfo.id = 'hoverInfo';
        newHoverInfo.style.position = 'fixed';
        newHoverInfo.style.left = `${x}px`;
        newHoverInfo.style.top = `${y}px`;
        newHoverInfo.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        newHoverInfo.style.padding = '2px 5px';
        newHoverInfo.style.borderRadius = '5px';
        newHoverInfo.innerText = `ID: ${id}`;
        document.body.appendChild(newHoverInfo);
    } else {
        hoverInfo.style.left = `${x}px`;
        hoverInfo.style.top = `${y}px`;
        hoverInfo.innerText = `ID: ${id}`;
    }
}

function clearHoverInfo() {
    const hoverInfo = document.getElementById('hoverInfo');

    if (hoverInfo) {
        hoverInfo.remove();
    }
}

fetchUserId();
