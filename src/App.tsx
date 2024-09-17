

import SphereViewer, { type Viewer } from './components/SphereViewer';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import { useEffect } from 'react';

import './App.css'

import img1 from './assets/1.jpg';
import img2 from './assets/2.jpg';

function App() {

  let sphereViewer: SphereViewer = null as unknown as SphereViewer;
  let viewerIns: Viewer = null as unknown as Viewer;
  let autorotate: AutorotatePlugin = null as unknown as AutorotatePlugin

  useEffect(() => {

    sphereViewer = new SphereViewer({
      container: '#viewerContainer',
      panorama: img2,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: 0,
        }],
      ],
    });

    viewerIns = sphereViewer.getIns;

    autorotate = viewerIns.getPlugin(AutorotatePlugin);

    autorotate.start();

    return () => {
      sphereViewer.destroy();
    }

  }, []);

  const setPosition = () => {
    // viewerIns.animate({
    //   yaw: viewerIns.getPosition().yaw + 1,
    //   pitch: 0,
    //   zoom: 0,
    //   speed: '10rpm',
    // })
    autorotate.toggle();
  };

  const switchPanorama = (img: string) => {
    viewerIns.setPanorama(img)
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

export default App
