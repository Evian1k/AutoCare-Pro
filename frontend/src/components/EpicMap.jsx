import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  MapPin, 
  Navigation, 
  Car, 
  Clock, 
  Zap,
  Target,
  Route,
  Compass
} from 'lucide-react';


const EpicMap = ({ 
  center = { lat: -1.2921, lng: 36.8219 }, // Nairobi
  zoom = 12,
  markers = [],
  onMarkerClick,
  showControls = true,
  className = ""
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [directions, setDirections] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Load Google Maps API
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
          script.async = true;
          script.defer = true;
          
          script.onload = () => {
            createMap();
          };
          
          document.head.appendChild(script);
        } else {
          createMap();
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  const createMap = () => {
    if (!window.google) return;

    const mapOptions = {
      center: center,
      zoom: zoom,
      styles: getEpicMapStyle(),
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true,
      gestureHandling: 'cooperative'
    };

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);
    
    // Add epic map controls
    if (showControls) {
      addEpicControls();
    }

    // Add markers
    addMarkers();
    
    // Get user location
    getUserLocation();
    
    setIsLoading(false);
  };

  const getEpicMapStyle = () => {
    return [
      {
        "featureType": "all",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#242f3e"
          }
        ]
      },
      {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "lightness": -80
          }
        ]
      },
      {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#746855"
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#2c3e50"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#d59563"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#263c3f"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#6b9a76"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#38414e"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#212a37"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9ca5b3"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#746855"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
          {
            "color": "#1f2835"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#f3d19c"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#2f3948"
          }
        ]
      },
      {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#98a5be"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#17263c"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#515c6d"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "lightness": -20
          }
        ]
      }
    ];
  };

  const addEpicControls = () => {
    if (!mapInstanceRef.current) return;

    // Epic location button
    const locationButton = document.createElement('div');
    locationButton.className = 'epic-map-control';
    locationButton.innerHTML = `
      <button class="epic-control-btn" title="My Location">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    `;
    
    locationButton.addEventListener('click', () => {
      getUserLocation();
    });

    // Epic compass button
    const compassButton = document.createElement('div');
    compassButton.className = 'epic-map-control';
    compassButton.innerHTML = `
      <button class="epic-control-btn" title="Compass">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polygon points="12,2 15.09,8.26 22,9 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9 8.91,8.26"/>
        </svg>
      </button>
    `;

    // Epic route button
    const routeButton = document.createElement('div');
    routeButton.className = 'epic-map-control';
    routeButton.innerHTML = `
      <button class="epic-control-btn" title="Show Route">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12h18M3 6h18M3 18h18"/>
        </svg>
      </button>
    `;

    // Add controls to map
    mapInstanceRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
    mapInstanceRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(compassButton);
    mapInstanceRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(routeButton);
  };

  const addMarkers = () => {
    if (!mapInstanceRef.current || !markers.length) return;

    markers.forEach((markerData, index) => {
      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map: mapInstanceRef.current,
        title: markerData.title || `Location ${index + 1}`,
        icon: {
          url: markerData.icon || getEpicMarkerIcon(markerData.type),
          scaledSize: new window.google.maps.Size(40, 40),
          origin: new window.google.maps.Point(0, 0),
          anchor: new window.google.maps.Point(20, 40)
        },
        animation: window.google.maps.Animation.DROP
      });

      // Add epic info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: createEpicInfoWindow(markerData),
        maxWidth: 300
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        setSelectedMarker(markerData);
        onMarkerClick && onMarkerClick(markerData);
      });

      markersRef.current.push(marker);
    });
  };

  const getEpicMarkerIcon = (type) => {
    const icons = {
      service: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
          <path d="M12 20l5 5 11-11" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `),
      pickup: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#f97316" stroke="#ffffff" stroke-width="2"/>
          <path d="M8 20h24M8 16h24M8 24h24" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `),
      user: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#10b981" stroke="#ffffff" stroke-width="2"/>
          <circle cx="20" cy="16" r="4" fill="#ffffff"/>
          <path d="M8 32c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="#ffffff" stroke-width="3" fill="none"/>
        </svg>
      `)
    };
    
    return icons[type] || icons.service;
  };

  const createEpicInfoWindow = (markerData) => {
    return `
      <div class="epic-info-window">
        <div class="epic-info-header">
          <h3 class="epic-info-title">${markerData.title}</h3>
          <div class="epic-info-badge ${markerData.type}">${markerData.type}</div>
        </div>
        <div class="epic-info-content">
          <p>${markerData.description || 'Location details'}</p>
          ${markerData.distance ? `<p><strong>Distance:</strong> ${markerData.distance}</p>` : ''}
          ${markerData.eta ? `<p><strong>ETA:</strong> ${markerData.eta}</p>` : ''}
        </div>
        <div class="epic-info-actions">
          <button class="epic-btn" onclick="navigateToLocation(${markerData.position.lat}, ${markerData.position.lng})">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Navigate
          </button>
        </div>
      </div>
    `;
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(userPos);
          
          // Add user location marker
          const userMarker = new window.google.maps.Marker({
            position: userPos,
            map: mapInstanceRef.current,
            title: 'Your Location',
            icon: {
              url: getEpicMarkerIcon('user'),
              scaledSize: new window.google.maps.Size(40, 40)
            },
            animation: window.google.maps.Animation.BOUNCE
          });

          // Center map on user location
          mapInstanceRef.current.setCenter(userPos);
          mapInstanceRef.current.setZoom(15);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const calculateRoute = async (origin, destination) => {
    if (!window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      map: mapInstanceRef.current,
      suppressMarkers: true
    });

    try {
      const result = await directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      });

      directionsRenderer.setDirections(result);
      setDirections(result);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
              className={`map-container ${className}`}
    >
              <Card className="map-container glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 gradient-text">
            <MapPin className="h-6 w-6" />
            Epic Map View
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner"></div>
              <span className="ml-3 text-white">Loading Epic Map...</span>
            </div>
          )}
          
          <div 
            ref={mapRef} 
            className="w-full h-96 rounded-b-lg"
            style={{ minHeight: '400px' }}
          />
          
          {userLocation && (
            <div className="p-4 bg-black/20 border-t border-white/10">
              <div className="flex items-center gap-2 text-white">
                <Target className="h-4 w-4 text-green-400" />
                <span className="text-sm">Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <style jsx>{`
        .epic-map-control {
          background: rgba(0, 0, 0, 0.8);
          border-radius: 8px;
          margin: 8px;
          padding: 4px;
        }
        
        .epic-control-btn {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
        }
        
        .epic-control-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(220, 38, 38, 0.5);
        }
        
        .epic-info-window {
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 16px;
          border-radius: 12px;
          border: 2px solid rgba(220, 38, 38, 0.5);
          max-width: 300px;
        }
        
        .epic-info-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .epic-info-title {
          font-weight: 700;
          font-size: 16px;
          margin: 0;
        }
        
        .epic-info-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .epic-info-badge.service {
          background: rgba(220, 38, 38, 0.2);
          color: #dc2626;
        }
        
        .epic-info-badge.pickup {
          background: rgba(249, 115, 22, 0.2);
          color: #f97316;
        }
        
        .epic-info-badge.user {
          background: rgba(16, 185, 129, 0.2);
          color: #10b981;
        }
        
        .epic-info-content {
          margin-bottom: 12px;
        }
        
        .epic-info-content p {
          margin: 4px 0;
          font-size: 14px;
        }
        
        .epic-info-actions {
          display: flex;
          gap: 8px;
        }
        
        .epic-btn {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .epic-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
        }
      `}</style>
    </motion.div>
  );
};

export default EpicMap; 