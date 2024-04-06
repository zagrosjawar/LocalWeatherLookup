
// Get the button and the input field
document.getElementById("getWeatherBtn").addEventListener("click", function() {
    const address = document.getElementById("addressInput").value;
    const encodedAddress = encodeURI(address);
    getCoordinates(encodedAddress);
    removeErrorMessage();

});

function removeErrorMessage() {
    document.getElementById("errorMessage").innerHTML = "";
}

// Get the coordinates for the address from the Kartverket's API
function getCoordinates(address) {
    const coordinatesUrl = `https://ws.geonorge.no/adresser/v1/sok?sok=${address}&fuzzy=true&sokemodus=AND&utkoordsys=4258&treffPerSide=1&side=0&asciiKompatibel=true`;
    
    //console.log("Coordinates URL: ", coordinatesUrl);
    fetch(coordinatesUrl)
        .then(response => response.json())
        .then(data => {
            console.log("coordinate data: ", data);
            if (data.adresser && data.adresser.length > 0) {
                const coords = {
                    latitude: data.adresser[0].representasjonspunkt.lat,
                    longitude: data.adresser[0].representasjonspunkt.lon
                };
                //console.log("Coordinates: ", coords.latitude, coords.longitude);
                getWeather(coords.latitude, coords.longitude);
            } else {
                document.getElementById("errorMessage").innerHTML = "No address found";
            }
        })

        .catch(error => {
            document.getElementById("errorMessage").innerHTML = "Something went wrong. Please try again.";
            console.error("Error fetching coordinates: ", error);
        });
}


// This function will fetch the weather data from the Meteorological Institute's API
function getWeather(latitude, longitude) {
    const weatherUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${latitude}&lon=${longitude}`;

    fetch(weatherUrl)
        .then (response => response.json())
        .then(data => {
            console.log("Weather data Here: ", data.properties.timeseries); // time series is an array of weather data
            displayWeatherData(data.properties.timeseries);
        })
        .catch(error => {
            document.getElementById("errorMessage").innerHTML = "Something went wrong. Please try again.";
            console.error("Error fetching weather data: ", error);
        });
    }


// This function will display the weather data in the table
function displayWeatherData(weatherData) {
    // parsing weather data and creating the table rows
    const tableBody = document.getElementById("weatherTable").getElementsByTagName("tbody")[0];
    tableBody.innerHTML = "";

    // looping through the weatherData and create a row for each time point // data.properties.timeseries[0] this gets the first time point

    weatherData.slice(0, 20).forEach((timepoint) => {
        const row = tableBody.insertRow();
        const timeCell = row.insertCell();
        const tempCell = row.insertCell();
        const precCell = row.insertCell();
        const weatherCell = row.insertCell();
    

    // Inserting the data into the cells
    timeCell.textContent = new Date(timepoint.time).toLocaleString();
    tempCell.textContent = timepoint.data.instant.details.air_temperature + "°C";
    precCell.textContent = timepoint.data.next_1_hours ? timepoint.data.next_1_hours.details.precipitation_amount + "mm" : "0mm";
    weatherCell.textContent = timepoint.data.next_1_hours ? timepoint.data.next_1_hours.summary.symbol_code : "No data";

    // Inserting the weather icon
    const iconUrl = timepoint.data.next_1_hours.summary.symbol_code;

    const iconImg = document.createElement('img');
    iconImg.src = "weathericons/weather/svg/" + iconUrl + ".svg";
    iconImg.alt = "Weather icon";
    iconImg.className = "weatherIcon";
    weatherCell.appendChild(iconImg);

});
}
// second iteration of the project development
// showing the weather where the user is located and the address of the user

// a function to check if the GeoLocation API is available in the browser. If it is, get the user's location
function getLocationAndWeather() {
    if ("geolocation" in navigator) { 
        navigator.geolocation.getCurrentPosition(function (position) {
            //console.log("User's location: ", position.coords.latitude, position.coords.longitude);
            getWeather(position.coords.latitude, position.coords.longitude); // get the weather for the user's location
            getAddress(position.coords.latitude, position.coords.longitude); // get the address for the user's location
        }, function (error) {
            document.getElementById("errorMessage").textContent = "Geolocation error: " + error.message;
        });
    } else {
        document.getElementById("errorMessage").textContent = "Geolocation is not supported by your browser";
    }
}
// Call this function when the page loads
getLocationAndWeather();



// a function to get the address for the user's location
function getAddress(latitude, longitude, radius=100) {
    const geoUrl = `https://ws.geonorge.no/adresser/v1/punktsok?lat=${latitude}&lon=${longitude}&radius=${radius}`


    console.log("Reverse geocode URL: ", geoUrl);
    fetch(geoUrl)
        .then(response => response.json())
    
        .then(data => { 
            if (data.adresser && data.adresser.length > 0) {
                const address = data.adresser[0].adressetekst;
                console.log("Address: ", address);
                // Here, update your UI with the address
                // adding class="address" to the p element with id="address" to style the address
                document.getElementById("address").className = "address";
                document.getElementById("address").innerHTML = "Checking weather for: " + address;
            } else {
                document.getElementById("errorMessage").textContent = "No address found at this location";
            }

            
        })
    
        .catch(error => {
            document.getElementById("errorMessage").textContent = "Error fetching address: " + error.message;
        });
}

// End
