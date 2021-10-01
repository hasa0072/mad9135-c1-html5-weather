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
    updateDailyTempHTML(forecast)
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

function updateDailyTempHTML(forecast) {
  let innerHTML = ``
  let count = 6;
  forecast.daily.slice(1).forEach((fc) => {
    if (count == 0) {
      return
    }
    innerHTML += forecastToDailyHTML(fc)
    count -= 1
  })

  document.getElementById("daily").innerHTML = innerHTML
}

/*
 * Utility functions below this line
 */

// Finds highest and lowest temperature for today's forecast
function getHighestAndLowestTemps(forecast) {
  // if we have daily in the forecast, then daily[0] is today.
  // take max and min of today
  if ('daily' in forecast) {
    return {hi: forecast.daily[0].temp.max, lo: forecast.daily[0].temp.min}
  } else if ('max' in forecast.temp && 'min' in forecast.temp) {
    return {hi: forecast.temp.max, lo: forecast.temp.min}
  }

  return null
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

// Convert given forcest to an HTML div with hour, status and temp
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

function forecastToDailyHTML(forecast) {
  let {hi, lo} = getHighestAndLowestTemps(forecast)
  let date = new Date(forecast.dt * 1000)
  let day = date.toLocaleDateString('en-US', { weekday: 'long' });

  // For daily forecast, we don't need it to be too much accurate
  hi = Math.round(hi)
  lo = Math.round(lo)

  return `
      <div class="row">
        <div class="col-5">
          <span>${day}</span>
        </div>

        <div class="col-3">
          <span>ic</span>
          <span>%${forecast.humidity}</span>
        </div>

        <div class="col-1 offset-1">
          <span>${hi}</span>
        </div>

        <div class="col-1">
          <span>${lo}</span>
        </div>
      </div>
  `
}