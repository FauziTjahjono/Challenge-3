mapboxgl.accessToken = 'pk.eyJ1IjoiZnRqYWhqb25vIiwiYSI6ImNrOTZ3emNhcTBqOWwzb3BjNTFhYWY3bGoifQ.Km68XB-mPb5ZDi41zSwzJQ';



                // Mapview
                var map = new mapboxgl.Map({
                  container: 'map',
                  style: 'mapbox://styles/mapbox/outdoors-v11',
                  center: [4.318911
                           , 52.062165],
                  zoom: 12
                });


                // Routeplannerpanel
                map.addControl(
                  new MapboxDirections({
                    accessToken: mapboxgl.accessToken
                  }),
                  'top-right'
                );


                //check if browser supports geolocation
                if('geolocation' in navigator){
                  navigator.geolocation.getCurrentPosition(setPosition, showError);
                }
                else {
                  notificationElement.style.display = "block";
                  notificationElement.innerHTML = "<p>Browser does not support  Geolocation </p>";
                }

                //set users position
                function setPosition(position){
                  let latitude = position.coords.latitude;
                  let longitude = position.coords.longitude;

                  
                }

                // show error when there is an issue with geolocation service
                function showError(error){
                  notificationElement.style.display = "block";
                  notificationElement.innerHTML = `<p>${error.message} </p>`;
                }
               

                // GeoJSON object to hold our measurement features
                var geojson = {
                'type': 'FeatureCollection',
                'features': []
                };

                // Used to draw a line between points
                var linestring = {
                'type': 'Feature',
                'geometry': {
                'type': 'LineString',
                'coordinates': []
                }
                };

                map.on('load', function() {
                map.addSource('geojson', {
                'type': 'geojson',
                'data': geojson
                });

                // Add styles to the map
                map.addLayer({
                id: 'measure-points',
                type: 'circle',
                source: 'geojson',
                paint: {
                'circle-radius': 5,
                'circle-color': '#000'
                },
                filter: ['in', '$type', 'Point']
                });
                map.addLayer({
                id: 'measure-lines',
                type: 'line',
                source: 'geojson',
                layout: {
                'line-cap': 'round',
                'line-join': 'round'
                },
                paint: {
                'line-color': '#000',
                'line-width': 2.5
                },
                filter: ['in', '$type', 'LineString']
                });

                map.on('click', function(e) {
                var features = map.queryRenderedFeatures(e.point, {
                layers: ['measure-points']
                });

                // Remove the linestring from the group
                // So we can redraw it based on the points collection
                if (geojson.features.length > 1) geojson.features.pop();

                // Clear the Distance container to populate it with a new value
                distanceContainer.innerHTML = '';

                // If a feature was clicked, remove it from the map
                if (features.length) {
                var id = features[0].properties.id;
                geojson.features = geojson.features.filter(function(point) {
                return point.properties.id !== id;
                });
                } else {
                var point = {
                'type': 'Feature',
                'geometry': {
                'type': 'Point',
                'coordinates': [e.lngLat.lng, e.lngLat.lat]
                },
                'properties': {
                'id': String(new Date().getTime())
                }
                };

                geojson.features.push(point);
                }

                if (geojson.features.length > 1) {
                linestring.geometry.coordinates = geojson.features.map(function(
                point
                ) {
                return point.geometry.coordinates;
                });

                geojson.features.push(linestring);

                    
                // Populate the distanceContainer with total distance
                var value = document.createElement('pre');
                value.textContent =
                'Afstand van A naar B: ' +
                turf.length(linestring).toLocaleString() +
                'km';
                distanceContainer.appendChild(value);
                }

                map.getSource('geojson').setData(geojson);
                });
                });

                map.on('mousemove', function(e) {
                var features = map.queryRenderedFeatures(e.point, {
                layers: ['measure-points']
                });
                    
                    
                // UI indicator for clicking/hovering a point on the map
                map.getCanvas().style.cursor = features.length
                ? 'pointer'
                : 'crosshair';
                });

                
                // Weathermap code

                var input = document.querySelector(".inputTekst");
                var knop = document.querySelector(".knop");
                var temperatuur = document.querySelector(".temperatuur");
                var beschrijving = document.querySelector(".beschrijving");
                var locatie = document.querySelector(".locatie");
                var icoon = document.querySelector(".icoon");

                knop.addEventListener('click',function(name){
                    fetch('https://api.openweathermap.org/data/2.5/weather?q='+input.value+'&appid=c04807fc38ec6e70129366083d7b68c4')
                    .then(response => response.json())
                    .then(data => {
                        var locatieValue = data['name'];
                        var temperatuurValue = data['main']['temp'];
                        var beschrijvingValue = data['weather'][0]['description'];
                        var icoonValue = data['weather'][0]['icon'];

                        locatie.innerHTML = locatieValue;
                        temperatuur.innerHTML = Math.round(temperatuurValue - 272.15) + " -° C";
                        beschrijving.innerHTML = beschrijvingValue;
                        icoon.innerHTML = `<img src="icons/${icoonValue}.png"/>`;

                    })

                    .catch(err => alert("Stad is onbekend."))

                })