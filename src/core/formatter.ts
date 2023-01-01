import { merge } from 'lodash';
import { DirectionStep, FormatterOptions } from './types';
import { FormatterInterface } from './interfaces';

export default class Formatter implements FormatterInterface {
    options: FormatterOptions = {
        units: 'metric',
        unitNames: {
            meters: 'm',
            kilometers: 'km',
            yards: 'yd',
            miles: 'mi',
            hours: 'h',
            minutes: 'min',
            seconds: 's',
        },
        language: 'en',
        roundingSensitivity: 1,
        distanceTemplate: '{value} {unit}',
    };

    constructor(options: FormatterOptions) {
        this.options = merge({}, this.options, options);
    }

    /**
     *
     * @param d: number of meters
     * @param sensitivity
     */
    formatDistance(d: number, sensitivity?: number) {
        const un = this.options.unitNames;
        sensitivity = sensitivity ? sensitivity : this.options.roundingSensitivity;
        const simpleRounding = sensitivity <= 0;
        let data;

        if (this.options.units === 'imperial') {
            const yards = d / 0.9144;
            if (yards >= 1000) {
                data = {
                    value: this._round(d / 1609.344, sensitivity),
                    unit: un.miles,
                };
            } else {
                data = {
                    value: this._round(yards, sensitivity),
                    unit: un.yards,
                };
            }
        } else {
            const v = this._round(d, sensitivity);
            data = {
                value: v >= 1000 ? v / 1000 : v,
                unit: v >= 1000 ? un.kilometers : un.meters,
            };
        }

        if (simpleRounding) {
            data.value = parseFloat(data.value.toFixed(-sensitivity));
        }

        return this.template(this.options.distanceTemplate, data);
    }

    /**
     *
     * @param t: number of seconds
     */
    formatTime(t: number) {
        const un = this.options.unitNames;
        // More than 30 seconds precision looks ridiculous
        t = Math.round(t / 30) * 30;

        if (t > 86400) {
            return Math.round(t / 3600) + ' ' + un.hours;
        } else if (t > 3600) {
            return Math.floor(t / 3600) + ' ' + un.hours + ' ' + Math.round((t % 3600) / 60) + ' ' + un.minutes;
        } else if (t > 300) {
            return Math.round(t / 60) + ' ' + un.minutes;
        } else if (t > 60) {
            return Math.floor(t / 60) + ' ' + un.minutes + (t % 60 !== 0 ? ' ' + (t % 60) + ' ' + un.seconds : '');
        } else {
            return t + ' ' + un.seconds;
        }
    }

    getIconName(step: DirectionStep, i: number, max: number): string {
        switch (step.attributes.maneuverType) {
            case 'esriDMTDepart':
                if (i === 0) {
                    return 'depart';
                }
                break;
            case 'WaypointReached': // TODO
                return 'via';
            case 'esriDMTRoundabout':
                return 'enter-roundabout';
            case 'esriDMTStop':
                return i === max ? 'arrive' : 'via';
            case 'esriDMTStraight':
                return 'continue';
            case 'esriDMTBearRight':
                return 'bear-right';
            case 'esriDMTTurnRight':
            case 'esriDMTTurnRightLeft':
                return 'turn-right';
            case 'esriDMTSharpRight':
                return 'sharp-right';
            case 'esriDMTUTurn':
                return 'u-turn';
            case 'esriDMTSharpLeft':
                return 'sharp-left';
            case 'esriDMTTurnLeft':
            case 'esriDMTTurnLeftLeft':
                return 'turn-left';
            case 'esriDMTBearLeft':
                return 'bear-left';
        }

        return '';
    }

    formatStep(step: DirectionStep, data: {} = {}): string {
        return this.template(step.attributes.text, merge({}, step.attributes, data));
    }

    template(template: string, data: {}): string {
        const find = Object.keys(data) as string[];
        const replace = Object.values(data) as string[];

        for (let i = 0; i < find.length; i++) {
            template = template.replace('{' + find[i] + '}', replace[i]);
        }
        return template;
    }

    _round(d: number, sensitivity: number): number {
        const s = sensitivity || this.options.roundingSensitivity;
        const pow10 = Math.pow(10, (Math.floor(d / s) + '').length - 1);
        const r = Math.floor(d / pow10);
        const p = r > 5 ? pow10 : pow10 / 2;

        return Math.round(d / p) * p;
    }
}
