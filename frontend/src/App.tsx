import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CaseView from './pages/CaseView';
import ReportIntake from './pages/ReportIntake';

// TODO: add layout wrapper, auth-protected routes, 404 page

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases/:id" element={<CaseView />} />
        <Route path="/report" element={<ReportIntake />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
