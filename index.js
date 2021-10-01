import { getForecast, createWeatherIcon } from './weather.service.js';
import { getCityAndCountry, getGeolocation } from './map.service.js';

const APP = {
  KEY: null,
  location: 'Algonquin College, Nepean, ON, CA',
  coord: null,
  city: 'Ottawa',
  country: 'Canada',
  state: 'Ontario',

  // This is a demo of how to use the two API services.
  // You should replace this with your own application logic.
  async main() {
    document.getElementById("loc-search-icon").addEventListener("click", APP.getLocation)
    document.getElementById("my-loc").addEventListener("click", APP.getCurrentLocation)
    document.getElementById("loc-search").addEventListener("keyup", (ev) => {
      ev.preventDefault()
      if (ev.code == "Enter") {
        APP.getLocation(ev)
      }
    })

    //set key based on device id
    APP.KEY = "device" in window ? "WEATHERAPP" + device.uuid : "HASA0072WEATHERAPP";

    //check local storage first
    if (localStorage.getItem(APP.KEY)) {
      let str = localStorage.getItem(APP.KEY);
      APP.coord = JSON.parse(str);
    }
    APP.updatePage()
  },

  async updatePage() {
    if (APP.coord != null) {
      localStorage.setItem(APP.KEY, JSON.stringify(APP.coord));
    }

    try {
      const coord = APP.coord
      const forecast = await getForecast( {coord});
      console.log(forecast);

      let loc = await getCityAndCountry(APP.coord);
      APP.city = loc.city
      APP.country = loc.country
      if ('state' in loc) {
        APP.state = loc.state
      } else {
        delete APP.state
      }

      APP.updateCurrentTempHTML(forecast)
      APP.updateHourlyTempHTML(forecast)
      APP.updateDailyTempHTML(forecast)
    } catch (error) {
      console.log(error.message);
    }
  },

  updateCurrentTempHTML(forecast) {
    // update the location
    let loc = APP.city
    if ('state' in APP) {
      loc += `, ${APP.state}`
    }
    loc += `, ${APP.country}`
    document.getElementById("location").innerHTML = `<h1>${loc}</h1>`;

    // update the status
    document.getElementById("status").innerHTML =
    `<div>
      <img
        src="http://openweathermap.org/img/wn/${
          forecast.current.weather[0].icon
        }@2x.png"
        alt
      />
    </div>
    `

    // update the current temperature
    document.getElementById("temp").innerHTML = `<h1>${forecast.current.temp}°</h1>`;

    // update the hi and lo temperatures
    let {hi, lo} = APP.getHighestAndLowestTemps(forecast)
    document.getElementById("high").innerHTML = `<h6>${hi}°</h6>`;
    document.getElementById("low").innerHTML = `<h6 class="text-muted">${lo}°</h6>`;
  },

  updateHourlyTempHTML (forecast) {
    // get next 6 hours of forecasts
    const N = 6;
    let fcs = APP.getNextHoursForecast(forecast, N);
    // update hours row
    let hoursContainer = document.getElementById("hours");
    // let innerHTML = forecastToHourlyHTML(fcs[0]);
    let innerHTML = APP.forecastToHourlyHTML(forecast.current)
    fcs.forEach((fc) => {
      innerHTML += APP.forecastToHourlyHTML(fc)
    })

    hoursContainer.innerHTML = innerHTML
  },

  updateDailyTempHTML (forecast) {
    let innerHTML = ``
    let count = 6;
    forecast.daily.slice(1).forEach((fc) => {
      if (count == 0) {
        return
      }
      innerHTML += APP.forecastToDailyHTML(fc)
      count -= 1
    })

    document.getElementById("daily").innerHTML = innerHTML
  },

  /*
  * Utility functions below this line
  */

  // Finds highest and lowest temperature for today's forecast
  getHighestAndLowestTemps (forecast) {
    // if we have daily in the forecast, then daily[0] is today.
    // take max and min of today
    if ('daily' in forecast) {
      return {hi: forecast.daily[0].temp.max, lo: forecast.daily[0].temp.min}
    } else if ('max' in forecast.temp && 'min' in forecast.temp) {
      return {hi: forecast.temp.max, lo: forecast.temp.min}
    }

    return null
  },

  // Get next N hours of forecast from now
  getNextHoursForecast (forecast, n) {
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
  },

  // Convert given forcest to an HTML div with hour, status and temp
  forecastToHourlyHTML (forecast) {
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
          <img
            src="http://openweathermap.org/img/wn/${
              forecast.weather[0].icon
            }@2x.png"
            alt width="30"
          />
        </div>
        <div id="h-temp">
          ${temp}
        </div>
      </div>
    </div>
    `
  },

  forecastToDailyHTML (forecast) {
    let {hi, lo} = APP.getHighestAndLowestTemps(forecast)
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
            <img
              src="http://openweathermap.org/img/wn/${
                forecast.weather[0].icon
              }@2x.png"
              alt width="20"
            />
            <span class="text-primary">%${forecast.humidity}</span>
          </div>

          <div class="col-1 offset-1">
            <span>${hi}</span>
          </div>

          <div class="col-1">
            <span class="text-muted">${lo}</span>
          </div>
        </div>
    `
  },

  async getLocation (event) {
    event.preventDefault();

    let location = document.getElementById("loc-search").value
    APP.location = location
    const coord = await getGeolocation(APP.location);

    APP.coord = coord
    console.log(APP.coord);
    APP.updatePage()
  },

  getCurrentLocation (event) {
    event.preventDefault();

    let opts = {
      enableHighAccuracy: true,
      timeout: 1000 * 10, //10 seconds
      maximumAge: 1000 * 60 * 5, //5 minutes
    };
    navigator.geolocation.getCurrentPosition(APP.geoLocSuccess, APP.geoLocFailure, opts);
  },

  geoLocSuccess: (position) => {
    //got position  
    let lat = position.coords.latitude;
    let lon  = position.coords.longitude;

    APP.coord = {lon: lon, lat: lat}
    APP.updatePage()
  },

  geoLocFailure: (err) => {
    //geolocation failed
    console.error(err);
  },
}

document.addEventListener("DOMContentLoaded", APP.main)