import {
    FormatterInterface,
    RouteBuilderInterface,
    RouteDrawerInterface,
    RouterInterface,
    RouteSolverInterface,
} from './interfaces';
import {
    FormatterOptions,
    GeoPoint,
    OriginalRouteObject,
    Point,
    Route,
    RouteBuilderOptions,
    RouteDrawerOptions,
    RouterOptions,
    RouteSolverOptions,
    RouteStop,
} from './types';
import { merge } from 'lodash';
import Solver from './solver';
import Builder from './builder';
import Drawer from './drawer';
import { Map } from 'leaflet';

export default class Router implements RouterInterface {
    builder: RouteBuilderInterface;
    drawer: RouteDrawerInterface;
    solver: RouteSolverInterface;
    points: Point[] = [];
    routes: Route[];
    originalRoute: OriginalRouteObject;
    options: RouterOptions = {
        language: 'en',
        url: 'https://www.geoportal.lt/map/proxy/routing/Route/solve',
        autoRoute: true,
    };

    constructor(
        options: RouterOptions = {},
        drawerOptions: RouteDrawerOptions = {},
        builderOptions: RouteBuilderOptions = {},
        solverOptions: RouteSolverOptions = {},
        formatterOptions: FormatterOptions = {},
    ) {
        this.options = this.options = merge({}, this.options, options);

        builderOptions.language = options.language;
        solverOptions.directionsLanguage = options.language;
        formatterOptions.language = options.language;

        this.solver = new Solver(this.options.url, solverOptions);
        this.builder = new Builder(builderOptions, formatterOptions);
        this.drawer = new Drawer(drawerOptions);
    }

    addPoint(point: Point): this {
        if (point.lat && point.lng) {
            this.points.push(point);

            this.drawer.addPoint(point);
        }

        return this;
    }

    setPoints(points: Point[]): this {
        this.points = [];
        points.forEach((point) => {
            this.addPoint(point);
        });

        return this;
    }

    addPoints(points: Point[]): this {
        points.forEach((point) => {
            this.addPoint(point);
        });

        return this;
    }

    getPoints(): Point[] {
        return this.points;
    }

    getRoutes(): Route[] {
        return this.routes;
    }

    addTo(map: Map): this {
        this.drawer.setMap(map);
        return this;
    }

    async build(): Promise<this> {
        if (this.points.length < 2) {
            throw new Error('At least 2 points needed to build the route');
        }

        this.originalRoute = await this.solver.solve(this.points);

        this.routes = this.builder.build(this.originalRoute);

        return this;
    }

    buildDirections(): this {
        // TODO
        return this;
    }

    clear(): this {
        this.points = [];
        this.routes = null;
        this.drawer.clear();
        return this;
    }

    draw(): this {
        this.drawer.clear();

        this.routes.forEach((route) => {
            this.drawer.addPoints(Router.preparePointsFromStops(route.stops)).draw(route.path);
        });

        return this;
    }

    setBuilder(builder: RouteBuilderInterface): this {
        this.builder = builder;
        return this;
    }

    setDrawer(drawer: RouteDrawerInterface): this {
        this.drawer = drawer;
        return this;
    }

    setFormatter(formatter: FormatterInterface): this {
        this.builder.setFormatter(formatter);
        return this;
    }

    setSolver(solver: RouteSolverInterface): this {
        this.solver = solver;
        return this;
    }

    private static preparePointsFromStops(stops: RouteStop[]): Point[] {
        return stops.map((stop) => {
            return {
                label: stop.name,
                lat: stop.location.lat,
                lng: stop.location.lng,
            };
        });
    }

    getOriginalRoute(): OriginalRouteObject {
        return this.originalRoute;
    }
}
