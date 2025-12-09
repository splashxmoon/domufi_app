import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const PropertyMap = ({ locations = [], height = '400px' }) => {
  const [loadError, setLoadError] = useState(null);
  
  
  const mapCenter = {
    lat: 39.8283,
    lng: -98.5795
  };

  const mapContainerStyle = {
    width: '100%',
    height: height,
    borderRadius: '0',
    overflow: 'hidden'
  };

  
  const usBounds = {
    north: 49.38,
    south: 24.52,
    west: -125.0,
    east: -66.95
  };

  const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    restriction: {
      latLngBounds: usBounds,
      strictBounds: false
    },
    minZoom: 3,
    maxZoom: 18,
    styles: [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#a5d8ff' }]
      },
      {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#1e40af' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#f8fafc' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#e2e8f0' }]
      },
      {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#1e293b' }]
      },
      {
        featureType: 'administrative',
        elementType: 'geometry',
        stylers: [{ color: '#f1f5f9' }]
      },
      {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#475569' }]
      },
      {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{ color: '#f8fafc' }]
      },
      {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#64748b' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#d1fae5' }]
      },
      {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#f1f5f9' }]
      }
    ]
  };

  
  
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div style={{
        width: '100%',
        height: height,
        borderRadius: '16px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
          Google Maps API Key Required
        </div>
        <div style={{ fontSize: '12px', marginBottom: '12px' }}>
          Add REACT_APP_GOOGLE_MAPS_API_KEY to your .env file
        </div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>
          Get your API key from{' '}
          <a 
            href="https://console.cloud.google.com/google/maps-apis"
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none' }}
          >
            Google Cloud Console
          </a>
        </div>
      </div>
    );
  }

  

  const handleLoadError = (error) => {
    console.error('Google Maps load error:', error);
    setLoadError('Failed to load Google Maps. Please check your API key configuration.');
  };

  if (loadError) {
    return (
      <div style={{
        width: '100%',
        height: height,
        borderRadius: '0',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        color: '#94a3b8'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444', marginBottom: '12px' }}>
          Map Loading Error
        </div>
        <div style={{ fontSize: '13px', marginBottom: '16px', color: '#cbd5f5' }}>
          {loadError}
        </div>
        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.6 }}>
          <div style={{ marginBottom: '8px' }}>Common issues:</div>
          <div>• API key is missing or incorrect</div>
          <div>• Maps JavaScript API is not enabled</div>
          <div>• API key restrictions are blocking this domain</div>
          <div style={{ marginTop: '12px' }}>
            <a 
              href="https://console.cloud.google.com/google/maps-apis"
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              Check Google Cloud Console →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LoadScript 
      googleMapsApiKey={apiKey}
      loadingElement={
        <div style={{
          width: '100%',
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-tertiary)',
          color: '#94a3b8',
          fontSize: '14px'
        }}>
          Loading map...
        </div>
      }
    >
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={4}
        options={mapOptions}
        onLoad={(map) => {
          
          if (!window.google || !window.google.maps) {
            setLoadError('Google Maps failed to load. Please verify your API key is correct and Maps JavaScript API is enabled.');
            return;
          }
          
          
          if (window.google?.maps?.LatLngBounds) {
            const usBoundsObj = new window.google.maps.LatLngBounds(
              { lat: usBounds.south, lng: usBounds.west },
              { lat: usBounds.north, lng: usBounds.east }
            );

            
            const ensureFullUSVisible = () => {
              const currentZoom = map.getZoom();
              const currentBounds = map.getBounds();
              
              
              if (currentZoom <= 4 && currentBounds) {
                const ne = currentBounds.getNorthEast();
                const sw = currentBounds.getSouthWest();
                
                
                const usFullyVisible = 
                  sw.lat() <= usBounds.south &&
                  ne.lat() >= usBounds.north &&
                  sw.lng() <= usBounds.west &&
                  ne.lng() >= usBounds.east;
                
                if (!usFullyVisible) {
                  
                  map.fitBounds(usBoundsObj, { padding: { top: 20, right: 20, bottom: 20, left: 20 } });
                }
              }
            };

            
            const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', () => {
              ensureFullUSVisible();
            });

            
            const dragEndListener = window.google.maps.event.addListener(map, 'dragend', () => {
              ensureFullUSVisible();
            });

            
            if (locations.length > 0) {
              const bounds = new window.google.maps.LatLngBounds();
              locations.forEach(loc => {
                if (loc.coordinates && loc.coordinates.lat && loc.coordinates.lng) {
                  bounds.extend(loc.coordinates);
                }
              });
              if (!bounds.isEmpty()) {
                
                map.fitBounds(bounds, { padding: { top: 50, right: 50, bottom: 50, left: 50 } });
              } else {
                
                map.fitBounds(usBoundsObj, { padding: { top: 20, right: 20, bottom: 20, left: 20 } });
              }
            } else {
              
              map.fitBounds(usBoundsObj, { padding: { top: 20, right: 20, bottom: 20, left: 20 } });
            }
          }
        }}
      >
        {locations.map((location, idx) => {
          if (!location.coordinates || !location.coordinates.lat || !location.coordinates.lng) return null;
          
          
          const colorPalette = [
            '#3b82f6', 
            '#10b981', 
            '#f59e0b', 
            '#ef4444', 
            '#8b5cf6', 
            '#06b6d4', 
            '#f97316', 
            '#ec4899', 
            '#14b8a6', 
            '#6366f1'  
          ];
          
          
          const markerColor = colorPalette[idx % colorPalette.length];
          
          
          const scale = 6;
          
          const iconConfig = window.google?.maps ? {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: scale,
            fillColor: markerColor,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2
          } : {
            path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z',
            scale: scale,
            fillColor: markerColor,
            fillOpacity: 0.9,
            strokeColor: '#ffffff',
            strokeWeight: 2
          };
          
          return (
            <Marker
              key={`${location.city}-${location.state}-${idx}`}
              position={location.coordinates}
              icon={iconConfig}
              title={`${location.city ? `${location.city}, ` : ''}${location.state} - ${location.properties} ${location.properties === 1 ? 'property' : 'properties'} - $${(location.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            />
          );
        })}
      </GoogleMap>
    </LoadScript>
  );
};

export default PropertyMap;

