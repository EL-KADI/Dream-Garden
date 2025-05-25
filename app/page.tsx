"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, Sun, Moon, Download, Save, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

interface Plant {
  id: number
  common_name: string
  scientific_name: string
  image_url: string
  family: string
  duration: string[]
}

interface GardenItem extends Plant {
  position: { x: number; y: number }
  gardenId: string
  size: number
}

export default function DreamGarden() {
  const [plants, setPlants] = useState<Plant[]>([])
  const [garden, setGarden] = useState<GardenItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [weather, setWeather] = useState<any>(null)
  const [draggedPlant, setDraggedPlant] = useState<GardenItem | null>(null)
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 })
  const [draggedFromCatalog, setDraggedFromCatalog] = useState<Plant | null>(null)
  const gardenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchPlants()
    fetchWeather()
    loadSavedGarden()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedPlant && gardenRef.current) {
        const rect = gardenRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        
        setGarden((prev) =>
          prev.map((item) => (item.gardenId === draggedPlant.gardenId ? { ...item, position: { x, y } } : item)),
        )
      }
    }

    const handleMouseUp = () => {
      setDraggedPlant(null)
      setDragStartPos({ x: 0, y: 0 })
    }

    if (draggedPlant) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggedPlant])

  const fetchPlants = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/plants")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setPlants(data.plants || [])

      if (data.source === "fallback") {
        console.log("Using demo plants - API unavailable")
      }
    } catch (error) {
      console.error("Error fetching plants:", error)

      const demoPlants = [
        {
          id: 1,
          common_name: "Rose",
          scientific_name: "Rosa rubiginosa",
          image_url: "/placeholder.svg?height=100&width=100",
          family: "Rosaceae",
          duration: ["Perennial"],
        },
        {
          id: 2,
          common_name: "Sunflower",
          scientific_name: "Helianthus annuus",
          image_url: "/placeholder.svg?height=100&width=100",
          family: "Asteraceae",
          duration: ["Annual"],
        },
        {
          id: 3,
          common_name: "Lavender",
          scientific_name: "Lavandula angustifolia",
          image_url: "/placeholder.svg?height=100&width=100",
          family: "Lamiaceae",
          duration: ["Perennial"],
        },
      ]

      setPlants(demoPlants)
    } finally {
      setLoading(false)
    }
  }

  const fetchWeather = async () => {
    try {
      const response = await fetch("/api/weather")
      const data = await response.json()
      setWeather(data)
    } catch (error) {
      console.error("Error fetching weather:", error)
    }
  }

  const loadSavedGarden = () => {
    try {
      const saved = localStorage.getItem("dreamgarden-design")
      if (saved) {
        const parsedGarden = JSON.parse(saved)
        if (Array.isArray(parsedGarden)) {
          setGarden(parsedGarden)
        }
      }
    } catch (error) {
      console.error("Error loading saved garden:", error)
    }
  }

  const saveGarden = () => {
    try {
      localStorage.setItem("dreamgarden-design", JSON.stringify(garden))
      alert("Garden saved successfully!")
    } catch (error) {
      console.error("Error saving garden:", error)
      alert("Error saving garden")
    }
  }

  const clearGarden = () => {
    setGarden([])
    localStorage.removeItem("dreamgarden-design")
  }

  const exportAsImage = async () => {
    try {
      const element = document.getElementById("garden-canvas")
      if (element) {
      
        const exportContainer = document.createElement("div")
        exportContainer.style.position = "fixed"
        exportContainer.style.top = "-9999px"
        exportContainer.style.left = "-9999px"
        exportContainer.style.width = "800px"
        exportContainer.style.height = "600px"
        exportContainer.style.backgroundColor = "#dcfce7"
        exportContainer.style.borderRadius = "8px"
        exportContainer.style.padding = "20px"
        exportContainer.style.fontFamily = "Arial, sans-serif"

        const title = document.createElement("h1")
        title.textContent = "My Dream Garden"
        title.style.textAlign = "center"
        title.style.fontSize = "28px"
        title.style.fontWeight = "bold"
        title.style.color = "#166534"
        title.style.marginBottom = "10px"
        exportContainer.appendChild(title)

   
        const date = document.createElement("p")
        date.textContent = new Date().toLocaleDateString("en-US")
        date.style.textAlign = "center"
        date.style.fontSize = "14px"
        date.style.color = "#374151"
        date.style.marginBottom = "20px"
        exportContainer.appendChild(date)

        const gardenArea = document.createElement("div")
        gardenArea.style.width = "100%"
        gardenArea.style.height = "480px"
        gardenArea.style.backgroundColor = "#f0fdf4"
        gardenArea.style.borderRadius = "8px"
        gardenArea.style.position = "relative"
        gardenArea.style.border = "2px dashed #86efac"

        garden.forEach((item) => {
          const plantDiv = document.createElement("div")
          plantDiv.style.position = "absolute"
          plantDiv.style.left = `${(item.position.x / element.offsetWidth) * 100}%`
          plantDiv.style.top = `${(item.position.y / element.offsetHeight) * 100}%`
          plantDiv.style.transform = `translate(-50%, -50%) scale(${item.size})`
          plantDiv.style.backgroundColor = "white"
          plantDiv.style.borderRadius = "8px"
          plantDiv.style.padding = "12px"
          plantDiv.style.border = "2px solid #86efac"
          plantDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
          plantDiv.style.textAlign = "center"

          const emoji = document.createElement("div")
          emoji.textContent = getPlantEmoji(item.common_name)
          emoji.style.fontSize = "32px"
          emoji.style.marginBottom = "4px"
          plantDiv.appendChild(emoji)

          const name = document.createElement("p")
          name.textContent = item.common_name
          name.style.fontSize = "12px"
          name.style.fontWeight = "bold"
          name.style.color = "#1f2937"
          name.style.margin = "0"
          plantDiv.appendChild(name)

          gardenArea.appendChild(plantDiv)
        })

        exportContainer.appendChild(gardenArea)
        document.body.appendChild(exportContainer)

        const canvas = await html2canvas(exportContainer, {
          backgroundColor: "#dcfce7",
          scale: 2,
          useCORS: true,
          allowTaint: false,
          width: 800,
          height: 600,
        })

        document.body.removeChild(exportContainer)

        const link = document.createElement("a")
        link.download = `dream-garden-${Date.now()}.png`
        link.href = canvas.toDataURL("image/png", 1.0)
        link.click()

        alert("Image saved successfully!")
      }
    } catch (error) {
      console.error("Error exporting image:", error)
      alert("Error saving image")
    }
  }

  const exportAsPDF = async () => {
    try {
      const element = document.getElementById("garden-canvas")
      if (element) {
        const exportContainer = document.createElement("div")
        exportContainer.style.position = "fixed"
        exportContainer.style.top = "-9999px"
        exportContainer.style.left = "-9999px"
        exportContainer.style.width = "800px"
        exportContainer.style.height = "600px"
        exportContainer.style.backgroundColor = "#dcfce7"
        exportContainer.style.borderRadius = "8px"
        exportContainer.style.padding = "20px"
        exportContainer.style.fontFamily = "Arial, sans-serif"

        const title = document.createElement("h1")
        title.textContent = "My Dream Garden"
        title.style.textAlign = "center"
        title.style.fontSize = "28px"
        title.style.fontWeight = "bold"
        title.style.color = "#166534"
        title.style.marginBottom = "10px"
        exportContainer.appendChild(title)

        const date = document.createElement("p")
        date.textContent = new Date().toLocaleDateString("en-US")
        date.style.textAlign = "center"
        date.style.fontSize = "14px"
        date.style.color = "#374151"
        date.style.marginBottom = "20px"
        exportContainer.appendChild(date)

        const gardenArea = document.createElement("div")
        gardenArea.style.width = "100%"
        gardenArea.style.height = "480px"
        gardenArea.style.backgroundColor = "#f0fdf4"
        gardenArea.style.borderRadius = "8px"
        gardenArea.style.position = "relative"
        gardenArea.style.border = "2px dashed #86efac"

        garden.forEach((item) => {
          const plantDiv = document.createElement("div")
          plantDiv.style.position = "absolute"
          plantDiv.style.left = `${(item.position.x / element.offsetWidth) * 100}%`
          plantDiv.style.top = `${(item.position.y / element.offsetHeight) * 100}%`
          plantDiv.style.transform = `translate(-50%, -50%) scale(${item.size})`
          plantDiv.style.backgroundColor = "white"
          plantDiv.style.borderRadius = "8px"
          plantDiv.style.padding = "12px"
          plantDiv.style.border = "2px solid #86efac"
          plantDiv.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"
          plantDiv.style.textAlign = "center"

          const emoji = document.createElement("div")
          emoji.textContent = getPlantEmoji(item.common_name)
          emoji.style.fontSize = "32px"
          emoji.style.marginBottom = "4px"
          plantDiv.appendChild(emoji)

          const name = document.createElement("p")
          name.textContent = item.common_name
          name.style.fontSize = "12px"
          name.style.fontWeight = "bold"
          name.style.color = "#1f2937"
          name.style.margin = "0"
          plantDiv.appendChild(name)

          gardenArea.appendChild(plantDiv)
        })

        exportContainer.appendChild(gardenArea)
        document.body.appendChild(exportContainer)

        const canvas = await html2canvas(exportContainer, {
          backgroundColor: "#dcfce7",
          scale: 2,
          useCORS: true,
          allowTaint: false,
          width: 800,
          height: 600,
        })

        document.body.removeChild(exportContainer)

        const imgData = canvas.toDataURL("image/png", 1.0)

        const pdf = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        })

        const imgWidth = 250
        const imgHeight = 180
        const x = (297 - imgWidth) / 2
        const y = 20

        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight)

        pdf.setFontSize(10)
        pdf.setTextColor(107, 114, 128)
        pdf.text(`Number of plants: ${garden.length}`, 20, 250)
        pdf.text("Created with DreamGarden", 20, 260)

        pdf.save(`dream-garden-${Date.now()}.pdf`)

        alert("PDF saved successfully!")
      }
    } catch (error) {
      console.error("Error exporting PDF:", error)
      alert("Error saving PDF")
    }
  }

  const handleCatalogDragStart = (e: React.DragEvent, plant: Plant) => {
    setDraggedFromCatalog(plant)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleGardenDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (draggedFromCatalog && gardenRef.current) {
      const gardenRect = gardenRef.current.getBoundingClientRect()
      const x = e.clientX - gardenRect.left
      const y = e.clientY - gardenRect.top

      const newGardenItem: GardenItem = {
        ...draggedFromCatalog,
        position: { x, y },
        gardenId: `garden-${Date.now()}-${Math.random()}`,
        size: 1,
      }

      setGarden((prev) => [...prev, newGardenItem])
      setDraggedFromCatalog(null)
    }
  }

  const handleGardenDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handlePlantMouseDown = (e: React.MouseEvent, plant: GardenItem) => {
    e.preventDefault()
    e.stopPropagation()

    if (gardenRef.current) {
      const rect = gardenRef.current.getBoundingClientRect()
      setDragStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setDraggedPlant(plant)
    }
  }

  const resizePlant = (gardenId: string, sizeChange: number) => {
    setGarden((prev) =>
      prev.map((item) =>
        item.gardenId === gardenId ? { ...item, size: Math.max(0.5, Math.min(3, item.size + sizeChange)) } : item,
      ),
    )
  }

  const removePlant = (gardenId: string) => {
    setGarden((prev) => prev.filter((item) => item.gardenId !== gardenId))
  }

  const filteredPlants = plants.filter(
    (plant) =>
      plant.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientific_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getWeatherTip = () => {
    if (!weather) return "Check your local weather for plant care tips"

    const temp = weather.main?.temp
    const humidity = weather.main?.humidity

    if (temp > 25) {
      return "High temperature today - water your plants early morning or evening"
    } else if (humidity > 80) {
      return "High humidity - reduce watering frequency to prevent root rot"
    } else if (temp < 10) {
      return "Cool weather - protect sensitive plants and reduce watering"
    }
    return "Perfect weather for gardening - maintain regular care routine"
  }

  const getPlantEmoji = (plantName: string) => {
    const name = plantName?.toLowerCase() || ""
    if (name.includes("rose")) return "🌹"
    if (name.includes("sunflower")) return "🌻"
    if (name.includes("lavender")) return "💜"
    if (name.includes("tulip")) return "🌷"
    if (name.includes("marigold")) return "🟡"
    if (name.includes("daisy")) return "🌼"
    if (name.includes("petunia")) return "🌺"
    if (name.includes("geranium")) return "🌸"
    if (name.includes("pansy")) return "💐"
    if (name.includes("begonia")) return "🌺"
    if (name.includes("impatiens")) return "🌸"
    if (name.includes("zinnia")) return "🌻"
    if (name.includes("cosmos")) return "🌸"
    if (name.includes("snapdragon")) return "🌺"
    if (name.includes("alyssum")) return "🤍"
    return "🌱"
  }

  return (
    <div
      className={`min-h-screen transition-colors ${darkMode ? "dark bg-gray-900" : "bg-gradient-to-br from-green-50 to-blue-50"}`}
    >
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-800/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center flex-col gap-5 sm:flex-row sm:gap-0 justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🌱</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DreamGarden</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button className="dark:bg-zinc-500" onClick={saveGarden} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button className="dark:bg-zinc-500" onClick={exportAsImage} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button className="dark:bg-zinc-500" onClick={exportAsPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {weather && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">Today's Garden Tip</h3>
                  <p className="text-blue-700 dark:text-blue-200">{getWeatherTip()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    {weather.name} - {Math.round(weather.main?.temp)}°C
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400">Humidity: {weather.main?.humidity}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Plant Catalog
                  <Badge variant="secondary">{filteredPlants.length} plants</Badge>
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search plants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-gray-500">Loading plants...</p>
                    </div>
                  ) : (
                    filteredPlants.slice(0, 20).map((plant) => (
                      <div
                        key={plant.id}
                        draggable
                        onDragStart={(e) => handleCatalogDragStart(e, plant)}
                        className="flex items-center p-3 border rounded-lg cursor-grab hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center text-white text-xl shadow-md">
                          {getPlantEmoji(plant.common_name)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {plant.common_name || "Unknown Plant"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 italic">{plant.scientific_name}</p>
                          {plant.family && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {plant.family}
                            </Badge>
                          )}
                        </div>
                        <div className="text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12l-4-4h8l-4 4z" />
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Your Garden Design</CardTitle>
                  <Button variant="outline" size="sm" onClick={clearGarden} disabled={garden.length === 0}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  id="garden-canvas"
                  className="relative min-h-96 bg-gradient-to-b from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg border-2 border-dashed border-green-300 dark:border-green-600 overflow-hidden select-none"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3), transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3), transparent 50%)",
                    minHeight: "400px",
                    width: "100%",
                  }}
                  onDrop={handleGardenDrop}
                  onDragOver={handleGardenDragOver}
                >
                  <div ref={gardenRef} className="w-full h-full ">
                    {garden.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">🌱</div>
                          <p className="text-gray-600 dark:text-gray-300">
                            Drag plants here to start designing your garden
                          </p>
                        </div>
                      </div>
                    ) : (
                      garden.map((item) => (
                        <div
                          key={item.gardenId}
                          className={`absolute cursor-move hover:scale-110 transition-transform group ${
                            draggedPlant?.gardenId === item.gardenId ? "z-50 scale-110" : ""
                          }`}
                          style={{
                            left: `${item.position.x}px`,
                            top: `${item.position.y}px`,
                            transform: `translate(-50%, -50%) scale(${item.size})`,
                          }}
                          onMouseDown={(e) => handlePlantMouseDown(e, item)}
                        >
                          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border-2 border-green-200 dark:border-green-700 hover:border-green-400 transition-colors">
                            <div className="text-3xl text-center mb-1" style={{ fontSize: "2rem", lineHeight: "1" }}>
                              {getPlantEmoji(item.common_name)}
                            </div>
                            <p
                              className="text-xs text-center font-bold text-gray-800"
                              style={{
                                fontSize: "12px",
                                fontWeight: "800",
                                color: "#1f2937",
                                textShadow: "1px 1px 2px rgba(255,255,255,0.9), -1px -1px 2px rgba(255,255,255,0.9)",
                                fontFamily: "Arial, sans-serif",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {item.common_name}
                            </p>

                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <button
                                className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  resizePlant(item.gardenId, 0.2)
                                }}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                              <button
                                className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-orange-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  resizePlant(item.gardenId, -0.2)
                                }}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removePlant(item.gardenId)
                                }}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>Powered by Trefle & OpenWeatherMap APIs</p>
            <p className="text-sm mt-2">Design your dream garden with interactive tools</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
