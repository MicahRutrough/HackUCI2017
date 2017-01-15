$(document).ready(function()
{
	// Initialize the plugin
	$('#my_popup').popup();

});

var dateadd = 0;

var OpenWeatherConstants = {

    WEATHER_BASE_URL : "http://api.openweathermap.org/data/2.5/weather?",
    WEATHER_APP_KEY : "APPID=e0d69044d0b30f6f989f67de783e0cee",
    LAT : "lat=",
    LON : "lon=",
	UNITS : "units=",
	FAHRENHEIT: "imperial",
	CELSIUS : "metric"
};

var GMAP_BASE_URL = "http://maps.google.com/maps/api/geocode/json?address=";

var OpenAirConstants = {
    AIR_QUALITY_BASE_URL: "http://api.breezometer.com/baqi/?",
    AIR_QUALITY_API_KEY: "key=f3e5d52a386b433f828b1a5683a612ec",
};

var API_DATA = {
    weather_data : null,
    air_data : null
};

var monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];

var classname = document.getElementsByClassName("moodbutton");

var clickMoodButton = function() {
    var id_attr = this.getAttribute("id");
    run_save(parseInt(id_attr.substring(6)));
};

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('click', clickMoodButton, false);
}


var todaysDate = new Date();
var key = todaysDate.toISOString().substring(0, 10);
var dateString = todaysDate.toISOString().substring(0, 10);


var geoSuccess = function(position) {
    startPos = position;
    var weather_url = OpenWeatherConstants.WEATHER_BASE_URL + OpenWeatherConstants.LAT + startPos.coords.latitude + "&" +
        OpenWeatherConstants.LON + startPos.coords.longitude + "&" + OpenWeatherConstants.WEATHER_APP_KEY + "&" +
        OpenWeatherConstants.UNITS + OpenWeatherConstants.FAHRENHEIT;
    console.log(weather_url);
    API_DATA.weather_data = weatherInfo(weather_url);


    var air_url = OpenAirConstants.AIR_QUALITY_BASE_URL + "lat="+ startPos.coords.latitude + "&lon="+
        startPos.coords.longitude + "&" + OpenAirConstants.AIR_QUALITY_API_KEY;
    console.log(air_url);
    API_DATA.air_data = airInfo(air_url)

};
var geoError = function(error) {
    console.log('Error occurred. Error code: ' + error.code);
};

var geoOptions = {
    timeout: 10 * 1000
};

navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);




function weatherInfo(w_url){
    var weather_connection = new XMLHttpRequest();

    //Here is all of the weather stuff
    var weather_response = null;

    weather_connection.onreadystatechange = function() {
        if (weather_connection.readyState == 4 && weather_connection.status == 200) {
            weather_response = JSON.parse(weather_connection.responseText);
        }
    };

    weather_connection.open("GET", w_url, false);
    weather_connection.send();

    return weather_response;

}


function airInfo(a_url){
    var air_connection = new XMLHttpRequest();
    var air_response = null;
    air_connection.onreadystatechange = function () {
        if (air_connection.readyState == 4 && air_connection.status == 200){
            air_response = JSON.parse(air_connection.responseText);
        }
    };

    air_connection.open("GET", a_url, false);
    air_connection.send();
    return air_response;
}

function run_save(buttoncode)
{

    chrome.storage.sync.get(key, function (temp1) {
        if(Object.keys(temp1).length === 0 && temp1.constructor === Object){
            console.log("Key not found");
            invokeGetInfo(API_DATA.weather_data,API_DATA.air_data, buttoncode);
        }
        else{
            console.log("Key found");
            console.log("The button was already pressed. Replacing")

            chrome.storage.sync.remove(key, function (temp1) {
                console.log(JSON.stringify(temp1));

            });

            chrome.storage.sync.get(null, function (temp) {
                console.log(JSON.stringify(temp));

            });
            invokeGetInfo(API_DATA.weather_data,API_DATA.air_data, buttoncode);

        }
    });




    var startPos;





};

function invokeGetInfo(weatherInfo, airInfo, buttoncode) {
    console.log("Went into invoke");
    var object_value = {'date' : dateString, 'temp': weatherInfo.main.temp , 'mood': buttoncode, "weather_description" : weatherInfo.weather[0].description,
        "air_description" : airInfo.breezometer_description, "air_index":airInfo.breezometer_aqi};
    console.log(object_value);

    var jsonfile = {};
    jsonfile[key] = object_value;

    chrome.storage.sync.set(jsonfile, function() {
        // Notify that we saved.
        console.log('Settings saved');
    });

    chrome.storage.sync.get(null, function (temp) {
        console.log(JSON.stringify(temp));
    });
};

function fetchCoordsFromAddress(address) {
    address = address.replace(/\s/g, "+");
    var gMapUrl = GMAP_BASE_URL + address;
    var xhr = new XMLHttpRequest();
    var latitude, longitude;
    var service_passed = false;
    var coordJson = null;

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {

            var json = JSON.parse(xhr.responseText);

            if(json['status'] == "OK") {
                latitude = json["results"][0]["geometry"]["location"]["lat"];
                longitude = json["results"][0]["geometry"]["location"]["lng"];
                coordJson = {'latitude' : latitude, 'longitude' : longitude};
            }

        }
    };
    xhr.open("GET", gMapUrl, false);
    xhr.send();
    return coordJson;
}

var get_info = function() {
    var json_array;
    chrome.storage.sync.get(null, function (temp) {
        json_array = temp;
        console.log(temp);
        if (!temp["name"] || !temp["addr"]) {
            $('#my_popup').popup("show");
        }
        if (temp["name"] && temp["addr"]) {
            var title = document.getElementById("name_title");
            title.innerHTML = "Hello, " + temp["name"];
            var name = document.getElementById("get_name");
            var addr = document.getElementById("get_address");
            name.value = temp["name"];
            addr.value = temp["addr"];
        }
    });

    document.getElementById("close_popup").addEventListener('click', function () {
        var name = document.getElementById("get_name").value;
        var addr = document.getElementById("get_address").value;
        if (name == "" || addr == "") {
            $("#my_popup").effect("shake");
            $(".popup_error").text("Please enter the name and address");
            $(".popup_error").addClass("visible");
            return;
        }
        json_array["name"] = name;
        json_array["addr"] = addr;

        var coordJson = fetchCoordsFromAddress(addr);

        if (coordJson != null) {
            chrome.storage.sync.set(json_array, function () {
                // Notify that we saved.
                console.log('Settings saved');
            });
            var title = document.getElementById("name_title");
            title.innerHTML = "Hello, " + name;
            $(".popup_error").removeClass("visible");
            $('#my_popup').popup("hide");
        } else {
            $("#my_popup").effect("shake");
            $(".popup_error").text("Please enter a real address");
            $(".popup_error").addClass("visible");
            return;
        }

    });
}
get_info();

