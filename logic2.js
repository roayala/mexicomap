/***********************************
 * Map of States of Mexico
 *
 */

// Center of the map with these to variables
var mexicoCity = [19.447417, -99.99313];
var zoomLevel = 5;

// A colorscheme in greys
var color = ["#f7f7f7", "#cccccc", "#969696", "#525252", "#000000"];

//Function Create Map that brings all the Map layers
// Create Map Layer
var greyMap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    }
);

// Create the map object with options
var map = L.map("map", {
    center: mexicoCity,
    zoom: zoomLevel
});

// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
};

info.update = function(props) {
    this._div.innerHTML =
        "<h4>Población en México</h4>" +
        (props ?
            "<b>" +
            props.name +
            "</b><br />" +
            props.provnum_ne +
            " personas / m<sup>2</sup>" :
            "Sombrea el Estado");
};

info.addTo(map);

// Clear the labels as seen in leaflet.com
map.createPane("labels");
map.getPane("labels").style.zIndex = 650;
map.getPane("labels").style.pointerEvents = "none";

// Adds a layer without labels
var positron = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
        attribution: "©OpenStreetMap, ©CartoDB"
    }
).addTo(map);

// First Style

function getColor(d) {
    return d > 100 ?
        "#000000" :
        d > 50 ?
        "#495251" :
        d > 20 ?
        "#525260" :
        d > 10 ?
        "#525252" :
        d > 5 ?
        "#969696" :
        d > 2 ?
        "#cccccc" :
        d > 1 ?
        "#f7f7f7" :
        "#ffffff";
}

//Through GeoJson Leaflet created adds info
// Variable geojson created previously
var geojson;

// Color scheme with different values
function style(feature) {
    return {
        fillColor: getColor(feature.properties.name_len),
        weight: 2,
        opacity: 1,
        color: "white",
        dashArray: "3",
        fillOpacity: 0.7
    };
}

// highlights each state
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    var layer = e.target;
    map.fitBounds(e.target.getBounds());
    layer.bindPopup(
        "<h3>" +
        layer.feature.properties.geonunit +
        "<h3><h3>" +
        layer.feature.properties.name +
        "<h3>"
    );
}

// Calls listeners for the layers in the map
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 5, 10, 20, 50, 100],
        labels = [],
        from,
        to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' +
            getColor(from + 1) +
            '"></i> ' +
            from +
            (to ? "&ndash;" + to : "+")
        );
    }

    div.innerHTML = labels.join("<br>");
    return div;
};

legend.addTo(map);

// geojson with Mexico geometries
// Creating a GeoJSON layer with the retrieved data
geojson = L.geoJson(statesMexico, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);