import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Breathe from './pages/Breathe';
import Sound from './pages/Sound';

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Breathe />} />
        <Route path="/sound" element={<Sound />} />
      </Routes>
    </BrowserRouter>
  );
}
