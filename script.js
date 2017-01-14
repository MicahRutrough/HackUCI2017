

var OpenWeatherConstants = {

    BASE_URL : "http://api.openweathermap.org/data/2.5/weather?",
    LAT : "lat=",
    LON : "lon=",
    APP_KEY : "APPID=e0d69044d0b30f6f989f67de783e0cee",
	UNITS : "units=",
	FAHRENHEIGHT: "imperial",
	CELCIUS : "metric",
    test : 1

}


var classname = document.getElementsByClassName("moodbutton");

var clickMoodButton = function() {
    var id_attr = this.getAttribute("id");
    run_save(parseInt(id_attr.substring(6)));
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
        var url = OpenWeatherConstants.BASE_URL + OpenWeatherConstants.LAT + startPos.coords.latitude + "&" +
            OpenWeatherConstants.LON + startPos.coords.longitude + "&" + OpenWeatherConstants.APP_KEY + "&" +
			OpenWeatherConstants.UNITS + OpenWeatherConstants.FAHRENHEIGHT;
        console.log(url);
        invokeWeatherApi(url);

    };
    var geoError = function(error) {
        console.log('Error occurred. Error code: ' + error.code);
    };

    var invokeWeatherApi = function (url) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);
                var temperature = response.main.temp;
                var d = new Date();

                var key = d.toISOString();
                var object_value = {'date' : d.toISOString().substring(0, 10), 'temp': temperature , 'mood': buttoncode};
                var jsonfile = {};
                jsonfile[key] = object_value;

                chrome.storage.sync.set(jsonfile, function() {
                    // Notify that we saved.
                    console.log('Settings saved');

                });

                chrome.storage.sync.get(null, function (temp) {
                    console.log(JSON.stringify(temp));
                });
            }
        };
        xhr.open("GET", url, true);
        xhr.send();
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
};