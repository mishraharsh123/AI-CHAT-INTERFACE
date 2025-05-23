import type { Plugin } from "../types"

export interface WeatherData {
  location: string
  temperature: number
  feelsLike: number
  description: string
  humidity: number
  windSpeed: number
  clouds: number
  timestamp: number
}

export class WeatherPlugin implements Plugin {
  name = "weather"
  description = "Get current weather information for a city"
  triggers = [/^\/weather\s+(.+)$/i]
  naturalLanguageTriggers = [
    "weather in",
    "weather for",
    "what's the weather in",
    "what is the weather in",
    "how's the weather in",
    "temperature in",
  ]

  async execute(city: string): Promise<{ response: string; data: WeatherData }> {
    if (!city) {
      throw new Error("City name is required")
    }

    try {
      // Fetch weather data from OpenWeatherMap API
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || "demo" // Use 'demo' for testing
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city,
      )}&units=metric&appid=${apiKey}`

      // For demo purposes, we'll use mock data if no API key is provided
      let weatherData: any

      if (apiKey === "demo") {
        weatherData = this.getMockWeatherData(city)
      } else {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.statusText}`)
        }
        weatherData = await response.json()
      }

      // Format the data
      const data: WeatherData = {
        location: `${weatherData.name}, ${weatherData.sys.country}`,
        temperature: Math.round(weatherData.main.temp),
        feelsLike: Math.round(weatherData.main.feels_like),
        description: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
        clouds: weatherData.clouds.all,
        timestamp: weatherData.dt * 1000, // Convert to milliseconds
      }

      // Generate response text
      const response = `Current weather in ${data.location}: ${data.temperature}°C, ${data.description}. Feels like ${data.feelsLike}°C with ${data.humidity}% humidity.`

      return { response, data }
    } catch (error) {
      console.error("Weather plugin error:", error)
      throw new Error("Could not fetch weather data. Please try again later.")
    }
  }

  private getMockWeatherData(city: string): any {
    // Generate realistic mock data based on the city name
    const cityLower = city.toLowerCase()
    const now = Math.floor(Date.now() / 1000)

    // Use the city name to generate a deterministic but realistic temperature
    const cityHash = cityLower.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const baseTemp = 15 + (cityHash % 20) // Temperature between 15-35°C

    // Different weather conditions
    const weatherConditions = [
      { main: "Clear", description: "clear sky" },
      { main: "Clouds", description: "few clouds" },
      { main: "Clouds", description: "scattered clouds" },
      { main: "Clouds", description: "broken clouds" },
      { main: "Rain", description: "light rain" },
      { main: "Rain", description: "moderate rain" },
      { main: "Thunderstorm", description: "thunderstorm" },
      { main: "Snow", description: "light snow" },
      { main: "Mist", description: "mist" },
    ]

    const weatherIndex = cityHash % weatherConditions.length

    return {
      name: city,
      sys: { country: "XX" },
      main: {
        temp: baseTemp,
        feels_like: baseTemp - 2 + (cityHash % 5),
        humidity: 30 + (cityHash % 50),
        pressure: 1000 + (cityHash % 30),
      },
      weather: [weatherConditions[weatherIndex]],
      wind: { speed: 2 + (cityHash % 8) },
      clouds: { all: cityHash % 100 },
      dt: now,
    }
  }
}
