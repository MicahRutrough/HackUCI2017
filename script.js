

var OpenWeatherConstants = {

    BASE_URL : "http://api.openweathermap.org/data/2.5/weather?",
    LAT : "lat=",
    LON : "lon=",
    APP_KEY : "APPID=e0d69044d0b30f6f989f67de783e0cee",
	UNITS : "units=",
	FAHRENHEIGHT: "imperial",
	CELCIUS : "metric"

}

document.getElementById("button1").addEventListener("click", function()
{
	alert("Pressed button1");
	run_save("button1");
});

document.getElementById("button2").addEventListener("click", function()
{
	alert("Pressed button2");
    run_save("button2");
});

document.getElementById("button3").addEventListener("click", function()
{
	alert("Pressed button3");
    run_save("button3");
});


function run_save(button_pressed)
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

				console.log(temperature);

                chrome.storage.sync.clear();

                var empty;
                chrome.storage.sync.get('data', function(item){
                    empty = JSON.stringify(item) == "{}"
                    console.log(empty);

                });
                if(empty == true){
                    var items =  [];
                    items.push({'date': d.getDate(), 'temp': temperature , 'mood': button_pressed});
                    chrome.storage.sync.set({'data': items}, function() {
                        // Notify that we saved.
                        console.log('Settings saved1');
                    });

                    chrome.storage.sync.get('data', function(item){
                        console.log(JSON.stringify(item));
                    });
                }
                else{
                    var thearray;
                    chrome.storage.sync.get('data', function(item){
                        thearray = item.push({'date': d.getDate(), 'temp': temperature , 'mood': button_pressed});
                    });
                    chrome.storage.sync.set({'data': thearray}, function() {
                        // Notify that we saved.
                        console.log('Settings saved2');
                    });
                    chrome.storage.sync.get('data', function(item){
                        console.log(JSON.stringify(item));
                    });

                }






                /*try{
                    var keyCheck = chrome.storage.sync.get('data');

                    chrome.storage.sync.set({'value': xhr.responseText}, function() {
                        // Notify that we saved.
                        console.log('Settings saved');
                    });
                }
                catch(Exception){
                    console.log(keyCheck);

                    var items =  [];

					items.push({'date': d.getDate(), 'temp': temperature , 'mood': button_pressed});


                    chrome.storage.sync.set({'data': items}, function() {
                        // Notify that we saved.
                        console.log('Settings saved');
                    });

                    chrome.storage.sync.get('data', function(item){
                        console.log("Retrieve" + JSON.stringify(item))
                    });


				}*/




            }
        }; // Implemented elsewhere.
        xhr.open("GET", url, true);
        xhr.send();
    };

    navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);


};