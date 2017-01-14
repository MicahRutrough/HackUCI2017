var dateadd = 5;

var OpenWeatherConstants = {

    WEATHER_BASE_URL : "http://api.openweathermap.org/data/2.5/weather?",
    WEATHER_APP_KEY : "APPID=e0d69044d0b30f6f989f67de783e0cee",
    LAT : "lat=",
    LON : "lon=",
	UNITS : "units=",
	FAHRENHEIGHT: "imperial",
	CELCIUS : "metric"
};
var OpenAirConstants = {
    AIR_QUALITY_BASE_URL: "http://api.breezometer.com/baqi/?",
    AIR_QUALITY_API_KEY: "key=f3e5d52a386b433f828b1a5683a612ec",
}

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
    //alert("Move to next string");
};

for (var i = 0; i < classname.length; i++) {
    classname[i].addEventListener('click', clickMoodButton, false);
}

function run_save(buttoncode)
{

    var startPos;
    var geoOptions = {
        timeout: 10 * 1000
    }

    var geoSuccess = function(position) {
        startPos = position;
        var weather_url = OpenWeatherConstants.WEATHER_BASE_URL + OpenWeatherConstants.LAT + startPos.coords.latitude + "&" +
            OpenWeatherConstants.LON + startPos.coords.longitude + "&" + OpenWeatherConstants.WEATHER_APP_KEY + "&" +
			OpenWeatherConstants.UNITS + OpenWeatherConstants.FAHRENHEIGHT;
        console.log(weather_url);


        var air_url = OpenAirConstants.AIR_QUALITY_BASE_URL + "lat="+ startPos.coords.latitude + "&lon="+
            startPos.coords.longitude + "&" + OpenAirConstants.AIR_QUALITY_API_KEY;
        console.log(air_url);

        invokeGetInfo(weather_url, air_url);

    };
    var geoError = function(error) {
        console.log('Error occurred. Error code: ' + error.code);
    };

    var invokeGetInfo = function (w_url, a_url) {
        var weather_connection = new XMLHttpRequest();
        var air_connection = new XMLHttpRequest();

        //Here is all of the weather stuff
        var weather_response;
        var weather_temp;
        var weather_condition;
        var weather_description;

        //Here is all of the air stuff
        var air_response;
        var air_description;
        var air_aqi;

        // Date information. Here is where you change the date things
        var todaysDate = new Date();
        var key = todaysDate.toISOString();
        var day = todaysDate.getDate();
        var monthIndex = todaysDate.getMonth();
        var twoDigitsYear = parseInt(todaysDate.getFullYear().toString().substr(2,2), 10);
        var dateString = todaysDate.toISOString().substring(0, 10);

        weather_connection.onreadystatechange = function() {
            if (weather_connection.readyState == 4 && weather_connection.status == 200) {
                weather_response = JSON.parse(weather_connection.responseText);
                weather_temp = weather_response.main.temp;
                weather_condition = weather_response.weather;
                weather_description = weather_response.weather[0].description;

                console.log("Weather");
                console.log(weather_response);
                console.log(weather_description);
            }
        };


        air_connection.onreadystatechange = function () {
            if (air_connection.readyState == 4 && air_connection.status == 200){
                air_response = JSON.parse(air_connection.responseText);
                air_description = air_response.breezometer_description;
                air_aqi = air_response.breezometer_aqi;


                console.log("AIR");
                console.log(air_response);
                console.log(air_description);
            }
        };

        weather_connection.open("GET", w_url, false);
        air_connection.open("GET", a_url, false);

        weather_connection.send();
        air_connection.send();


        var object_value = {'date' : dateString, 'temp': weather_temp , 'mood': buttoncode, "weather_description" : weather_description,
            "air_description" : air_description, "air_index":air_aqi};
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

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
};