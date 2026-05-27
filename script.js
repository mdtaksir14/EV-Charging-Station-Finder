// ================= MAP =================

// Create Map
const map = L.map('map').setView([12.9716, 77.5946], 12);

// OpenStreetMap Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

    attribution: '&copy; OpenStreetMap contributors'

}).addTo(map);


// ================= EV STATIONS DATA =================

const stations = [

    {
        name: "MG Road EV Station",
        lat: 12.9756,
        lon: 77.6050,
        charger: "Fast Charging",
        slots: 3,
        rating: 4.5,
        waiting: "5 mins",
        status: "Available",
        prediction: "5 slots after 30 mins"
    },

    {
        name: "Indiranagar EV Station",
        lat: 12.9784,
        lon: 77.6408,
        charger: "Normal Charging",
        slots: 1,
        rating: 4.2,
        waiting: "15 mins",
        status: "Busy",
        prediction: "2 slots after 20 mins"
    },

    {
        name: "Koramangala EV Station",
        lat: 12.9352,
        lon: 77.6245,
        charger: "Fast Charging",
        slots: 0,
        rating: 4.8,
        waiting: "30 mins",
        status: "Full",
        prediction: "1 slot after 40 mins"
    },

    {
        name: "Whitefield EV Station",
        lat: 12.9698,
        lon: 77.7500,
        charger: "Super Fast Charging",
        slots: 4,
        rating: 4.9,
        waiting: "1 min",
        status: "Available",
        prediction: "6 slots after 15 mins"
    }

];


// ================= ADD STATION MARKERS =================

function displayStations(filteredStations = stations) {

    // Remove old markers
    map.eachLayer(function (layer) {

        if (layer instanceof L.Marker) {

            map.removeLayer(layer);

        }

    });

    // Add station markers
    filteredStations.forEach(station => {

        let markerColor;

        if (station.status === "Available") {

            markerColor = "green";

        }

        else if (station.status === "Busy") {

            markerColor = "orange";

        }

        else {

            markerColor = "red";

        }

        // Custom Marker Icon
        const customIcon = L.icon({

            iconUrl:
                `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${markerColor}.png`,

            shadowUrl:
                'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',

            iconSize: [25, 41],

            iconAnchor: [12, 41],

            popupAnchor: [1, -34]

        });

        // Add Marker
        L.marker([station.lat, station.lon], {

            icon: customIcon

        })

            .addTo(map)

            .bindPopup(`

                <h2>${station.name}</h2>

                <p><b>⚡ Charger:</b> ${station.charger}</p>

                <p><b>🅿 Slots:</b> ${station.slots}</p>

                <p><b>⭐ Rating:</b> ${station.rating}</p>

                <p><b>⏳ Waiting:</b> ${station.waiting}</p>

                <p><b>Status:</b> ${station.status}</p>

                <p><b>🤖 AI Prediction:</b> ${getPrediction()}</p>

                <button onclick="showRoute(${station.lat}, ${station.lon})">

                    Navigate

                </button>

            `);

    });

}

// Display all stations initially
displayStations();



// ================= ANALYTICS =================

// Total Stations
document.getElementById("total-stations").innerText =

    stations.length;


// Available Stations
const availableCount = stations.filter(

    station => station.status === "Available"

).length;

document.getElementById("available-stations").innerText =

    availableCount;


// Busy Stations
const busyCount = stations.filter(

    station => station.status === "Busy"

).length;

document.getElementById("busy-stations").innerText =

    busyCount;


// Full Stations
const fullCount = stations.filter(

    station => station.status === "Full"

).length;

document.getElementById("full-stations").innerText =

    fullCount;


// ================= SEARCH LOCATION =================

document.getElementById("search-btn")

    .addEventListener("click", function () {

        const location = document.getElementById("search-box").value;

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`)

            .then(response => response.json())

            .then(data => {

                if (data.length > 0) {

                    const lat = data[0].lat;
                    const lon = data[0].lon;

                    map.setView([lat, lon], 13);

                    L.marker([lat, lon])

                        .addTo(map)

                        .bindPopup(`📍 ${location}`)

                        .openPopup();

                }

                else {

                    alert("Location not found");

                }

            });

    });


// ================= DISTANCE FUNCTION =================

function calculateDistance(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;

    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =

        Math.sin(dLat / 2) * Math.sin(dLat / 2)

        +

        Math.cos(lat1 * Math.PI / 180)

        *

        Math.cos(lat2 * Math.PI / 180)

        *

        Math.sin(dLon / 2)

        *

        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;

}


// ================= CURRENT LOCATION =================

document.getElementById("location-btn")

    .addEventListener("click", function () {

        navigator.geolocation.getCurrentPosition(

            function (position) {

                const userLat = position.coords.latitude;

                const userLon = position.coords.longitude;

                map.setView([userLat, userLon], 14);

                L.marker([userLat, userLon])

                    .addTo(map)

                    .bindPopup("📍 You are Here")

                    .openPopup();

                // Find nearest station
                let nearestStation = null;

                let shortestDistance = Infinity;

                stations.forEach(station => {

                    const distance = calculateDistance(

                        userLat,
                        userLon,
                        station.lat,
                        station.lon

                    );

                    if (distance < shortestDistance) {

                        shortestDistance = distance;

                        nearestStation = station;

                    }

                });

                alert(

                    "Nearest EV Station:\n\n"

                    +

                    nearestStation.name

                    +

                    "\nDistance: "

                    +

                    shortestDistance.toFixed(2)

                    +

                    " KM"

                );

            },

            function () {

                alert("Unable to get location");

            }

        );

    });


// ================= GOOGLE MAP ROUTE =================

function showRoute(lat, lon) {

    window.open(

        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,

        '_blank'

    );

}


// ================= FILTER FEATURE =================

document.getElementById("filter-btn")

    .addEventListener("click", function () {

        const selectedFilter =

            document.getElementById("filter").value;

        if (selectedFilter === "all") {

            displayStations();

        }

        else {

            const filteredStations = stations.filter(station =>

                station.charger === selectedFilter

            );

            displayStations(filteredStations);

        }

    });
    // ================= DARK MODE =================

document.getElementById("theme-btn")

    .addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

    });
    // ================= ROUTE NAVIGATION =================

function showRoute(lat, lon) {

    const url =

        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

    window.open(url, "_blank");

}
// ================= COST ESTIMATION =================

document.getElementById("estimate-btn")

    .addEventListener("click", function () {

        const battery =

            document.getElementById("battery").value;

        const chargeType =

            document.getElementById("charge-type").value;

        let costPerPercent;
        let chargingTime;

        // Pricing Logic

        if (chargeType === "Fast Charging") {

            costPerPercent = 2;
            chargingTime = "45 Minutes";

        }

        else if (chargeType === "Super Fast Charging") {

            costPerPercent = 3;
            chargingTime = "20 Minutes";

        }

        else {

            costPerPercent = 1;
            chargingTime = "1 Hour 30 Minutes";

        }

        // Cost Calculation

        const remainingCharge = 100 - battery;

        const estimatedCost =

            remainingCharge * costPerPercent;

        // Display Result

        document.getElementById("cost-result")

            .innerHTML = `

            🔋 Battery Level: ${battery}% <br><br>

            ⚡ Charging Type: ${chargeType} <br><br>

            💰 Estimated Cost: ₹${estimatedCost} <br><br>

            ⏱ Estimated Charging Time: ${chargingTime}

        `;

    });
    // ================= USER REVIEWS =================

document.getElementById("submit-review")

    .addEventListener("click", function () {

        // Get values
        const name = document.getElementById("user-name").value;

        const rating = document.getElementById("rating").value;

        const review = document.getElementById("review-text").value;

        // Validation
        if (name === "" || review === "") {

            alert("Please fill all fields");

            return;

        }

        // Reviews container
        const reviewsList = document.getElementById("reviews-list");

        // Remove default text
        if (reviewsList.innerHTML.includes("No reviews yet")) {

            reviewsList.innerHTML = "";

        }

        // Create review card
        const reviewCard = document.createElement("div");

        reviewCard.style.border = "2px solid #00ff99";

        reviewCard.style.padding = "15px";

        reviewCard.style.marginTop = "20px";

        reviewCard.style.borderRadius = "10px";

        reviewCard.style.background = "rgba(255,255,255,0.1)";

        reviewCard.style.color = "white";

        // Add review content
        reviewCard.innerHTML = `

            <h3>👤 ${name}</h3>

            <p>⭐ Rating: ${rating}/5</p>

            <p>💬 ${review}</p>

        `;

        // Add to page
        reviewsList.prepend(reviewCard);

        // Clear fields
        document.getElementById("user-name").value = "";

        document.getElementById("review-text").value = "";

        document.getElementById("rating").value = "5";

    });
    // ================= VOICE SEARCH =================

const voiceBtn = document.getElementById("voice-btn");

voiceBtn.addEventListener("click", function () {

    // Create speech recognition
    const recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";

    recognition.start();

    // When voice detected
    recognition.onresult = function (event) {

        const transcript = event.results[0][0].transcript;

        // Put voice text inside search box
        document.getElementById("search-box").value = transcript;

        // Automatically click search
        document.getElementById("search-btn").click();

    };

    // Error handling
    recognition.onerror = function () {

        alert("Voice recognition failed");

    };

});
// ================= AI BUSY PREDICTION =================

function getPrediction() {

    // Current hour
    const hour = new Date().getHours();

    // Morning Rush
    if (hour >= 8 && hour <= 11) {

        return "High Traffic Expected 🚗🚗🚗";

    }

    // Evening Rush
    else if (hour >= 5 && hour <= 9) {

        return "Station May Become Busy ⚠";

    }

    // Normal Time
    else {

        return "Low Traffic ✅";

    }

}
// ================= CARBON EMISSION SAVINGS =================

document.getElementById("carbon-btn")

    .addEventListener("click", function () {

        // Random simulated savings
        const carbonSaved =

            (Math.random() * 20 + 5).toFixed(2);

        // Display result
        document.getElementById("carbon-result")

            .innerHTML = `

            🌱 You saved <b>${carbonSaved} kg</b>
            of CO₂ emission by using EV charging today.

            <br><br>

            🚗 Helping build a greener future!

        `;

    });
    // ================= CHATBOT =================

document.getElementById("send-btn")

    .addEventListener("click", function () {

        const input = document.getElementById("chat-input");

        const message = input.value.toLowerCase();

        const chatBox = document.getElementById("chat-box");

        // User Message

        chatBox.innerHTML += `

            <div class="user-message">

                ${message}

            </div>

        `;

        let reply = "Sorry 😅 I didn't understand.";

        // AI Replies

        if (message.includes("nearest")) {

            reply = "📍 Nearest station is Whitefield EV Station.";

        }

        else if (message.includes("fast")) {

            reply = "⚡ Fast charging available at Indiranagar Station.";

        }

        else if (message.includes("available")) {

            reply = "✅ 2 stations are currently available.";

        }

        else if (message.includes("cost")) {

            reply = "💰 Average charging cost is ₹250.";

        }

        else if (message.includes("hello")) {

            reply = "👋 Hello! How can I help you?";

        }

        // Bot Reply

        setTimeout(() => {

            chatBox.innerHTML += `

                <div class="bot-message">

                    ${reply}

                </div>

            `;

            chatBox.scrollTop = chatBox.scrollHeight;

        }, 500);

        input.value = "";

    });
    // ================= EV GRAPH ANALYTICS =================

// ================= EV GRAPH ANALYTICS =================

// ================= EV GRAPH ANALYTICS =================

