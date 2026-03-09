import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Meditate from './pages/Meditate';
import MeditationSession from './pages/MeditationSession';
import Breathe from './pages/Breathe';
import Relax from './pages/Relax';

export default function App() {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/meditate" element={<Meditate />} />
        <Route path="/meditate/:id" element={<MeditationSession />} />
        <Route path="/breathe" element={<Breathe />} />
        <Route path="/relax" element={<Relax />} />
      </Routes>
    </BrowserRouter>
  );
}
