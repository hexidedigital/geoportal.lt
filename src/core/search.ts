import axios from 'axios';
import { ElasticSearchObject, GeoSearchPoint, Point, SearchOptions } from './types';
import { SearchInterface } from './interfaces';

export default class Search implements SearchInterface {
    latestQuery: string = '';
    items: any[] = [];
    start: number = 0;
    url: string = 'https://www.geoportal.lt/mapproxy/elasticsearch';
    options: SearchOptions = {
        perPage: 10,
    };

    constructor(url?: string, options: SearchOptions = {}) {
        if (url) {
            this.url = url;
        }

        this.options = { ...this.options, ...options };
    }

    async search(query: string): Promise<ElasticSearchObject[]> {
        if (this.latestQuery === query) {
            return this.items;
        }

        this.latestQuery = query;

        const payload = this.payload(query);

        const response = await axios.post(
            this.url,
            payload,
            {
                headers: {
                    "content-type": "text/plain",
                }
            }
        );

        if (response.data && response.data.hits) {
            const items = this.filter(response.data.hits.hits);

            this.items = this.format(items);
            return this.items;
        }

        this.items = [];
        return this.items;
    }

    payload(query: string): string | object {

        return {
            "query": {
                "function_score": {
                    "query": {
                        "multi_match": {
                            "query": query,
                            "type": "phrase",
                            "fields": [
                                "VARDAS^5",
                                "VARDAS.folded^5",
                                "FULL_ADDR",
                                "FULL_ADDR.folded"
                            ],
                            "slop": 5
                        }
                    },
                    "functions": [
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "apskritis"
                                }
                            },
                            "weight": 1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "savivaldybė"
                                }
                            },
                            "weight": 1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "gyvenvietė"
                                }
                            },
                            "weight": 1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "miesto dalis"
                                }
                            },
                            "weight": 1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "gatvė"
                                }
                            },
                            "weight": 1.2
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "adresas"
                                }
                            },
                            "weight": 0.1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "ežeras"
                                }
                            },
                            "weight": 1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "tvenkinys"
                                }
                            },
                            "weight": 1
                        },
                        {
                            "filter": {
                                "term": {
                                    "TYPE": "upė"
                                }
                            },
                            "weight": 1
                        }
                    ]
                }
            },
            "sort": [
                "_score",
                {
                    "GYVSK": "desc"
                },
                "VARDAS"
            ],
            "from": this.start,
            "size": this.options.perPage
        };


        return JSON.parse(
            '{"query":{"function_score":{"query":{"multi_match":{"query":"' +
            query +
            '","type":"most_fields","fields":["VARDAS^5","VARDAS.folded^5","VARDAS.shingle^5","VARDAS.trigram^3","VARDAS.edge^5","FULL_ADDR","FULL_ADDR.folded","FULL_ADDR.shingle","FULL_ADDR.trigram","FULL_ADDR.edge"],"slop":5}},"functions":[{"filter":{"term":{"TYPE":"apskritis"}},"weight":1},{"filter":{"term":{"TYPE":"savivaldybė"}},"weight":1},{"filter":{"term":{"TYPE":"gyvenvietė"}},"weight":1},{"filter":{"term":{"TYPE":"miesto dalis"}},"weight":1},{"filter":{"term":{"TYPE":"gatvė"}},"weight":1.2},{"filter":{"term":{"TYPE":"adresas"}},"weight":0.1},{"filter":{"term":{"TYPE":"ežeras"}},"weight":1},{"filter":{"term":{"TYPE":"tvenkinys"}},"weight":1},{"filter":{"term":{"TYPE":"upė"}},"weight":1}]}},"sort":["_score",{"GYVSK":"desc"},"VARDAS"],"from":' +
            this.start +
            ',"size":' +
            this.options.perPage +
            '}'
        );
    }

    filter(list: ElasticSearchObject[], types: string[] = []): ElasticSearchObject[] {
        if (types.length === 0) {
            return list;
        }

        return list.filter((el) => {
            return types.indexOf(el._source.GEOM_TYPE) >= 0;
        });
    }

    format(list: ElasticSearchObject[]): GeoSearchPoint[] {
        return list.map((item) => {
            return {
                label: item._source.VARDAS,
                city: this.capitalize(item._source.CITY),
                full_address: item._source.FULL_ADDR,
                description: item._source.DESCRIPTIO,
                type: item._source.TYPE,
                lat: item._source.LOCATIONY,
                lng: item._source.LOCATIONX,
            };
        });
    }

    capitalize(label: string): string {
        return label.length > 0 ? label.charAt(0).toUpperCase() + label.slice(1) : label;
    }
}
