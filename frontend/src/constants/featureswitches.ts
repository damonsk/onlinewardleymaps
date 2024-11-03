export const featureSwitches: OwmFeatureSwitches = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
    showToggleFullscreen: true,
    showMapToolbar: true,
    showMiniMap: false,
    allowMapZoomMouseWheel: true,
};

export interface OwmFeatureSwitches {
    enableDashboard: boolean;
    enableNewPipelines: boolean;
    enableLinkContext: boolean;
    enableAccelerators: boolean;
    enableDoubleClickRename: boolean;
    showToggleFullscreen: boolean;
    showMapToolbar: boolean;
    showMiniMap: boolean;
    allowMapZoomMouseWheel: boolean;
}
