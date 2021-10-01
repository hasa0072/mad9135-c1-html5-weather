import { getForecast, createWeatherIcon } from './weather.service.js';
import { getGeolocation } from './map.service.js';

main();

// This is a demo of how to use the two API services.
// You should replace this with your own application logic.
async function main() {
  const location = 'Algonquin College, Nepean, ON, CA';
  try {
    const coord = await getGeolocation(location);
    const forecast = await getForecast({ coord });
    console.log(forecast);

    updateCurrentTempHTML(location, forecast)
  } catch (error) {
    console.log(error.message);
  }
}

function updateCurrentTempHTML(location, forecast) {
  document.getElementById("location").innerHTML = location;
}