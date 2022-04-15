// Global variable for storing chosen route.
var route = null;

function load() {
    var street = document.getElementById('street');
    var routeOption = document.getElementById('routes');
    var form = document.getElementsByTagName('form')[0];
    var timer;

    street.addEventListener('keyup', function() {
        clearTimeout(timer); 
        route = null;
        timer = setTimeout(getStops(street.value), 1000);
    })

    routeOption.addEventListener('change', function() {
        route = routeOption.value;
    });

    form.addEventListener('submit', getBuses);

    getStops('Princess');
}

// Get the bus stop options.
function getStops(street) {
    if (street == '') {
        deleteRoutes();
        getStops('Princess');
        return;
    }

    deleteBuses();

    var stops;
    var url = `https://api.winnipegtransit.com/v3/stops:${street}.json?api-key=1VgfwfCJPVy2HWuQifKE`;
    fetch(url)
    .then( (result) => {
        return result.json();
    })
    .then( (data) => {
        stops = data.stops;
        deleteRoutes();
        for (let stop of stops) {
            displayRoutes(stop.name, stop.key);            
        }
    });
}

// Get the bus routes. 
function getBuses(event) {
    event.preventDefault();
    if (route === null) {
        deleteBuses();
        var newUl = document.createElement('ul');
        newUl.innerHTML = 'Please select a bus stop.';
        document.getElementsByTagName('div')[0].appendChild(newUl);
        return;
    }
    var routeName, arrival, stops, newUl;
    var buses = [];
    var now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false });
    var url = `https://api.winnipegtransit.com/v3/stops/${route}/schedule.json?&api-key=1VgfwfCJPVy2HWuQifKE&start=${now}&end=23:59&max-results-per-route=100`;
    var encodedURL = encodeURI(url);
    fetch(encodedURL)
    .then( (result) => {
        return result.json();
    })
    .then( (data) => {
        stops = data["stop-schedule"]["route-schedules"];
        for (let stop of stops) {
            routeName = stop.route.name;
            for (let bus of stop["scheduled-stops"]) {
                try {
                    arrival = new Date(bus.times.arrival.estimated);
                } catch (TypeError) {
                    deleteBuses();
                    newUl = document.createElement('ul');
                    newUl.innerHTML = 'Insufficient data for this route.';
                    document.getElementsByTagName('div')[0].appendChild(newUl);
                    return;
                }
                buses.push([routeName + ' ' + bus.variant.name, ' estimated to arrive at ' + 
                    arrival.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false })])
            }   
        } 
        displayBuses(routeName, buses);   
    });
}

// Display bus routes as select options.
function displayRoutes(name, key){
	let newOption = document.createElement('option');

	newOption.innerHTML = name;
    newOption.value = key;
    newOption.className = 'route';

	document.getElementById('routes').appendChild(newOption);
}

// Display the buses via unordered list.
function displayBuses(routeName, buses) {
    var newUl = document.createElement('ul');
    var newLi = document.createElement('li');

    deleteBuses();
    repeat(buses);

    newUl.id = routeName;
    document.getElementsByTagName('div')[0].appendChild(newUl);

    filterArray(buses).forEach(bus => {
        newLi.innerHTML = bus;
        document.getElementById(routeName).appendChild(newLi.cloneNode(true))
    });
}

// Filters array to make sure theres only 100 items.
function filterArray(buses) {
    const MAX = 100;
    while (buses.length > MAX) {
        buses.pop();
    }
    return buses;
}

// Delete routes in selection box.
function deleteRoutes() {
    var routes = document.getElementsByClassName('route');
    while (routes.length > 0 ) {
        routes[0].remove();
    }
    document.getElementsByTagName('select')[0].selectedIndex = 0;
}

// Delete the displayed bus info.
function deleteBuses() {
    var div = document.getElementsByTagName('div')[0];
    div.innerHTML = '';
}

// Repeat the sort for each item in an array.
function repeat(buses) {
    for (let i = 0; i < buses.length - 1; i++) {
        bubble(buses);
    }
}

// Sort buses by arrival time from earliest to latest.
function bubble(buses) {
    var temp, bus1, bus2, date1, date2;
    for (let i = 0; i < buses.length - 1; i++) {
        bus1 = buses[i][1].substr(buses[i][1].length - 5);
        bus2 = buses[i+1][1].substr(buses[i][1].length - 5);
        date1 = new Date(null, null, null, bus1.substr(0, bus1.length-3), bus1.slice(-2));
        date2 = new Date(null, null, null, bus2.substr(0, bus2.length-3), bus2.slice(-2));
        if (date1 > date2) {
            temp = buses[i];
            buses[i] = buses[i+1];
            buses[i+1] = temp;
        }
    }
    return buses;
}

document.addEventListener("DOMContentLoaded", load);