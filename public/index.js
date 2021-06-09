let data;
let notClose = true;
function success(position) {
    let latitude = position.coords.latitude.toPrecision(4);
    let longitude = position.coords.longitude.toPrecision(4);
    data = JSON.stringify({
        "longitude": longitude,
        "latitude": latitude,
    });
    sendData(data);
}

function err() {
    alert("unable to retrieve location");
}

function sendData(data) {
    let xhr = new XMLHttpRequest;
    let url = "/app.js";
    xhr.onreadystatechange =()=>{
        if(xhr.readyState == XMLHttpRequest.DONE) {
            let weatherData = JSON.parse(xhr.responseText);
            currentWeather = "Is " + weatherData.weather[0].main;
            currentTemp = Math.floor(weatherData.main.temp) + " C";
            cityName = weatherData.name;
            weatherHead = "Current Weather In";
            weatherImg = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`
            document.querySelector(".weather h2").textContent = `${weatherHead} ${cityName} ${currentWeather}`;
            document.querySelector('#weatherImg').setAttribute('src',`${weatherImg}`);
            document.querySelector('#weatherTemp').textContent = `${currentTemp}`;
        }
    }
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(data);
}

if (!navigator.geolocation) {
    console.log("unable to retrieve results");
} else {
    navigator.geolocation.getCurrentPosition(success, err);
}

