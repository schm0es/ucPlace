const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');

let pixels = [];
let idCounter = 1;
const pixelSize = 10;

canvas.addEventListener('mousedown', drawPixel);
canvas.addEventListener('mousemove', showPixelId);
canvas.addEventListener('mouseout', clearHoverInfo);

async function fetchPixels() {
    const response = await fetch('http://127.0.0.1:5500/api/pixels');
    const data = await response.json();
    return data;
}

async function sendPixel(x, y, color) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "http://127.0.0.1:5000/pixels/" + encodeURIComponent(x) + "/" + encodeURIComponent(y)+ "/" + encodeURIComponent(color));
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.onload = function () {
      if (xhttp.status === 200) {
        document.getElementById("demo").innerHTML = this.responseText;
      } else if (xhttp.status === 404) {
        document.getElementById("demo").innerHTML = "Student not found.";
      } else {
        document.getElementById("demo").innerHTML = "Error: " + xhttp.status;
      }
    };
    xhttp.send();
  }


async function drawPixel(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    ctx.fillStyle = colorPicker.value;
    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);

    const pixelInfo = {
        id: idCounter,
        x: x,
        y: y,
        color: ctx.fillStyle
    };

    const result = await sendPixel(x, y, ctx.fillStyle);
    console.log("Result from sendPixel:", result);
    pixelInfo.id = result.id;
    pixels.push(pixelInfo);
    idCounter++;
}

async function loadPixels() {
    const pixelData = await fetchPixels();
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
    idCounter = pixels.length + 1;
}

function showPixelId(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / pixelSize);
    const y = Math.floor((event.clientY - rect.top) / pixelSize);

    const hoveredPixel = pixels.find(pixel => pixel.x === x && pixel.y === y);

    if (hoveredPixel) {
        displayHoverInfo(event.clientX, event.clientY, hoveredPixel.id);
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

loadPixels();
