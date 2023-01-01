import { RouteDrawerInterface } from './interfaces';
import { MapPoint, RouteDrawerOptions } from './types';
import { clone, find, merge, remove } from 'lodash';
// Bug: duplicate Leaflet object. https://github.com/Leaflet/Leaflet/issues/7382
// import * as L from 'leaflet';
import { GeoJSON, LayerGroup, Map } from 'leaflet';

export default class Drawer implements RouteDrawerInterface {
    map: Map;
    options: RouteDrawerOptions = {
        markerIcon: null,
        pointZoom: 16,
    };
    paths: GeoJSON.GeoJsonObject[] = [];
    points: MapPoint[] = [];
    pointersLayer: LayerGroup;
    pathLayer: LayerGroup;

    constructor(options: RouteDrawerOptions) {
        this.options = merge({}, this.options, options);
    }

    addPoint(point: MapPoint): this {
        const p = clone(point);

        // @ts-ignore
        const marker = L.marker(p, { icon: this.options.markerIcon }).addTo(this.pointersLayer);
        this.map.panTo(p).setView(p); // , this.options.pointZoom

        p.marker = marker;

        this.points.push(p);

        return this;
    }

    addPoints(points: MapPoint[]): this {
        points.forEach((point) => {
            this.addPoint(point);
        });

        return this;
    }

    removePoint(point: MapPoint): this {
        const marker = find(this.points, (el) => {
            return el.lat === point.lat && el.lng === point.lng;
        });

        if (marker) {
            this.pointersLayer.removeLayer(marker.marker);
            remove(this.points, (el) => {
                return el === marker;
            });
        }

        return this;
    }

    clear(): this {
        this.pointersLayer.clearLayers();
        this.pathLayer.clearLayers();
        this.points = [];
        this.paths = [];

        return this;
    }

    draw(path: GeoJSON.GeoJsonObject): this {
        this.paths.push(path);
        // @ts-ignore
        L.geoJSON(path).addTo(this.pathLayer);
        return this;
    }

    setMap(map: Map): this {
        this.map = map;
        // @ts-ignore
        this.pointersLayer = L.layerGroup().addTo(map);
        // @ts-ignore
        this.pathLayer = L.layerGroup().addTo(map);
        return this;
    }

    onMap(map: Map): this {
        return this.setMap(map);
    }

    // TODO add temp marker display (circle)
}
