////////////////////////////////////////////////////////
////////////////////////SET UP ALARM////////////////////
////////////////////////////////////////////////////////
var alarmName = "popup_alarm";

var OpenWeatherConstants = {

    BASE_URL : "http://api.openweathermap.org/data/2.5/weather?",
    LAT : "lat=",
    LON : "lon=",
	APP_KEY : "APPID=e0d69044d0b30f6f989f67de783e0cee"

}

chrome.alarms.create(alarmName,
{
	delayInMinutes: 0,
	periodInMinutes: 1000
});

////////////////////////////////////////////////////////
///////////////////ASK QUESTION/////////////////////////
////////////////////////////////////////////////////////
var askQuestion = function()
{
	var win = window.open("window.html", '_blank');
	win.focus();
}

////////////////////////////////////////////////////////
///////////////////ON ALARM FINISHED////////////////////
////////////////////////////////////////////////////////
chrome.alarms.onAlarm.addListener(function(alarm)
{
	askQuestion();
});

////////////////////////////////////////////////////////
///////////////////ON WINDOW CLOSED/////////////////////
////////////////////////////////////////////////////////
window.addEventListener('unload', function(event)
{
	alert("CLOSED")
});

window.addEventListener('onload', function(event)
{
    console.log("You legged!");
});

////////////////////////////////////////////////////////
////////////////////////ON ICON CLICKED/////////////////
////////////////////////////////////////////////////////
chrome.browserAction.onClicked.addListener(function(tab)
{
	askQuestion();


});

chrome.browserAction.onClicked.addListener(function(tab)
{

    var startPos;
    var geoOptions = {
        timeout: 10 * 1000
    }

    var geoSuccess = function(position) {
        startPos = position;
        var url = OpenWeatherConstants.BASE_URL + OpenWeatherConstants.LAT + startPos.coords.latitude + "&" +
            OpenWeatherConstants.LON + startPos.coords.longitude + "&" + OpenWeatherConstants.APP_KEY;
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
                console.log(xhr.responseText);
                chrome.storage.sync.set({'value': xhr.responseText}, function() {
                    // Notify that we saved.
                    console.log('Settings saved');
                });
            }
        }; // Implemented elsewhere.
        xhr.open("GET", url, true);
        xhr.send();
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);






});
