import { FormatterInterface, RouteBuilderInterface } from './interfaces';
import {
    FormatterOptions, GeoFeature,
    OriginalRouteObject,
    Route,
    RouteBuilderOptions,
} from './types';
import { merge } from 'lodash';
import Formatter from './formatter';
import { GeoJSON } from "leaflet";

export default class Builder implements RouteBuilderInterface {
    formatter: FormatterInterface;
    options: RouteBuilderOptions = {
        language: 'en',
        summaryTemplate: '<h2>{name}</h2><h3>{distance}, {time}</h3>',
    };

    constructor(options: RouteBuilderOptions, formatterOptions: FormatterOptions) {
        this.options = merge({}, this.options, options);

        this.formatter = new Formatter(formatterOptions);
    }

    build(source: OriginalRouteObject): Route[] {
        const routes: Route[] = [];

        source.routes.features.forEach((feature, index) => {
            const geometryType = this.parseGeometryType(source.routes.geometryType);
            const totalSteps = source.directions[index].features.length;
            console.log('feature', feature)

            const route = {
                name: feature.attributes.Name,
                summary: {
                    length: this.formatter.formatDistance(feature.attributes.Total_Meters * 1000),
                    time: this.formatter.formatTime(feature.attributes.Total_Minutes * 60),
                },
                directions: Array(),
                stops: Array(),
                path: this.convertEsriToGeo(source.routes),
            };

            source.stops.features.forEach((stop) => {
                route.stops.push({
                    name: stop.attributes.Name,
                    sequence: stop.attributes.Sequence,
                    location: { lat: stop.geometry.y, lng: stop.geometry.x },
                });
            });

            source.directions[index].features.forEach((step, i) => {
                route.directions.push({
                    icon: this.formatter.getIconName(step, i, totalSteps),
                    text: this.formatter.formatStep(step),
                    length: this.formatter.formatDistance(step.attributes.length * 1000),
                    time: this.formatter.formatTime(step.attributes.time * 60),
                    location: this.compressedGeometryToLocation(step.compressedGeometry),
                });
            });

            routes.push(route);
        });

        return routes;
    }

    setFormatter(formatter: FormatterInterface): RouteBuilderInterface {
        this.formatter = formatter;
        return this;
    }

    parseGeometryType(type: string): 'Point' | 'MultiPoint' | 'LineString' | 'Polygon' {
        switch (type) {
            case 'esriGeometryPoint':
                return 'Point';
            case 'esriGeometryMultiPoint':
                return 'MultiPoint';
            case 'esriGeometryPolyline':
                return 'LineString';
            case 'esriGeometryPolygon':
                return 'Polygon';
        }

        return 'Point';
    }

    featureToGeo(feature: GeoFeature, type: 'Point' | 'MultiPoint' | 'LineString' | 'Polygon'): GeoJSON.Feature {
        let geometry;
        geometry = {
            type,
            coordinates: (() => {
                switch (type) {
                    case 'Polygon':
                        return feature.geometry.rings;
                    case 'LineString':
                        return feature.geometry.paths[0];
                    case 'Point':
                        return [feature.geometry.x, feature.geometry.y];
                    default:
                        return [];
                }
            })(),
        };
        return {
            type: 'Feature',
            geometry,
            properties: feature.attributes,
        };
    }

    convertEsriToGeo(json: any): GeoJSON.FeatureCollection{
        let feature;
        let features;
        let type;
        let _i;
        let _len;
        let _ref;

        if (json !== null) {
            type = this.parseGeometryType(json.geometryType);
            features = [];
            _ref = json.features;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                feature = _ref[_i];
                features.push(this.featureToGeo(feature, type));
            }
            return {
                type: 'FeatureCollection',
                features,
            };
        } else {
            throw new Error('Error: JSON cannot be parsed');
        }
    }

    private compressedGeometryToLocation(compressedGeometry: string) {
        const decompressed = this.decompressGeometry(compressedGeometry);
        if (decompressed.length) {
            return { lat: decompressed[0][1], lng: decompressed[0][0] };
        }
        return null;
    }

    decompressGeometry(compressedGeometry: string) {
        let xDiffPrev = 0;
        let yDiffPrev = 0;
        const points = [];
        let x;
        let y;
        let strings;
        let coefficient;

        // Split the string into an array on the + and - characters
        strings = compressedGeometry.match(/((\+|\-)[^\+\-]+)/g);

        // The first value is the coefficient in base 32
        coefficient = parseInt(strings[0], 32);

        for (let j = 1; j < strings.length; j += 2) {
            // j is the offset for the x value
            // Convert the value from base 32 and add the previous x value
            x = parseInt(strings[j], 32) + xDiffPrev;
            xDiffPrev = x;

            // j+1 is the offset for the y value
            // Convert the value from base 32 and add the previous y value
            y = parseInt(strings[j + 1], 32) + yDiffPrev;
            yDiffPrev = y;

            points.push([x / coefficient, y / coefficient]);
        }

        return points;
    }
}
