import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SlideshowList } from './components/SlideshowList';
import { SlideshowViewer } from './components/SlideshowViewer';

export default function SlideshowApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SlideshowList />} />
        <Route path="/:name" element={<SlideshowViewer />} />
      </Routes>
    </BrowserRouter>
  );
}
