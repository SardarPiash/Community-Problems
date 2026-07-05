import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Placeholder from './pages/Placeholder.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Placeholder title="Login" stage="Stage 2" />} />
        <Route path="/register" element={<Placeholder title="Register" stage="Stage 2" />} />
        <Route path="/complaints" element={<Placeholder title="My Complaints" stage="Stage 4" />} />
        <Route path="/complaints/new" element={<Placeholder title="Submit Complaint" stage="Stage 3" />} />
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}
