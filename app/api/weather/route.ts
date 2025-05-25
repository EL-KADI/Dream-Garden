import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        name: "Demo Location",
        main: {
          temp: 22,
          humidity: 65,
        },
        weather: [
          {
            main: "Clear",
            description: "clear sky",
          },
        ],
      })
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=London&appid=${apiKey}&units=metric`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch weather")
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching weather:", error)

    return NextResponse.json({
      name: "Demo Location",
      main: {
        temp: 22,
        humidity: 65,
      },
      weather: [
        {
          main: "Clear",
          description: "clear sky",
        },
      ],
    })
  }
}
