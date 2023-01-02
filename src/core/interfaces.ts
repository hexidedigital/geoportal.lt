import {
    RouteBuilderOptions,
    DirectionStep,
    ElasticSearchObject,
    FormatterOptions,
    Point,
    Route,
    SearchOptions,
    RouteSolverOptions,
    RouteDrawerOptions,
    RouterOptions,
    MapPoint,
    OriginalRouteObject,
} from './types';

import { GeoJSON, LayerGroup, Map } from 'leaflet';

export interface SearchInterface {
    latestQuery: string;
    items: any[];
    start: number;
    url: string;
    options: SearchOptions;

    search(query: string): Promise<ElasticSearchObject[]>;

    payload(query: string): string | object;

    filter(list: ElasticSearchObject[], types: string[]): ElasticSearchObject[];

    format(list: ElasticSearchObject[]): Point[];
}

export interface FormatterInterface {
    options: FormatterOptions;

    /**
     *
     * @param d: number of meters
     * @param sensitivity
     */
    formatDistance(d: number, sensitivity?: number): string;

    /**
     *
     * @param t: number of seconds
     */
    formatTime(t: number): string;

    getIconName(step: DirectionStep, i: number, max: number): string;

    formatStep(step: DirectionStep, data?: {}): string;

    template(template: string, data: {}): string;

    _round(d: number, sensitivity: number): number;
}

export interface RouteSolverInterface {
    options: RouteSolverOptions;
    url: string;

    solve(points: Point[]): Promise<OriginalRouteObject>;

    buildUrl(points: Point[]): string;
}

export interface RouteBuilderInterface {
    options: RouteBuilderOptions;
    formatter: FormatterInterface;

    build(source: OriginalRouteObject): Route[];

    setFormatter(formatter: FormatterInterface): RouteBuilderInterface;
}

export interface RouterInterface {
    options: RouterOptions;
    points: Point[];
    routes: Route[];
    originalRoute: OriginalRouteObject;
    builder: RouteBuilderInterface;
    drawer: RouteDrawerInterface;
    solver: RouteSolverInterface;

    setBuilder(builder: RouteBuilderInterface): this;
    setDrawer(drawer: RouteDrawerInterface): this;
    setSolver(solver: RouteSolverInterface): this;
    setFormatter(formatter: FormatterInterface): this;

    addTo(map: Map): this;

    panTo(location: Point, zoom: number | null): this;
    showDirectionMarker(location: Point): this;
    hideDirectionMarker(location: Point): this;

    getRoutes(): Route[];
    getOriginalRoute(): OriginalRouteObject;

    addPoint(point: Point): this;

    addPoints(points: Point[]): this;

    setPoints(points: Point[]): this;

    getPoints(): Point[];

    clear(): this;

    build(): Promise<this>;

    draw(): this;

    buildDirections(): this;
}

export interface RouteDrawerInterface {
    options: RouteDrawerOptions;
    map: Map;
    points: MapPoint[];
    pointersLayer: LayerGroup;
    pathLayer: LayerGroup;
    directionMarkersLayer: LayerGroup;
    paths: GeoJSON.GeoJsonObject[];

    setMap(map: Map): this;

    onMap(map: Map): this;

    panTo(location: Point, zoom: number | null): this;
    showDirectionMarker(location: Point): this;
    hideDirectionMarker(location: Point): this;

    addPoint(point: Point): this;

    addPoints(points: Point[]): this;

    removePoint(point: Point): this;

    draw(path: GeoJSON.GeoJsonObject): this;

    clear(): this;
}
