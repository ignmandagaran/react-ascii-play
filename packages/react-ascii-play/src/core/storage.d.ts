declare namespace _default {
    function store(key: string, obj: Record<string, unknown>): boolean;
    function restore(key: string, target?: Record<string, unknown>): Record<string, unknown>;
    function clear(key: string): void;
}
export default _default;
