

import { useEffect, useRef, useState } from 'react';
import SphereViewer from '@/components/SphereViewer/SphereViewer';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

import type { PanoramaItem, States } from '@/components/SphereViewer/type';
import type { Viewer } from '@/components/SphereViewer/SphereViewer';

import { chooseFilesUtils } from '@/utils';


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


/**
 * 默认的状态
 */
const defaultStates: States = {
  panoramaList: testDataList,
  mouseInteractionType: 'BROWSE_PANORAMA',
};

function SphereViewerBox() {
  const stateRef = useRef<States>(defaultStates);
  const sphereViewerRef = useRef<SphereViewer | null>(null);
  const viewerInsRef = useRef<Viewer | null>(null);
  const autorotateRef = useRef<AutorotatePlugin | null>(null);
  const markersPlugin = useRef<MarkersPlugin | null>(null);
  /**
   * 这里将所有状态都放入states中最初是为了在
   * addEventListener添加的监听回调中使用，但是实际上并未完成想要的效果
   * 临时使用const stateRef = useRef<States>(defaultStates);的方式
   */
  const [ states, setStates ] = useState(defaultStates);

  // 获取当前展示的全景图信息
  const getPanoramaInfo = (id?: string) => {
    if (typeof id ==='string') {
      return states.panoramaList.find(item => item.id === id)
    }
    return states.panoramaList.find(item => item.active)

  };
  /**
   * 缓存当前的状态，用于在动态添加的事件中使用
   */
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

    // 监听相机位置标记的点击事件
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
      }
    });

    return () => {
      sphereViewerRef.current?.destroy();
    }

  }, []);
  /**
   * 停止/开始自动旋转
   */
  const setAutorotate = () => {
    autorotateRef.current?.toggle();
  };
  /**
   * 点击进入退出编辑相机位置流程
   */
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
  /**
   * 编辑相机位置的鼠标点击全景图的监听事件
   * 这里使用useRef缓存函数引用，用于销毁事件监听
   */
  const viewerClickForEditCaneraPos = useRef((e: any) => {
    if (stateRef.current.mouseInteractionType !== 'EDIT_CAMERA_POS') return;

    const item = getPanoramaInfo();
    if (!item) return;

    const { pitch, yaw } = e.data;
    const id = `${item.id}_${pitch}_${yaw}`;
    item.cameraPos.push({ id, pitch, yaw });

    updateMarkers()
  });
  /**
   * 更新相机位置标记
   */
  const updateMarkers = ({renderMarkerDelay = 0}: {renderMarkerDelay?: number} = {}) => {
    markersPlugin.current?.clearMarkers();
    const item = getPanoramaInfo();
    setTimeout(() => {
      item?.cameraPos?.forEach?.((pos) => {
        markersPlugin.current?.addMarker({
          id: pos.id,
          position: { pitch: pos.pitch, yaw: pos.yaw },
          html: '<div class="switch-perspective-marker"></div>',
          scale: [1, 1.5]
        });
      });
    }, renderMarkerDelay);
  };
  /**
   * 切换的全景图
   */
  const switchPanorama = (item: PanoramaItem | string | undefined) => {
    if (!item) return;

    if (typeof item ==='string') {
      item = states.panoramaList.find((imgInfo) => imgInfo.id === item);
      if (!item) return;
    };

    viewerInsRef.current?.setPanorama(item.url);
    states.panoramaList.forEach((imgInfo) => (imgInfo.active = imgInfo.id === item.id));
    setStates({...states});
    updateMarkers({renderMarkerDelay: 1000})
  }
  /**
   * 上传体验图像
   */
  const handleUploadImg = async () => {

    const urlFiles = await chooseFilesUtils({returnType: 'url'});
    if (!urlFiles.length) return;

    const newItem: PanoramaItem = {
      id: `${Date.now()}`,
      url: urlFiles[0].url,
      cameraPos: []
    };

    states.panoramaList.push(newItem);
    setStates({...states});
    switchPanorama(newItem);
  }

  return (
    <>
      <div id="viewerContainer"></div>
      <div className="options absolute bottom-5 left-5 flex flex-col">
        <div className="">
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={setAutorotate}>停止/开始旋转</button>
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={handleEditCameraPos}>{states.mouseInteractionType === 'EDIT_CAMERA_POS' ? '完成编辑相机位置' : '编辑相机位置'}</button>
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={handleUploadImg}>上传一张全景图</button>
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
