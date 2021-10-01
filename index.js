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
    updateHourlyTempHTML(forecast)
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

function updateHourlyTempHTML(forecast) {
  // get next 6 hours of forecasts
  const N = 6;
  let fcs = getNextHoursForecast(forecast, N);
  // update hours row
  let hoursContainer = document.getElementById("hours");
  // let innerHTML = forecastToHourlyHTML(fcs[0]);
  let innerHTML = forecastToHourlyHTML(forecast.current)
  fcs.forEach((fc) => {
    innerHTML += forecastToHourlyHTML(fc)
  })

  hoursContainer.innerHTML = innerHTML
}

/*
 * Utility functions below this line
 */

// Finds highest and lowest temperature for today's forecast
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

// Get next N hours of forecast from now
function getNextHoursForecast(forecast, n) {
  let fcs = []
  let count = n
  forecast.hourly.forEach((fc) => {
    // if we have enough forecasts, return
    if (count == 0) {
      return
    }
    // skip forecasts before current time
    if (fc.dt <= forecast.current.dt) {
      return
    }

    // add until we have n forecasts
    fcs.push(fc)
    count -= 1
  })

  return fcs
}

function forecastToHourlyHTML(forecast) {
  let temp = forecast.temp
  let status = 's'
  let date = new Date(forecast.dt * 1000)
  let hour = date.getHours()
  if (hour < 12) {
    hour = `${hour}AM`
  } else if (hour == 12) {
    hour = `${hour}PM`
  } else {
    hour -= 12
    hour = `${hour}PM`
  }
  return `
  <div class="col-2">
    <div class="d-flex flex-column">
      <div id="h-hour">
        ${hour}
      </div>
      <div id="h-status">
        ${status}
      </div>
      <div id="h-temp">
        ${temp}
      </div>
    </div>
  </div>
  `
}