import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const LiveMap = ({ driverLocation, from, to }) => {
    const position = driverLocation 
        ? [driverLocation.lat, driverLocation.lng] 
        : (from ? [from.lat, from.lng] : [23.2599, 77.4126]); // Default fallback to start point, then Bhopal

    return (
        <MapContainer center={position} zoom={20} scrollWheelZoom={true} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap center={position} />
            {from && (
                <Marker position={[from.lat, from.lng]}>
                    <Popup>
                        Start: {from.text || "Pickup point"}
                    </Popup>
                </Marker>
            )}
            {to && (
                <Marker position={[to.lat, to.lng]}>
                    <Popup>
                        Destination: {to.text || "Drop-off point"}
                    </Popup>
                </Marker>
            )}
            {driverLocation && (
                <Marker position={[driverLocation.lat, driverLocation.lng]}>
                    <Popup>
                        Driver's current location.
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default LiveMap;