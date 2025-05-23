"use client"

import { Cloud, Droplets, Thermometer, Wind } from "lucide-react"
import type { WeatherData } from "@/lib/plugins/weather-plugin"

interface WeatherCardProps {
  data: WeatherData
}

export default function WeatherCard({ data }: WeatherCardProps) {
  if (!data) return null

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 text-gray-800">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">{data.location}</h3>
            <p className="text-sm text-gray-500">{data.description}</p>
          </div>
          <div className="text-3xl font-bold">{data.temperature}°C</div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Feels like: {data.feelsLike}°C</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-sm">Humidity: {data.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Wind: {data.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-gray-400" />
            <span className="text-sm">Clouds: {data.clouds}%</span>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500">
        Data from OpenWeatherMap • Updated {new Date(data.timestamp).toLocaleTimeString()}
      </div>
    </div>
  )
}
