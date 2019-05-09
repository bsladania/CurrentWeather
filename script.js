$(document).on('pagecreate','#homepage',function(){

	var weekday = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	var minmumtemp = new Array();
	var maximumtemp = new Array();
	var chartLabels = new Array();
	var recentCities = new Array();
	var dateRecieved;
	var acceptedFormat;
	var separate;
	var latitude;
	var longitude;
	var url;
	$('#input').val('');
	$('#myChart').hide();
	load();

//load function populates the predefined cities in the select element
	function load()
	{
		currentLocation();
		refreshRecentSearch();
		$.getJSON('pre-defined-cities.json')
			.done(function(data){
				$('#famouscities').empty();
				$.each(data.cities,function(index,name){
					var citiesTemplate = $('#CitiesTemp').html();
					var generateCityHtml = Handlebars.compile(citiesTemplate);

					var data = {
						"cityValue":name,
						"cityNum":index+1,
						"cityName":name
					};
					console.log(generateCityHtml(data));
					var html = generateCityHtml(data);
					$("#famouscities").append(html);
					//$('<option value="'+ name +'"></option>').append((index+1) +'.  '+name).appendTo('#famouscities');	
				});				
		});
		
	}
	
	//refreshes the recent searches group in select
	function refreshRecentSearch(){
		if(localStorage.recentSearch){
			recentCities = JSON.parse(localStorage.recentSearch);
			$('#recentsearches').empty();
			$.each(recentCities,function(index,city){
				$('<option value="'+ city +'"></option>').append((index+1) +'.  '+city).appendTo('#recentsearches');	
			});
			
		}
	}
	
	function currentLocation(){
		if(navigator.geolocation){
			navigator.geolocation.getCurrentPosition(showPosition, showError);
		}
	}

	function showPosition(position)
	{	
		latitude = position.coords.latitude;
		longitude = position.coords.longitude;
		url = 'http://api.apixu.com/v1/forecast.json?key=2b0d6ec6d55e48efa49225215171208&q=' + latitude + '%2C' + longitude + '&days=7';
		currentWeatherData(url);	
	}


	function showError(error) {
	    switch(error.code) {
	        case error.PERMISSION_DENIED:
	            $('<li></li>').append('<h1>User denied the request for Geolocation.</h1>').appendTo('#currentWeather');
	            $('#currentWeather').listview('refresh');
	            break;
	        case error.POSITION_UNAVAILABLE:
	            $('<li></li>').append('<h1>Location information is unavailable.</h1>').appendTo('#currentWeather');
	            $('#currentWeather').listview('refresh');
	            break;
	        case error.TIMEOUT:
	            $('<li></li>').append('<h1>The request to get user location timed out.</h1>').appendTo('#currentWeather');
	            $('#currentWeather').listview('refresh');
	            break;
	        case error.UNKNOWN_ERROR:
	            $('<li></li>').append('<h1>An unknown error occurred.</h1>').appendTo('#currentWeather');
	            $('#currentWeather').listview('refresh');
	            break;
	    }
	};

//gets the data for the current location or searched or selected location and updates the content
	function currentWeatherData(url){
		
		var dataFill = $('#currentWeather');
		var todayBrief = $('#todayWeatherBrief');
		var todayInfo = $('#todayWeatherInfo');
		$(todayBrief).empty();
		$(todayInfo).empty();
		$('#day').text("");
		$(dataFill).empty();
		minmumtemp = [];
		maximumtemp = [];
		chartLabels = [];
		$.getJSON(url)
			.done(function(currentData){
				dateRecieved = currentData.forecast.forecastday["0"].date;
				separate = dateRecieved.split('-');
				acceptedFormat = new Date((separate[1] + '/' + separate[2] + '/' + separate[0]));
				$('#day').append('<h3 align="center">'+weekday[acceptedFormat.getDay()]+'</h3>');
				$('<li style="height: 160px;"></li>').append('<h1 align="center">'+ currentData.location.name +'</h1> <p align="center">' + currentData.current.condition.text 
					+ '</p> <h1 align="center">' + currentData.current.temp_c + '<i class="wi wi-celsius"></i><br/><img src="http:' + currentData.current.condition.icon 
					+ '" /></h1>').appendTo(todayBrief);
				$.each(currentData.forecast.forecastday,function(index,object){
					dateRecieved = currentData.forecast.forecastday[index].date;
					separate = dateRecieved.split('-');
					acceptedFormat = new Date((separate[1] + '/' + separate[2] + '/' + separate[0]));
					$('<li></li>').append('<h3 align="center">' +  weekday[acceptedFormat.getDay()] + '&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;' 
						+ currentData.forecast.forecastday[index].day.condition.text + '&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;[' + currentData.forecast.forecastday[index].day.mintemp_c +
						'&nbsp;&nbsp;|&nbsp;&nbsp;'+ currentData.forecast.forecastday[index].day.maxtemp_c + ']&nbsp;&nbsp;&nbsp;<img src="http:' 
						+ currentData.forecast.forecastday[index].day.condition.icon + '" /> '  + '</h3>').appendTo(dataFill);
					minmumtemp.push(currentData.forecast.forecastday[index].day.mintemp_c);
					maximumtemp.push(currentData.forecast.forecastday[index].day.maxtemp_c);
					chartLabels.push(weekday[acceptedFormat.getDay()]);
				});

				$('<li style="height: 160px;"></li>').append('<h3 align="center">Today:&nbsp;' + currentData.current.condition.text + ' currently. It is ' + currentData.current.temp_c 
					+ '<i class="wi wi-celsius"></i>; the high will be ' + currentData.forecast.forecastday["0"].day.maxtemp_c 
					+ '<i class="wi wi-celsius"></i>.</h3><h3 style="margin-left: 22%;"><span style="display:inline-block; width: 90px; text-align: right; margin-right: 15px">Sunrise: </span>'+ currentData.forecast.forecastday["0"].astro.sunrise + ' <i class="wi wi-sunrise"></i><br/><span style="display:inline-block; width: 90px; text-align: right; margin-right: 15px"> Sunset: </span>'
					+ currentData.forecast.forecastday["0"].astro.sunset + ' <i class="wi wi-sunset"></i><br/><span style="display:inline-block; width: 90px; text-align: right; margin-right: 15px">Humidity: </span>' + currentData.current.humidity + '% <i class="wi wi-humidity"></i><br/><span style="display:inline-block; width: 90px; text-align: right; margin-right: 15px"> Wind: </span>' 
					+ currentData.current.wind_dir + ' ' + currentData.current.wind_kph + 'Km/hr <i class="wi wi-windy"></i><br/><span style="display:inline-block; width: 90px; text-align: right; margin-right: 15px"> Feels Like: </span>'
					+ currentData.current.feelslike_c + '<i class="wi wi-celsius"></i><br/>'+'</h3>').appendTo(todayInfo);
				$(todayInfo).listview('refresh');
				$(todayBrief).listview('refresh');
				$(dataFill).listview('refresh');
				chartMaker();
			})
			.fail(function(){
				$('<li></li>').append('<h1>APIXU API is not responding!! Or You could have misspelt city name!!</h1>').appendTo(dataFill);
				$(dataFill).listview('refresh');
				$('#myChart').hide();
			});
			
	};	
		
//send the city name to the api from search box
	$(document).on('click','#submit',function(event){
		event.preventDefault();
		var val = $.trim($('#input').val());
		$('#input').val('');
		$('#myChart').hide();
		if(val.length>0){
			recentCities = [];
			if(localStorage.recentSearch){
			recentCities = JSON.parse(localStorage.recentSearch);
			}
			recentCities.push(val);
			localStorage.recentSearch = JSON.stringify(recentCities);
		val = val.replace(' ', '+');
		url = "http://api.apixu.com/v1/forecast.json?key=2b0d6ec6d55e48efa49225215171208&q="+ val +"&days=7";
		currentWeatherData(url);
		refreshRecentSearch();
		}
	});	

//send the city name to the weather api from selection control
	$(document).on('click','option',function(event){
		event.preventDefault();
		console.log("clicked");
		$('#myChart').hide();
		var val = $(this).attr('value');
		url = "http://api.apixu.com/v1/forecast.json?key=2b0d6ec6d55e48efa49225215171208&q="+ val +"&days=7";
		recentCities = [];
		if(localStorage.recentSearch){
		recentCities = JSON.parse(localStorage.recentSearch);
		}
		recentCities.push(val);
		localStorage.recentSearch = JSON.stringify(recentCities);
		currentWeatherData(url);
		refreshRecentSearch();
		
	});	

//creates the chart with the available data for 7 days
	function chartMaker(){
		var ctx = document.getElementById("myChart").getContext('2d');
		var myChart = new Chart(ctx, {
		    type: 'bar',
		    data: {
		        labels: chartLabels,
		        datasets: [{
		            label: 'Minimum temperature',
		            data: minmumtemp,
		            backgroundColor: [
		                'rgba(255, 99, 132, 0.2)',
		                'rgba(54, 162, 235, 0.2)',
		                'rgba(255, 206, 86, 0.2)',
		                'rgba(75, 192, 192, 0.2)',
		                'rgba(153, 102, 255, 0.2)',
		                'rgba(255, 159, 64, 0.2)',
		                'rgba(204, 230, 255, 0.2)'
		            ],
		            borderColor: [
		                'rgba(255,99,132,1)',
		                'rgba(54, 162, 235, 1)',
		                'rgba(255, 206, 86, 1)',
		                'rgba(75, 192, 192, 1)',
		                'rgba(153, 102, 255, 1)',
		                'rgba(255, 159, 64, 1)',
		                'rgba(0, 64, 128, 1)'
		            ],
		            borderWidth: 1
		        },
		        {
		        	label: 'Maximum temperature',
		        	data: maximumtemp,
		        	backgroundColor: [
		        	     'rgba(255, 99, 132, 0.2)',
		        	     'rgba(54, 162, 235, 0.2)',
		        	     'rgba(255, 206, 86, 0.2)',
		        	     'rgba(75, 192, 192, 0.2)',
		        	     'rgba(153, 102, 255, 0.2)',
		        	     'rgba(255, 159, 64, 0.2)',
		        	     'rgba(204, 230, 255, 0.2)'
		        	],
		        	borderColor: [
		        	     'rgba(255,99,132,1)',
		        	     'rgba(54, 162, 235, 1)',
		        	     'rgba(255, 206, 86, 1)',
		        	     'rgba(75, 192, 192, 1)',
		        	     'rgba(153, 102, 255, 1)',
		        	     'rgba(255, 159, 64, 1)',
		        	     'rgba(0, 64, 128, 1)'
		        	],
		        	borderWidth: 1
		        }

		        ]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        }
		    }
		});
		$('#myChart').show();
	};

//change the page to homepage
	$("#goHome").on('click', function(){
		$.mobile.changePage("#homepage");
	});
//change the page to chart page
	$("#goChart").on('click', function(){
		$.mobile.changePage("#chart");
	});
});