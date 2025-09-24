import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

const MapComponent = ({ routeData }) => {
    if (!routeData || !routeData.polyline || routeData.polyline.length === 0) {
        return <div>Loading map...</div>;
    }

    const startPosition = routeData.polyline[0];
    const endPosition = routeData.polyline[routeData.polyline.length - 1];

    return (
        <MapContainer center={startPosition} zoom={7} style={{ height: '400px', width: '100%' }} className="rounded-lg shadow-md">
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* Start Marker */}
            <Marker position={startPosition}>
                <Popup>Starting Point</Popup>
            </Marker>

            {/* End Marker */}
            <Marker position={endPosition}>
                <Popup>Final Destination</Popup>
            </Marker>

            {/* Route Line */}
            <Polyline pathOptions={{ color: '#164489' }} positions={routeData.polyline} />
        </MapContainer>
    );
};

export default MapComponent;