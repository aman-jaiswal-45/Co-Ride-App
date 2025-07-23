import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const LiveMap = ({ driverLocation }) => {
    // Default location if driver location is not yet available
    const position = driverLocation ? [driverLocation.lat, driverLocation.lng] : [23.2599, 77.4126]; // Bhopal coordinates

    return (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
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