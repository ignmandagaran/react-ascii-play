declare namespace _default {
    export { json };
    export { image };
    export { text };
}
export default _default;
declare function json(url: any): Promise<any>;
declare function image(url: any): any;
declare function text(url: any): Promise<string>;
