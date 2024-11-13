import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import socket from "./lib/socket";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = { lat: 37.7749, lng: -122.4194 }; // Default center (San Francisco)

interface Location {
  latitude: number;
  longitude: number;
}

const App: React.FC = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [otherLocations, setOtherLocations] = useState<Location[]>([]);

  const GOOGLE_MAP_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Get user's current location and emit to server
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition((position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        socket.emit("locationUpdate", newLocation);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  }, []);

  // Listen for other users' location updates
  useEffect(() => {
    socket.on("broadcastLocation", (locationData: Location) => {
      setOtherLocations((prevLocations) => [...prevLocations, locationData]);
    });
    return () => {
      socket.off("broadcastLocation");
    };
  }, []);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAP_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
      >
        {/* User's own location marker */}
        {location && (
          <Marker
            position={{ lat: location.latitude, lng: location.longitude }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
        {/* Other users' location markers */}
        {otherLocations.map((loc, index) => (
          <Marker
            key={index}
            position={{ lat: loc.latitude, lng: loc.longitude }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            }}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default App;
