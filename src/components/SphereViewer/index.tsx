

import SphereViewer, { type Viewer } from '@/components/SphereViewer/SphereViewer';

import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { useEffect, useRef, useState } from 'react';

import './style.less';

// import img1 from '@/assets/1.jpg';

// import img2 from '@/assets/2.jpg';

const imgList = [
  new URL(`@/assets/1.jpg`, import.meta.url).href,
  new URL(`@/assets/2.jpg`, import.meta.url).href,
  new URL(`@/assets/3.jpg`, import.meta.url).href
];

function SphereViewerBox() {

  const sphereViewerRef = useRef<SphereViewer | null>(null);
  const viewerInsRef = useRef<Viewer | null>(null);
  const autorotateRef = useRef<AutorotatePlugin | null>(null);

  const [ imageList ] = useState<string[]>(imgList);

  useEffect(() => {

    sphereViewerRef.current = new SphereViewer({
      container: '#viewerContainer',
      panorama: imageList[0],
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
      <div className="options absolute bottom-5 left-5 flex flex-col">
        <div className="">
          <button className="bg-blue-500 text-slate-50 mr-3 p-2" onClick={setPosition}>停止/开始旋转</button>
        </div>
        <div className="flex mr-3 mt-3">
          {
            imageList.map((item, index) => {
              return (
                <img key={index} onClick={switchPanorama.bind(null, item)} src={item} className="w-20 h-10 mr-3" alt="" />
              )
            })
          }
        </div>
      </div>
    </>
  )
}

export default SphereViewerBox
