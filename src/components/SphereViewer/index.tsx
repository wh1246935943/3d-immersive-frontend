

import SphereViewer, { type Viewer } from '@/components/SphereViewer/SphereViewer';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { useEffect, useRef, useState } from 'react';

import './style.less';

const imgList = [
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
  cameraPos: CameraPos[]
};

type MouseInteractionType = 'EDIT_CAMERA_POS' | 'BROWSE_PANORAMA';

// let viewerClickForEditCaneraPos;

function SphereViewerBox() {

  const sphereViewerRef = useRef<SphereViewer | null>(null);
  const viewerInsRef = useRef<Viewer | null>(null);
  const autorotateRef = useRef<AutorotatePlugin | null>(null);
  const markersPlugin = useRef<MarkersPlugin | null>(null);

  const [ imageList, setImageList ] = useState<ImageListItem[]>(imgList);
  const [ imageId, setImageId ] = useState('');
  const [ mouseInteractionType, setMouseInteractionType ] = useState<MouseInteractionType>('BROWSE_PANORAMA');


  const getImageInfoById = (id: string) => {
    return imageList.find(item => item.id === id)
  };

  useEffect(() => {

    sphereViewerRef.current = new SphereViewer({
      container: '#viewerContainer',
      // panorama: imageList[imageIndex].url,
      defaultZoomLvl: 30,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: 0,
        }],
        [ MarkersPlugin, {
          clickEventOnMarker: true,
          markers: [],
        }]
      ],
    });

    viewerInsRef.current = sphereViewerRef.current.getIns;
  
    switchPanorama(imageList[1]);

    viewerInsRef.current.addEventListener('ready', viewerReady);

    autorotateRef.current = viewerInsRef.current?.getPlugin<AutorotatePlugin>(AutorotatePlugin);

    markersPlugin.current = viewerInsRef.current?.getPlugin<MarkersPlugin>(MarkersPlugin);

    markersPlugin.current?.addEventListener('select-marker', (e) => {

      // 点击相机位置标记，切换全景图
      if (mouseInteractionType === 'BROWSE_PANORAMA') switchPanorama(getImageInfoById(e.marker.id));

      // 删除当前点击的相机位置标记
      if (mouseInteractionType === 'EDIT_CAMERA_POS') {

        markersPlugin.current?.removeMarker(e.marker.id);

        const item = getImageInfoById(e.marker.id);

        if (!item) return;

        const index = item.cameraPos.findIndex(pos => pos.id === e.marker.id);

        if (index!== -1) item.cameraPos.splice(index, 1);

        setImageList([...imageList]);

      }

    });

    return () => {
      sphereViewerRef.current?.destroy();
    }

  }, []);

  const viewerReady = () => {
    // ...
  };
  
  const setAutorotate = () => {
    autorotateRef.current?.toggle();
  };

  const handleEditCameraPos = () => {

    if (mouseInteractionType === 'EDIT_CAMERA_POS') {

      setMouseInteractionType('BROWSE_PANORAMA');

      viewerInsRef.current?.removeEventListener('click', viewerClickForEditCaneraPos.current);

      return;

    };

    setMouseInteractionType(() => {

      viewerInsRef.current?.addEventListener('click', viewerClickForEditCaneraPos.current);
      
      return 'EDIT_CAMERA_POS';
    });


  }

  const viewerClickForEditCaneraPos = useRef((e) => {
    
    if (mouseInteractionType !== 'EDIT_CAMERA_POS') return;

    const item = getImageInfoById(imageId);

    if (!item) return;

    const { pitch, yaw } = e.data;

    const id = `${imageId}_${pitch}_${yaw}`;

    item.cameraPos.push({ id, pitch, yaw });

    setImageList([...imageList]);

    // 向页面添加相机位置标记
    markersPlugin.current?.addMarker({
      id,
      position: { pitch, yaw },
      html: '<div class="switch-perspective-marker"></div>',
      scale: [1, 1.5]
    });
  });

  
  // 相机位置编辑状态下，点击全景图，添加相机位置标记
  // viewerClickForEditCaneraPos.current = (e) => {
  //   debugger

  //   if (mouseInteractionType !== 'EDIT_CAMERA_POS') return;

  //   const item = getImageInfoById(imageId);

  //   if (!item) return;

  //   const { pitch, yaw } = e.data;

  //   const id = `${imageId}_${pitch}_${yaw}`;

  //   item.cameraPos.push({ id, pitch, yaw });

  //   setImageList([...imageList]);

  //   // 向页面添加相机位置标记
  //   markersPlugin.current?.addMarker({
  //     id,
  //     position: { pitch, yaw },
  //     html: '<div class="switch-perspective-marker"></div>',
  //     scale: [1, 1.5]
  //   });
  // };

  const switchPanorama = (item: ImageListItem | undefined) => {

    if (!item) return;

    viewerInsRef.current?.setPanorama(item.url);

    setImageId(item.id)

  }

  return (
    <>
      <div id="viewerContainer"></div>
      <div className="options absolute bottom-5 left-5 flex flex-col">
        <div className="">
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={setAutorotate}>停止/开始旋转</button>
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={handleEditCameraPos}>{mouseInteractionType === 'EDIT_CAMERA_POS' ? '退出编辑相机位置' : '编辑相机位置'}</button>
        </div>
        <div className="flex mr-3 mt-3">
          {
            imageList.map((item) => {
              return (
                <img
                  key={item.id}
                  onClick={switchPanorama.bind(null, item)}
                  src={item.url}
                  className={`w-20 h-10 mr-3 cursor-pointer ${imageId === item.id ? 'border-2 border-green-700' : ''}`}
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
