getForecast()

temp = forecast.temperature
rainy = forecast.shortForecast

print(forecast.name, 'Temp is', temp);

if (temp > 80) {
print('go to the beach');
} else if (temp > 70) {
print('bring a jacket');
} else {
print("brr, it's freezing");
}

if (rainy=='Rainy') {
print('bring an umbrella');
}


// hard stuff

async function getForecast() {
var response = await fetch("https://api.weather.gov/gridpoints/LOX/156,31/forecast")
var json = await response.json()
forecast = json.properties.periods[0]
}