import { Viewer, type ViewerConfig } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

export default class SphereViewer {

  private viewer: Viewer | null = null;

  constructor(options: ViewerConfig) {
    this.initViewer(options)
  }

  private initViewer (options: ViewerConfig) {
    this.viewer = new Viewer({
      fisheye: true,
      ...options
    });
  };

  get getIns(): Viewer {
    return this.viewer as Viewer
  }

  // 销毁全景查看器
  public destroy() {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
};

export { type Viewer };