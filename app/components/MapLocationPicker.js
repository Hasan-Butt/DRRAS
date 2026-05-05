"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, setPosition, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });
  return position ? <Marker position={position} draggable eventHandlers={{ dragend: (e) => {
    const { lat, lng } = e.target.getLatLng();
    setPosition([lat, lng]);
    onLocationSelect(lat, lng);
  }}} /> : null;
}

export default function MapLocationPicker({ onLocationSelect, initialLat, initialLng }) {
  const [position, setPosition] = useState(
    initialLat && initialLng ? [initialLat, initialLng] : [33.6844, 73.0479]
  );
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const searchLocation = async () => {
    if (!searchText.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`
      );
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setPosition([lat, lng]);
        onLocationSelect(lat, lng);
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search for a city, address..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchLocation()}
          className="flex-1 px-3 py-1.5 border rounded-lg text-sm"
        />
        <button
          onClick={searchLocation}
          disabled={isSearching}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isSearching ? "..." : "Go"}
        </button>
      </div>
      {/* Fixed height for map container */}
      <div style={{ height: "240px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
        <MapContainer
          center={position}
          zoom={12}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
    </div>
  );
}