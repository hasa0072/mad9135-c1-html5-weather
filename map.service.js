const API_TOKEN = 'pk.4606310be676c8706955b3e7c872c102';
const BASE_URL = 'https://us1.locationiq.com/v1';

export async function getGeolocation(location) {
  const url = `${BASE_URL}/search.php?key=${API_TOKEN}&q=${location}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  return { lat: data[0].lat, lon: data[0].lon};
}

export async function getCityAndCountry(coord) {
  const url = `${BASE_URL}/reverse.php?key=${API_TOKEN}&lat=${coord.lat}&lon=${coord.lon}&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const data = await response.json();
  console.log(data)
  if ('state' in data.address) {
    return { city: data.address.city, country: data.address.country, state: data.address.state}
  } else {
    return { city: data.address.city, country: data.address.country}
  }
}
