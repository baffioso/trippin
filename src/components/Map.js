import React, { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom'
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxTraffic from '@mapbox/mapbox-gl-traffic'
import axios from 'axios'
import RouteInfo from './RouteInfo';
import WaypointList from './WaypointList'
import Popup from './Popup'

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
    const [popup, setPopup] = useState();
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

                map.on('click', 'waypoints', e => {
                    if (popup) {
                        popup.remove();
                        setPopup(null)
                    }
                    setPopup(null)
                    map.getCanvas().style.cursor = 'pointer';
                    addPopup(map, <Popup data={e.features[0].properties} />, e.lngLat)
                });


                map.on('mouseenter', 'waypoints', e => {
                    map.getCanvas().style.cursor = 'pointer';

                    // if (pop) {
                    //     pop.remove();
                    //     setPopup(null)
                    // }
                    // setPopup(null)
                    // pop = addPopup(map, <Popup data={e.features[0].properties} />, e.lngLat)
                });

                map.on('mouseleave', 'waypoints', () => {
                    map.getCanvas().style.cursor = '';
                });

            });
        };

        if (!map) initializeMap({ setMap, mapContainer });
    }, [map, popup]);

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
                    let duration = `${Math.floor(num / 60)} h ${Math.round(num % 60)} min`

                    // let duration = Math.round(res.data.trips[0].duration / 60)
                    let properties = res.data.waypoints.map(item => {
                        return {
                            ...item, 
                            index: item.waypoint_index + 1, 
                            fyldningsgrad: Math.floor(Math.random() * (80 - 100 + 1)) + 80,
                        }
                    })
                    setRouteInfo({ "distance": distance, "duration": duration })
                    setWaypoints(properties)

                    let route = res.data.trips[0].geometry
                    let stops = properties.map((item) => {
                        let feature = {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': item.location
                            },
                            'properties': {
                                ...item
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
                            'text-field': ['get', 'index'],
                            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                            'text-offset': [0, 0.6],
                            'text-anchor': 'top'
                        }
                    })
                })
            }
        }

        const deleteRoute = () => {
            // Remove current overlay
            if (map.getSource('route') && map.getSource('waypoints')) {
                map.removeLayer('route')
                map.removeSource('route')
                map.removeLayer('waypoints')
                map.removeSource('waypoints')
            }

            setRouteInfo(null)
            setWaypoints(null)
            
            draw.deleteAll()
            // deleteAll() doesn't clear inactive pouints - ugly hack
            map.setLayoutProperty('gl-draw-point-inactive.cold', 'visibility', 'none');
        }

        map.on('draw.create', updateRoute);
        map.on('draw.update', updateRoute);
        map.on('draw.delete', deleteRoute);
    }

    const onMapClick = (map, event) => {
        // get unique id from clicked feature
        // let renderedFeatures = map.queryRenderedFeatures(event.point);
        // let gid = renderedFeatures[0].properties.id;

        // Higlight selected feature
        // let features = this.map.querySourceFeatures('overlay', { filter: ['==', 'id', gid] });
        // this._highlightFeature(features)
        map.getCanvas().style.cursor = 'pointer';
        // Add popup
        addPopup(map, <Popup data={event.features[0].properties} />, event.lngLat)

    }

    const addPopup = (map, el, lngLat) => {
        const placeholder = document.createElement('div');
        ReactDOM.render(el, placeholder);

        let _popup = new mapboxgl.Popup({ closeButton: true })
            .setDOMContent(placeholder)
            .setLngLat(lngLat)
            .addTo(map);

        setPopup(_popup)

        return _popup
    }

    const waypointListItemClick = location => {
        map.flyTo({
            center: location,
            zoom: 16
        });
    }

    const waypointListItemEnter = feature => {
        if (popup) {
            popup.remove()
            setPopup(null)
        }

        addPopup(map, <Popup data={feature} />, feature.location)
        
        map.flyTo({
            center: feature.location,
        });
    }

    const waypointListItemLeave = () => {
        popup.remove()
        setPopup(null)
    }

    return (
        <div ref={el => (mapContainer.current = el)} style={styles} >
            {routeInfo ? <RouteInfo distance={routeInfo.distance} duration={routeInfo.duration} /> : null}
            {waypoints ? <WaypointList waypoints={waypoints} entered={waypointListItemEnter} leaved={waypointListItemLeave} clicked={waypointListItemClick} /> : null}
        </div>
    );
};

export default Map;