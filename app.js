var fs 	    = require('fs');
var request = require('request');
var cheerio = require('cheerio');

// Battles to scrape
var battles = [ "Battle_of_Edgehill", 
		"Battle_of_Adwalton_Moor", 
		"Battle_of_Marston_Moor",
		"Battle_of_Naseby",
		"Battle_of_Winceby",
		"Battle_of_Lansdowne",
		"Battle_of_Langport",
		"Second_Battle_of_Newbury"];

var battlesData = [];

for(var i = 0; i < battles.length; i++) {
	request({
		uri: "http://en.wikipedia.org/wiki/" + battles[i]
	}, function (err, response, body) {
		// Initialize cheerio
		var $ = cheerio.load(body);

		// Select geo location a each page + get the nodes text content
		var geolocation = $("span.geo-dec");
		var geoString = geolocation.html();

		// Split the latitude and longditude values into an array
		latLng = geoString.split(' ');

		// Isolate unwanted text in strings
		var dirtLat = latLng[0].replace(/(\d)+\...../g, '');
		var dirtLng = latLng[1].replace(/(\d)+\...../g, '');

		// Remove unwanted text from strings
		var lat = latLng[0].replace(dirtLat, '');
		var lng = latLng[1].replace(dirtLng, '');

		// Assign the page elements to a variables
		var title = $("#firstHeading span").html();
		var location = $(".location a").html();
		var date = $("th[style] + td").html();
		var outcome = $("tr:last-child th[style] + td").html();

		// Assign values to an object
		var battleData = {
			lat: lat,
			lng: lng,
			date: date,
			title: title,
			location: location,
			outcome: outcome
		};

		// Add the object to an array if battles
		battlesData.push(battleData);

		// Saves data as a json file when all battles are scraped
		if(battlesData.length === battles.length) {
			saveFile(battlesData, "civil-war-battles");
		}
	});
}

// Saves file in JSON format
function saveFile(data, fileName) {
	outputRoute = __dirname + "/" + fileName + ".json";

	fs.writeFile(outputRoute, JSON.stringify(data, null, 4), function (err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	    }
	}); 
}
