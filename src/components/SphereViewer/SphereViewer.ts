import { Viewer, type ViewerConfig } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css'

export default class SphereViewer {

  private viewer: Viewer | null = null;

  constructor(options: ViewerConfig) {
    this.initViewer(options)
  }

  private initViewer ({fisheye = true, ...rest}: ViewerConfig) {

    this.viewer = new Viewer({
      fisheye,
      ...rest
    });
  };

  get getIns(): Viewer {
    return this.viewer as Viewer
  };

  // 销毁全景查看器
  public destroy() {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
};

export { type Viewer };