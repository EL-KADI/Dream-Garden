import { NextResponse } from "next/server"

export async function GET() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(
      `https://trefle.io/api/v1/plants?token=cbe082eaaa1a2c5f0db0474f38f51439&page_size=30`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": "DreamGarden/1.0",
        },
        signal: controller.signal,
      },
    )

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.log(`Trefle API responded with status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.data && Array.isArray(data.data)) {
      return NextResponse.json({
        plants: data.data,
        meta: data.meta || {},
        source: "trefle",
      })
    } else {
      throw new Error("Invalid data structure from API")
    }
  } catch (error) {
    console.log("Using fallback plants due to API error:", error)

    const fallbackPlants = [
      {
        id: 1,
        common_name: "Rose",
        scientific_name: "Rosa rubiginosa",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Rosaceae",
        duration: ["Perennial"],
        flower_color: "Red",
        foliage_color: "Green",
      },
      {
        id: 2,
        common_name: "Sunflower",
        scientific_name: "Helianthus annuus",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Asteraceae",
        duration: ["Annual"],
        flower_color: "Yellow",
        foliage_color: "Green",
      },
      {
        id: 3,
        common_name: "Lavender",
        scientific_name: "Lavandula angustifolia",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Lamiaceae",
        duration: ["Perennial"],
        flower_color: "Purple",
        foliage_color: "Gray-Green",
      },
      {
        id: 4,
        common_name: "Tulip",
        scientific_name: "Tulipa gesneriana",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Liliaceae",
        duration: ["Perennial"],
        flower_color: "Various",
        foliage_color: "Green",
      },
      {
        id: 5,
        common_name: "Marigold",
        scientific_name: "Tagetes patula",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Asteraceae",
        duration: ["Annual"],
        flower_color: "Orange",
        foliage_color: "Green",
      },
      {
        id: 6,
        common_name: "Daisy",
        scientific_name: "Bellis perennis",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Asteraceae",
        duration: ["Perennial"],
        flower_color: "White",
        foliage_color: "Green",
      },
      {
        id: 7,
        common_name: "Petunia",
        scientific_name: "Petunia × atkinsiana",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Solanaceae",
        duration: ["Annual"],
        flower_color: "Purple",
        foliage_color: "Green",
      },
      {
        id: 8,
        common_name: "Geranium",
        scientific_name: "Pelargonium × hortorum",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Geraniaceae",
        duration: ["Perennial"],
        flower_color: "Red",
        foliage_color: "Green",
      },
      {
        id: 9,
        common_name: "Pansy",
        scientific_name: "Viola × wittrockiana",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Violaceae",
        duration: ["Annual"],
        flower_color: "Purple",
        foliage_color: "Green",
      },
      {
        id: 10,
        common_name: "Begonia",
        scientific_name: "Begonia × semperflorens-cultorum",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Begoniaceae",
        duration: ["Annual"],
        flower_color: "Pink",
        foliage_color: "Green",
      },
      {
        id: 11,
        common_name: "Impatiens",
        scientific_name: "Impatiens walleriana",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Balsaminaceae",
        duration: ["Annual"],
        flower_color: "Various",
        foliage_color: "Green",
      },
      {
        id: 12,
        common_name: "Zinnia",
        scientific_name: "Zinnia elegans",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Asteraceae",
        duration: ["Annual"],
        flower_color: "Various",
        foliage_color: "Green",
      },
      {
        id: 13,
        common_name: "Cosmos",
        scientific_name: "Cosmos bipinnatus",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Asteraceae",
        duration: ["Annual"],
        flower_color: "Pink",
        foliage_color: "Green",
      },
      {
        id: 14,
        common_name: "Snapdragon",
        scientific_name: "Antirrhinum majus",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Plantaginaceae",
        duration: ["Annual"],
        flower_color: "Various",
        foliage_color: "Green",
      },
      {
        id: 15,
        common_name: "Sweet Alyssum",
        scientific_name: "Lobularia maritima",
        image_url: "/placeholder.svg?height=100&width=100",
        family: "Brassicaceae",
        duration: ["Annual"],
        flower_color: "White",
        foliage_color: "Green",
      },
    ]

    return NextResponse.json({
      plants: fallbackPlants,
      meta: { total: fallbackPlants.length },
      source: "fallback",
    })
  }
}
