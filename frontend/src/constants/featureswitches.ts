import {IProvideFeatureSwitches} from '../types/base';

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
    enableModernComponents: true, // Phase 4: Enabled modern unified components by default
    enableQuickAdd: true, // Enable QuickAdd functionality alongside WYSIWYG toolbar
};
