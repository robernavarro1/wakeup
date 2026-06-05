"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { LatLngTuple, Icon as LeafletIcon } from "leaflet"
import { CITY_COORDS } from "@/lib/demo-data"

import "leaflet/dist/leaflet.css"

const SPAIN_CENTER: LatLngTuple = [40.4, -3.7]

interface MapItem {
  id: string
  name: string
  subtitle: string
  city: string
  href?: string
  type: "professional" | "event"
}

interface MapComponentProps {
  items: MapItem[]
  center?: LatLngTuple
  zoom?: number
  className?: string
}

export default function MapComponent({
  items,
  center = SPAIN_CENTER,
  zoom = 6,
  className = "",
}: MapComponentProps) {
  const [L, setL] = useState<typeof import("leaflet") | null>(null)
  const [markerIcon, setMarkerIcon] = useState<LeafletIcon | null>(null)

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet)
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
      const icon = new leaflet.Icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      setMarkerIcon(icon)
    })
  }, [])

  const cityGroups: Record<string, { items: MapItem[]; coords: LatLngTuple | null }> = {}
  for (const item of items) {
    if (!cityGroups[item.city]) {
      const coords = CITY_COORDS[item.city]
      cityGroups[item.city] = { items: [], coords: coords ? [coords[0], coords[1]] : null }
    }
    cityGroups[item.city].items.push(item)
  }

  if (!L || !markerIcon) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] ${className}`}
      >
        <p className="text-sm text-purple-300/50">Cargando mapa...</p>
      </div>
    )
  }

  const filteredCities = Object.entries(cityGroups).filter(([, g]) => g.coords)

  return (
    <div className={`${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="z-0 h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredCities.map(([city, group]) => (
          <Marker key={city} position={group.coords!} icon={markerIcon}>
            <Popup>
              <div className="text-sm">
                <p className="mb-1 font-semibold">{city}</p>
                {group.items.map((item) => (
                  <p key={item.id} className="text-xs text-purple-700">
                    {item.type === "professional" ? "⊙" : "◇"} {item.name}
                  </p>
                ))}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
