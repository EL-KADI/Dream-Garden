"use client"

import { useState, useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Text, Box } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import type * as THREE from "three"

function PlantModel({ position, name, color }: { position: [number, number, number]; name: string; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group position={position}>
      <Box ref={meshRef} args={[0.5, 1, 0.5]}>
        <meshStandardMaterial color={color} />
      </Box>
      <Text position={[0, 1.5, 0]} fontSize={0.2} color="black" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
  )
}

export default function Design3D() {
  const [gardenItems, setGardenItems] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("dreamgarden-design")
    if (saved) {
      setGardenItems(JSON.parse(saved))
    }
  }, [])

  const getRandomColor = () => {
    const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6", "#ec4899"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 overflow-hidden">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Design
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">3D Garden View</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Garden Items</CardTitle>
              </CardHeader>
              <CardContent>
                {gardenItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No plants in your garden yet. Go back to add some plants!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {gardenItems.map((item, index) => (
                      <div key={item.gardenId} className="flex items-center p-2 bg-gray-50 rounded">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: getRandomColor() }}></div>
                        <span className="text-sm">{item.common_name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-600">🖱️ Left click + drag to rotate</p>
                <p className="text-sm text-gray-600">🖱️ Right click + drag to pan</p>
                <p className="text-sm text-gray-600">⚙️ Scroll to zoom</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>3D Garden Visualization</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full bg-gradient-to-b from-sky-200 to-green-200 rounded-lg overflow-hidden">
                  <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    <Ground />

                    {gardenItems.map((item, index) => (
                      <PlantModel
                        key={item.gardenId}
                        position={[(item.position.x - 200) / 50, 0, (item.position.y - 150) / 50]}
                        name={item.common_name}
                        color={getRandomColor()}
                      />
                    ))}

                    <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
                  </Canvas>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
