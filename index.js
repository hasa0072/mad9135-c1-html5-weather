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
  // update the location
  document.getElementById("location").innerHTML = location;

  // update the status
  document.getElementById("status").innerHTML = forecast.current.weather[0].description;

  // update the current temperature
  document.getElementById("temp").innerHTML = forecast.current.temp;

  // update the hi and lo temperatures
  let {hi, lo} = getHighestAndLowestTemps(forecast)
  console.log(hi, lo);
  document.getElementById("high").innerHTML = hi;
  document.getElementById("low").innerHTML = lo;
}

function getHighestAndLowestTemps(forecast) {
  let hi = -300; // below absolute zero is not possible, safe to use -300
  let lo = 100000; // not a realistic lo value, safe to use 100000 degrees for initial value
  forecast.hourly.forEach((fc) => {
    if (fc.temp > hi) {
      hi = fc.temp
    }

    if (fc.temp < lo) {
      lo = fc.temp
    }
  })

  return {hi: hi, lo: lo}
}