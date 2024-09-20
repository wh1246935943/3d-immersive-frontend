

import SphereViewer, { type Viewer } from '@/components/SphereViewer/SphereViewer';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useEffect, useRef, useState } from 'react';

import './style.less';

const testDataList = [
  {
    id: '1',
    url: new URL(`@/assets/1.jpg`, import.meta.url).href,
    cameraPos: []
  },
  {
    id: '2',
    url: new URL(`@/assets/2.jpg`, import.meta.url).href,
    cameraPos: []
  },
  {
    id: '3',
    url: new URL(`@/assets/3.jpg`, import.meta.url).href,
    cameraPos: []
  },
];

interface CameraPos {
  id: string;
  pitch: number;
  yaw: number;
};

interface ImageListItem {
  id: string;
  url: string;
  active?: boolean;
  cameraPos: CameraPos[]
};

type MouseInteractionType = 'EDIT_CAMERA_POS' | 'BROWSE_PANORAMA';

type States = {
  panoramaList: ImageListItem[];
  mouseInteractionType: MouseInteractionType;
};

function SphereViewerBox() {

  const defaultStates: States = {
    panoramaList: testDataList,
    mouseInteractionType: 'BROWSE_PANORAMA',
  }

  const stateRef = useRef<States>(defaultStates);
  const sphereViewerRef = useRef<SphereViewer | null>(null);
  const viewerInsRef = useRef<Viewer | null>(null);
  const autorotateRef = useRef<AutorotatePlugin | null>(null);
  const markersPlugin = useRef<MarkersPlugin | null>(null);

  const [ states, setStates ] = useState(defaultStates);

  const getPanoramaInfo = (id?: string) => {
    if (typeof id ==='string') {
      return states.panoramaList.find(item => item.id === id)
    }
    return states.panoramaList.find(item => item.active)
  };

  useEffect(() => {
    stateRef.current = {...states}
  }, [states])

  useEffect(() => {
    sphereViewerRef.current = new SphereViewer({
      container: '#viewerContainer',
      defaultZoomLvl: 30,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: 0,
        }],
        [ MarkersPlugin, {
          clickEventOnMarker: false,
          markers: [],
        }]
      ],
    });

    viewerInsRef.current = sphereViewerRef.current.getIns;
  
    switchPanorama(states.panoramaList[1]);

    autorotateRef.current = viewerInsRef.current?.getPlugin<AutorotatePlugin>(AutorotatePlugin);

    markersPlugin.current = viewerInsRef.current?.getPlugin<MarkersPlugin>(MarkersPlugin);

    markersPlugin.current?.addEventListener('select-marker', (e) => {

      // 点击相机位置标记，切换全景图
      if (stateRef.current.mouseInteractionType === 'BROWSE_PANORAMA') switchPanorama(e.marker.id);

      // 删除当前点击的相机位置标记
      if (stateRef.current.mouseInteractionType === 'EDIT_CAMERA_POS') {

        markersPlugin.current?.removeMarker(e.marker.id);

        const item = getPanoramaInfo();

        if (!item) return;

        const index = item.cameraPos.findIndex(pos => pos.id === e.marker.id);

        if (index!== -1) item.cameraPos.splice(index, 1);

        // setStates({...states});

      }

    });

    return () => {

      sphereViewerRef.current?.destroy();

    }

  }, []);
  
  const setAutorotate = () => {

    autorotateRef.current?.toggle();

  };

  const handleEditCameraPos = () => {

    if (states.mouseInteractionType === 'EDIT_CAMERA_POS') {

      setStates({...states, mouseInteractionType: 'BROWSE_PANORAMA'})

      viewerInsRef.current?.removeEventListener('click', viewerClickForEditCaneraPos.current);

      return;

    };

    states.mouseInteractionType = 'EDIT_CAMERA_POS';
    setStates({...states});

    viewerInsRef.current?.addEventListener('click', viewerClickForEditCaneraPos.current);

  }

  const viewerClickForEditCaneraPos = useRef((e) => {
    
    if (stateRef.current.mouseInteractionType !== 'EDIT_CAMERA_POS') return;

    const item = getPanoramaInfo();

    if (!item) return;

    const { pitch, yaw } = e.data;

    const id = `${item.id}_${pitch}_${yaw}`;

    item.cameraPos.push({ id, pitch, yaw });

    // setStates({...states});

    // 向页面添加相机位置标记
    markersPlugin.current?.addMarker({
      id,
      position: { pitch, yaw },
      html: '<div class="switch-perspective-marker"></div>',
      scale: [1, 1.5]
    });
  });

  const switchPanorama = (item: ImageListItem | string | undefined) => {

    if (!item) return;

    if (typeof item ==='string') {

      item = states.panoramaList.find((imgInfo) => imgInfo.id === item);

      if (!item) return;

    };

    viewerInsRef.current?.setPanorama(item.url);

    states.panoramaList.forEach((imgInfo) => (imgInfo.active = imgInfo.id === item.id));

    setStates({...states});

  }

  return (
    <>
      <div id="viewerContainer"></div>
      <div className="options absolute bottom-5 left-5 flex flex-col">
        <div className="">
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={setAutorotate}>停止/开始旋转</button>
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={handleEditCameraPos}>{states.mouseInteractionType === 'EDIT_CAMERA_POS' ? '退出编辑相机位置' : '编辑相机位置'}</button>
        </div>
        <div className="flex mr-3 mt-3">
          {
            states.panoramaList.map((item) => {
              return (
                <img
                  key={item.id}
                  onClick={switchPanorama.bind(null, item)}
                  src={item.url}
                  className={`w-20 h-10 mr-3 cursor-pointer ${item.active ? 'border-2 border-green-700' : ''}`}
                />
              )
            })
          }
        </div>
      </div>
    </>
  )
}

export default SphereViewerBox
