import { IProvideFeatureSwitches } from '../types/base';

export const featureSwitches: IProvideFeatureSwitches = {
    enableDashboard: false,
    enableNewPipelines: true,
    enableLinkContext: true,
    enableAccelerators: true,
    enableDoubleClickRename: true,
    showToggleFullscreen: true,
    showMapToolbar: true,
    showMiniMap: false,
    allowMapZoomMouseWheel: true,
    enableModernComponents: false, // Phase 4: Set to true to enable modern unified components
};
