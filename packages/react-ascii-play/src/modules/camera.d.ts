/**
@module   camera.js
@desc     Webcam init and helper
@category public

Returns a video element (initialised asynchronously). The callback receives
the video's source once its metadata has loaded.
*/
export function initCamera(callback?: (source: MediaProvider | null) => void): HTMLVideoElement;
