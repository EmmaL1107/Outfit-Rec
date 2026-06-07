import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TabBar from './components/TabBar';
import Wardrobe from './pages/Wardrobe';
import TodayOutfit from './pages/TodayOutfit';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--color-background)]">
        <Routes>
          <Route path="/" element={<TodayOutfit />} />
          <Route path="/wardrobe" element={<Wardrobe />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <TabBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
