export type CameraPos = {
  id: string;
  pitch: number;
  yaw: number;
}

export type PanoramaItem = {
  id: string;
  url: string;
  active?: boolean;
  cameraPos: CameraPos[];
}

export type MouseInteractionType = 'EDIT_CAMERA_POS' | 'BROWSE_PANORAMA';

export type States = {
  panoramaList: PanoramaItem[];
  mouseInteractionType: MouseInteractionType;
};