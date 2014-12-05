var fs 	    = require('fs');
var request = require('request');
var cheerio = require('cheerio');

// Battles to scrape
var battles = [ 
	"Battle_of_Edgehill", 
	"Battle_of_Marston_Moor",
	"Battle_of_Naseby",
	"Battle_of_Adwalton_Moor",
	"Battle_of_Lansdowne",
	"Battle_of_Langport",
	"Second_Battle_of_Newbury",
	"Battle_of_Hopton_Heath",
	"Battle_of_Torrington",
	"Battle_of_Turnham_Green"
];

var locationsData = [];
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

		// Battle data
		var outcome = $("tr:last-child th[style] + td").html();
		var sideOne = $(".infobox tr:nth-child(6) td:first-child a").html();
		var sideTwo = $(".infobox tr:nth-child(6) td:last-child a").html();
		var leaderOne = $(".infobox tr:nth-child(8) td:first-child a").html();
		var leaderTwo = $(".infobox tr:nth-child(8) td:last-child a").html();

		// For pages with varying layouts
		if(sideOne === null && sideTwo === null) {
			sideOne = $(".infobox tr:nth-child(5) td:first-child a").html();
			sideTwo = $(".infobox tr:nth-child(5) td:last-child a").html();
		}
		if(leaderOne === null && leaderTwo === null) {
			leaderOne = $(".infobox tr:nth-child(7) td:first-child a").html();
			leaderTwo = $(".infobox tr:nth-child(7) td:last-child a").html();
		}
		if(sideOne.indexOf("img") > 0) {
			console.log('running');
			var sideOne = $(".infobox tr:nth-child(6) td:nth-child(2) a").html();
		}

		// Assign values to an object
		var locationData = {
			lat: lat,
			lng: lng,
			date: date,
			location: location
		};

		var battleData = {
			title: title,
			sideOne: sideOne,
			sideTwo: sideTwo,
			leaderOne: leaderOne,
			leaderTwo: leaderTwo,
			outcome: outcome
		};

		// pushes the objects into two arrays
		locationsData.push(locationData);
		battlesData.push(battleData);

		// Saves data as a json file when all battles are scraped
		if(battlesData.length === battles.length) {
			saveFile(battlesData, "civil-war-battles-details");
		}
		if(locationsData.length === battles.length) {
			saveFile(locationsData, "civil-war-battles-locations");
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