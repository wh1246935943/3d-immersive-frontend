

import SphereViewer, { type Viewer } from '@/components/SphereViewer/SphereViewer';

import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { useEffect, useRef } from 'react';

import './style.less';

import img1 from '@/assets/1.jpg';

import img2 from '@/assets/2.jpg';

function SphereViewerBox() {

  const sphereViewerRef = useRef<SphereViewer | null>(null);
  const viewerInsRef = useRef<Viewer | null>(null);
  const autorotateRef = useRef<AutorotatePlugin | null>(null);

  useEffect(() => {

    sphereViewerRef.current = new SphereViewer({
      container: '#viewerContainer',
      panorama: img2,
      defaultZoomLvl: 30,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: 0,
        }],
      ],
    });

    viewerInsRef.current = sphereViewerRef.current.getIns;
    autorotateRef.current = viewerInsRef.current.getPlugin<AutorotatePlugin>(AutorotatePlugin);
    autorotateRef.current.start();

    return () => {
      sphereViewerRef.current?.destroy();
    }

  }, []);

  const setPosition = () => {
    autorotateRef.current?.toggle();
  };

  const switchPanorama = (img: string) => {
    viewerInsRef.current?.setPanorama(img)
  }

  return (
    <>
      <div id="viewerContainer"></div>
      <div className="option absolute bottom-20 left-10 flex">
        <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={setPosition}>停止/开始旋转</button>
        <img onClick={switchPanorama.bind(null, img1)} src={img1} className="w-20 h-10 mr-3" alt="" />
        <img onClick={switchPanorama.bind(null, img2)} src={img2} className="w-20 h-10" alt="" />
      </div>
    </>
  )
}

export default SphereViewerBox
