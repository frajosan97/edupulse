import { route as ziggyRoute } from 'ziggy-js';

declare global {
    var route: typeof ziggyRoute;
    var Ziggy: any;
}

globalThis.route = ziggyRoute;

export function setZiggyConfig(ziggyConfig: any) {
    globalThis.Ziggy = ziggyConfig;
}