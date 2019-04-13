// Store our API endpoint inside queryUrl
var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
  "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

// Perform a GET request to the query URL
d3.json(queryUrl, function (earthquakedata) {
  d3.json("PB2002_plates.json", function (platedata) {
    // Once we get a response, send the features objects to the createFeatures function
    console.log(earthquakedata.features);
    console.log(platedata.features);
    createFeatures(earthquakedata.features, platedata.features);
  })
});

function markerSize(magnitude) {
  return magnitude * 5;
}

function markerColor(intensity) {
  if (intensity < 1) { return "#b3ef1a"; }
  else if (intensity < 2) { return "#ddef19"; }
  else if (intensity < 3) { return "#efc419"; }
  else if (intensity < 4) { return "#ef8419"; }
  else if (intensity < 5) { return "#ef6019"; }
  else { return "#ef4019"; }
}

function createFeatures(earthquakeData, plateData) {

  var earthquakeMarkers = [];
  var plateMarkers = [];

  earthquakeData.forEach((quakeElement) => {
    // Setting the marker radius for the state by passing population into the markerSize function
    earthquakeMarkers.push(
      L.circleMarker([quakeElement.geometry.coordinates[1], quakeElement.geometry.coordinates[0]], {
        stroke: true,
        fillOpacity: 0.75,
        color: "black",
        weight: .5,
        fillColor: markerColor(quakeElement.properties.mag),
        radius: markerSize(quakeElement.properties.mag)
      }).bindPopup("<p>" + "Magnitude: " + quakeElement.properties.mag + "</p>")
    );
  })

  plateData.forEach((plateElement) => {
    element = [];
    plateElement.geometry.coordinates.forEach((plateGroup) => {
      group = [];
      plateGroup.forEach((plateCoords) => {
        group.push([plateCoords[1], plateCoords[0]])
      })
      element.push(group)
    })
    plateMarkers.push(
      L.polyline(element, {
        color: "orange"
      }))
  })

  var earthquakes = L.layerGroup(earthquakeMarkers);
  var plates = L.layerGroup(plateMarkers);

  createMap(earthquakes, plates);
}

function createMap(earthquakes, plates) {

  // Define streetmap and darkmap layers
  var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": lightmap,
    "Outdoors": outdoors
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Fault Lines": plates
  };

  console.log(earthquakes);
  console.log(plates);

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [satellite, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + markerColor(grades[i]) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(myMap);
}



