"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { SEED_CREDITS, NIGERIA_CENTER, NIGERIA_ZOOM, CATEGORY_META } from "@/lib/data";
import type { LiveCredit } from "./CreditCard";

type Props = {
  live: LiveCredit[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

function FlyTo({ id }: { id: number | null }) {
  const map = useMap();
  useEffect(() => {
    if (id == null) return;
    const c = SEED_CREDITS.find((s) => s.id === id);
    if (c) map.flyTo([c.lat, c.lng], 9, { duration: 0.8 });
  }, [id, map]);
  return null;
}

export default function Map({ live, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={NIGERIA_CENTER}
      zoom={Math.round(NIGERIA_ZOOM)}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
      zoomControl={true}
      className="rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FlyTo id={selectedId} />
      {live.map((c) => {
        const seed = SEED_CREDITS.find((s) => s.id === c.id);
        if (!seed) return null;
        const color = CATEGORY_META[seed.category].color;
        const radius = 10 + Math.min(8, (c.available / Math.max(1, seed.initialSupply)) * 8);
        return (
          <CircleMarker
            key={c.id}
            center={[c.lat, c.lng]}
            radius={radius}
            pathOptions={{
              color,
              weight: selectedId === c.id ? 4 : 2,
              fillColor: color,
              fillOpacity: 0.75,
            }}
            eventHandlers={{ click: () => onSelect(c.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]}>
              <div className="text-xs">
                <b>{c.name}</b>
                <br />
                {c.location}
                <br />
                {c.impactUnit}: {c.certified.toLocaleString()} certified
                <br />
                <span style={{ color }}>
                  {c.available.toLocaleString()} units left · {c.priceOKB} OKB each
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
