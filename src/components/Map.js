import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxTraffic from '@mapbox/mapbox-gl-traffic'
import axios from 'axios'
import RouteInfo from './RouteInfo';
import WaypointList from './WaypointList'

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css"
import "@mapbox/mapbox-gl-traffic/mapbox-gl-traffic.css"

const styles = {
    width: "100vw",
    height: "calc(100vh - 56px)",
    position: "absolute"
};

const Map = () => {
    const [map, setMap] = useState();
    const [waypoints, setWaypoints] = useState();
    const [routeInfo, setRouteInfo] = useState();
    const mapContainer = useRef(null);

    useEffect(() => {
        mapboxgl.accessToken = "pk.eyJ1IjoiYmFmZmlvc28iLCJhIjoiY2s0eHNsbXRoMDQwODNtbzZydGtheWRzayJ9.HRBBcfhegW6-bvmCAfxtvg";
        const initializeMap = ({ setMap, mapContainer }) => {
            const map = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/light-v10", // stylesheet location
                center: [12.52489, 55.68168],
                zoom: 10,
                attributionControl: false
            });

            map.on("load", () => {
                setMap(map);
                map.resize();

                addDrawControl(map)
                map.addControl(new MapboxTraffic(), 'top-left');

            });
        };

        if (!map) initializeMap({ setMap, mapContainer });
    }, [map]);

    const addDrawControl = (map) => {
        let draw = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                point: true,
                trash: true
            }
        });
        map.addControl(draw, 'top-left');

        // Get drawn features and add to state
        const updateRoute = () => {
            let geom = draw.getAll();
            let points = geom.features.map(feat => feat.geometry.coordinates)
            if (points.length > 0) {
                let url = `http://165.22.200.0:5000/trip/v1/driving/12.578769,55.666729;${points.join(';')}?roundtrip=true&geometries=geojson&overview=full`
                axios.get(url).then(res => {
                    let distance = Math.round((res.data.trips[0].distance / 1000) * 10) / 10
                    let num = res.data.trips[0].duration / 60
                    let duration = `${Math.floor(num/60)} h ${Math.round(num % 60)} min`

                    // let duration = Math.round(res.data.trips[0].duration / 60)
                    let _waypoints = res.data.waypoints.map(item => {
                        return { index: item.waypoint_index + 1, name: item.name, location: item.location }
                    })
                    setRouteInfo({ "distance": distance, "duration": duration })
                    setWaypoints(_waypoints)

                    let route = res.data.trips[0].geometry
                    let stops = _waypoints.map((item) => {
                        let feature = {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': item.location
                            },
                            'properties': {
                                'id': item.index
                            }
                        }

                        return feature
                    })

                    // Remove current overlay
                    if (map.getSource('route') && map.getSource('waypoints')) {
                        map.removeLayer('route')
                        map.removeSource('route')
                        map.removeLayer('waypoints')
                        map.removeSource('waypoints')
                    }

                    map.addSource("route", {
                        "type": "geojson",
                        "data": {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': route
                        }
                    });

                    map.addSource("waypoints", {
                        "type": "geojson",
                        "data": { type: "FeatureCollection", features: stops }
                    });

                    map.addLayer({
                        'id': 'route',
                        'type': 'line',
                        'source': 'route',
                        'layout': {
                            'line-join': 'round',
                            'line-cap': 'round'
                        },
                        'paint': {
                            'line-color': 'rgb(22,200,200)',
                            'line-width': 4
                        }
                    })

                    map.addLayer({
                        'id': 'waypoints',
                        'type': 'symbol',
                        'source': 'waypoints',
                        'layout': {
                            // get the icon name from the source's "icon" property
                            // concatenate the name to get an icon from the style's sprite sheet
                            'icon-image': 'beer-15',
                            // get the title name from the source's "title" property
                            'text-field': ['get', 'id'],
                            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                            'text-offset': [0, 0.6],
                            'text-anchor': 'top'
                        }
                    })
                })
            }
        }

        // Store drawn poygon in state
        map.on('draw.create', updateRoute);
        map.on('draw.update', updateRoute);
        map.on('draw.delete', updateRoute);
    }

    const waypointHandler = location => {
        map.flyTo({
            center: location,
            zoom: 16
        });
    }

    return (
        <div ref={el => (mapContainer.current = el)} style={styles} >
            {routeInfo ? <RouteInfo distance={routeInfo.distance} duration={routeInfo.duration} /> : null}
            {waypoints ? <WaypointList waypoints={waypoints} clicked={waypointHandler} /> : null}
        </div>
    );
};

export default Map;