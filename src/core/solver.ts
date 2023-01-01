import axios from 'axios';
import { RouteSolverInterface } from './interfaces';
import { OriginalRouteObject, Point, RouteSolverFeature, RouteSolverOptions } from './types';
import { merge } from 'lodash';

export default class Solver implements RouteSolverInterface {
    url = 'https://www.geoportal.lt/map/proxy/routing/Route/solve';
    options: RouteSolverOptions = {
        returnDirections: true,
        returnRoutes: true,
        returnZ: true,
        returnStops: true,
        returnBarriers: false,
        returnPolygonBarriers: false,
        returnPolylineBarriers: false,
        outSR: 4326,
        outputLines: 'esriNAOutputLineTrueShape',
        impedanceAttributeName: 'minutes',
        directionsLanguage: 'en',
        travelMode: null,
    };

    constructor(url?: string, options: RouteSolverOptions = {}) {
        if (url) {
            this.url = url;
        }

        this.options = merge({}, this.options, options);
    }

    buildUrl(points: Point[]): string {
        if (points.length < 2) {
            throw new Error('Points array must contain at least 2 points');
        }

        const query = Object.entries(this.options)
            .map(([key, val]) => encodeURIComponent(key) + '=' + encodeURIComponent(val))
            .join('&');
        let url = this.url + '?f=json&' + query;
        const wp = {
            type: 'features',
            features: Array(),
            doNotLocateOnRestrictedElements: true,
        };

        const name = points[0].label + ' - ' + points[points.length - 1].label;

        points.forEach((point, index) => {
            wp.features.push({
                geometry: {
                    x: point.lng,
                    y: point.lat,
                    spatialReference: {
                        wkid: this.options.outSR,
                    },
                },
                attributes: {
                    Name: point.label,
                    RouteName: name,
                },
            });
        });

        url += '&stops=' + encodeURIComponent(JSON.stringify(wp));
        return url;
    }

    async solve(points: Point[]): Promise<OriginalRouteObject> {
        const response = await axios.get(this.buildUrl(points));

        if (response.data) {
            return response.data;
        }

        throw new Error('No route has been returned');
    }
}
