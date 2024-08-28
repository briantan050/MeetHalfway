// actions.js

// Function to handle marker click events

// Declare a global variable to store the currently open InfoWindow
let openInfoWindow = null; 

// Function to handle marker click events
function setupMarkerClickListener(marker, locationName, organisation) {
  // Create the content for the info window, including the organization
  const infowindowContent = `<div><strong>${locationName}</strong><br>Organization: ${organisation}</div>`;
  
  const infowindow = new google.maps.InfoWindow({
    content: infowindowContent,
  });

  marker.addListener("click", () => {
    // Close any open InfoWindow
    if (openInfoWindow) {
      openInfoWindow.close();
    }

    // Open the new InfoWindow
    infowindow.open(marker.getMap(), marker);
    openInfoWindow = infowindow;

    // Set the destination input box with the location name
    document.getElementById("pac-input-4").value = locationName;
  });
}

// Function to close the InfoWindow when the map is clicked
function setupMapClickListener(map) {
  map.addListener("click", () => {
    if (openInfoWindow) {
      openInfoWindow.close();
      openInfoWindow = null;
    }
  });
}

// Helper function to get simplified address
function getSimplifiedAddress(address) {
  const addressParts = address.split(',');
  return addressParts.length > 1 ? addressParts[0] : address;
}

// Export the functions so they can be used in other scripts
window.setupMarkerClickListener = setupMarkerClickListener;
window.setupMapClickListener = setupMapClickListener;
window.getSimplifiedAddress = getSimplifiedAddress;


// Helper function to get simplified address
function getSimplifiedAddress(address) {
  const addressParts = address.split(',');
  return addressParts.length > 1 ? addressParts[0] : address;
}

// Function to calculate and display the route and update the info bar
function calculateAndDisplayRoute(map, markers) {
  const directionsService = new google.maps.DirectionsService();

  // Iterate through the first three markers (starting locations)
  for (let i = 0; i < 3; i++) {
    directionsService.route(
      {
        origin: markers[i].getPosition(),
        destination: markers[3].getPosition(),
        travelMode: google.maps.TravelMode.TRANSIT,
      },
      (response, status) => {
        const infoElementId = `info-content-${i + 1}`;
        const headingElementId = `info-heading-${i + 1}`;

        if (status === google.maps.DirectionsStatus.OK) {
          const legs = response.routes[0].legs[0];
          const steps = legs.steps;

          // Simplify the start and end addresses
          const simplifiedStartAddress = getSimplifiedAddress(legs.start_address);
          const simplifiedEndAddress = getSimplifiedAddress(legs.end_address);

          // Update the heading with the simplified start and destination names
          document.getElementById(headingElementId).textContent = `${simplifiedStartAddress} to ${simplifiedEndAddress}`;

          let summary = '';
          let totalTimeInSeconds = 0;

          steps.forEach(step => {
            totalTimeInSeconds += step.duration.value; // Sum up the duration in seconds

            if (step.travel_mode === "WALKING") {
              summary += `Walking: ${step.duration.text}<br>`;
              summary += `<br>`;
            } else if (step.travel_mode === "TRANSIT") {
              const transitDetails = step.transit;
              summary += `From: ${transitDetails.departure_stop.name} to ${transitDetails.arrival_stop.name}<br>`;
              summary += `${transitDetails.line.vehicle.type} (${transitDetails.line.short_name}): ${step.duration.text}<br>`;
              summary += `<br>`;
            }
          });

          // Convert total time from seconds to a readable format
          const totalMinutes = Math.floor(totalTimeInSeconds / 60);
          const totalHours = Math.floor(totalMinutes / 60);
          const readableTotalTime = `${totalHours > 0 ? totalHours + ' hr ' : ''}${totalMinutes % 60} min`;

          summary += `Total Travel Time: ${readableTotalTime}<br><br>`;

          // Generate Google Maps route link
          const routeUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(legs.start_address)}&destination=${encodeURIComponent(legs.end_address)}&travelmode=transit`;
          summary += `<a href="${routeUrl}" target="_blank">View on Google Maps</a>`;

          document.getElementById(infoElementId).innerHTML = summary;
        } else {
          document.getElementById(headingElementId).textContent = "Unable to retrieve route information.";
          document.getElementById(infoElementId).innerHTML = "Unable to retrieve route information.";
        }
      }
    );
  }
}

// Export the functions so they can be used in other scripts
window.setupMarkerClickListener = setupMarkerClickListener;
window.setupMapClickListener = setupMapClickListener;
window.calculateAndDisplayRoute = calculateAndDisplayRoute;