import { DivIcon, GeoJSON, Icon, Marker } from 'leaflet';

export type SearchOptions = {
    perPage?: number;
};

export type FormatterOptions = {
    units?: 'metric' | 'imperial';
    language?: 'en' | 'lt';
    distanceTemplate?: string;
    roundingSensitivity?: number;
    unitNames?: unitNames;
};

export type RouteSolverOptions = {
    returnDirections?: boolean;
    returnRoutes?: boolean;
    returnZ?: boolean;
    returnStops?: boolean;
    returnBarriers?: boolean;
    returnPolygonBarriers?: boolean;
    returnPolylineBarriers?: boolean;
    outSR?: number;
    outputLines?: string;
    impedanceAttributeName?: string;
    directionsLanguage?: 'en' | 'lt';
    travelMode?: string | null;
};

export type RouteBuilderOptions = {
    language?: 'en' | 'lt';
    summaryTemplate?: string;
};

export type RouteDirectionOptions = {
    className?: string;
    containerClassName?: string;
};

export type RouterOptions = {
    language?: 'en' | 'lt';
    url?: string;
    autoRoute?: boolean;
};

export type RouteDrawerOptions = {
    markerIcon?: Icon | DivIcon;
    pointZoom?: number;
    directionMarkerStyle?: {
        radius?: number,
        color?: string,
        fillColor?: string,
        opacity?: number,
        fillOpacity?: number
    },
};

export type EsriJson = {
    spatialReference: { wkid: number };
    x: number;
    y: number;
};

export type RouteSolverFeature = {
    geometry: EsriJson;
    attributes: { Name: string; RouteName: string };
};

export type Geometry = {
    coordinates: number[];
    type: string;
};

export type ElasticSearchObjectSource = {
    CITY: string;
    DESCRIPTIO: string;
    FULL_ADDR: string;
    GEOM_TYPE: string;
    GYVSK: number;
    LOCATIONX: number;
    LOCATIONY: number;
    MAXX: number;
    MAXY: number;
    MINX: number;
    MINY: number;
    OBJECTID: number;
    TOP_ID: string;
    TYPE: string;
    VARDAS: string;
    esri_json: EsriJson;
    geometry: Geometry;
};

export type ElasticSearchObject = {
    sort: any[];
    _id: string;
    _index: string;
    _score: number;
    _source: ElasticSearchObjectSource;
    _type: string;
};

export type OriginalRouteObject = {
    routes: {
        features: [
            {
                attributes: {
                    Name: string;
                    Total_Minutes: number;
                    Total_Meters: number;
                };
                geometry: {
                    paths: any[];
                };
            },
        ];
        geometryType: string;
    };
    stops: {
        geometryType: string;
        features: [
            {
                attributes: {
                    Name: string;
                    RouteName: string;
                    Sequence: number;
                };
                geometry: { x: number; y: number };
            },
        ];
    };
    directions: [
        {
            routeId: number;
            routeName: string;
            summary: {
                totalLength: number;
                totalTime: number;
                totalDriveTime: number;
            };
            features: DirectionStep[];
        },
    ];
};

export type Point = {
    label: string;
    lat: number;
    lng: number;
};

export type MapPoint = {
    label: string;
    lat: number;
    lng: number;
    marker?: Marker;
};

export type GeoPoint = {
    lat: number;
    lng: number;
};

export type DirectionStep = {
    attributes: {
        ETA: number;
        length: number;
        time: number;
        arriveTimeUTC: number;
        text: string;
        maneuverType: string;
    };
    compressedGeometry: string;
};

export type unitNames = {
    meters: string;
    kilometers: string;
    yards: string;
    miles: string;
    hours: string;
    minutes: string;
    seconds: string;
};

export type RouteSummary = {
    length: string;
    time: string;
};
export type RouteStop = {
    name: string;
    sequence: number;
    location: GeoPoint;
};

export type RouteDirection = {
    icon: string;
    text: string;
    length: number;
    time: number;
    location: GeoPoint;
};

export type GeoFeature = {
    attributes: any;
    geometry: any;
};

export type Route = {
    name: string;
    summary: RouteSummary;
    directions: RouteDirection[];
    stops: RouteStop[];
    path: GeoJSON.GeoJsonObject;
};
