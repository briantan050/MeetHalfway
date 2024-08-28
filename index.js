// index.js

// Function to initialize the map
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 1.359255, lng: 103.827084 },
    zoom: 12,
    mapTypeControl: false,
  });

  const card = document.getElementById("pac-card");

  const inputs = [
    { element: document.getElementById("pac-input-1"), marker: null },
    { element: document.getElementById("pac-input-2"), marker: null },
    { element: document.getElementById("pac-input-3"), marker: null },
    { element: document.getElementById("pac-input-4"), marker: null }
  ];

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

  const autocompleteOptions = {
    fields: ["formatted_address", "geometry", "name"],
    strictBounds: false,
  };

  const markers = [];

  const autocompletes = inputs.map((input, index) => {
    const autocomplete = new google.maps.places.Autocomplete(input.element, autocompleteOptions);

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      if (input.marker) {
        input.marker.setMap(null);
        const index = markers.indexOf(input.marker);
        if (index !== -1) {
          markers.splice(index, 1);
        }
      }

      input.marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        anchorPoint: new google.maps.Point(0, -29),
      });

      markers.push(input.marker);
    });

    return autocomplete;
  });

  // Add event listener to "Start" button
  document.getElementById("start-button").addEventListener("click", () => {
    if (markers.length === 4) {
      calculateAndDisplayRoute(map, markers);
    } else {
      alert("Please enter three starting locations and one destination.");
    }
  });

  // Plot markers for locations from locations.js with different colors based on organization
  locations.forEach(location => {
    let markerIcon = "";

    // Determine marker color based on organization
    if (location.organisation === "ActiveSG") {
      markerIcon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"; // Blue marker icon
    } else if (location.organisation === "OnePA") {
      markerIcon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"; // Green marker icon
    } else if (location.organisation === "Other") {
      markerIcon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"; // Yellow marker icon
    }

    const marker = new google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map,
      title: location.name,
      icon: markerIcon,
    });

    // Set up the click listener for the marker
    setupMarkerClickListener(marker, location.name, location.organisation);
  });

  // Set up the map click listener to close any open InfoWindow
  setupMapClickListener(map);
}
