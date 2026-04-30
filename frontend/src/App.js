import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Navbar from './components/Navbar';
import CompareBar from './components/CompareBar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import CollegesPage from './pages/CollegesPage';
import CollegeDetailPage from './pages/CollegeDetailPage';
import ComparePage from './pages/ComparePage';
import PredictorPage from './pages/PredictorPage';
import QAPage from './pages/QAPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SavedPage from './pages/SavedPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CompareProvider>
          <div className="min-h-screen bg-surface-950">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/colleges" element={<CollegesPage />} />
                <Route path="/colleges/:id" element={<CollegeDetailPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/predictor" element={<PredictorPage />} />
                <Route path="/qa" element={<QAPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/saved" element={<ProtectedRoute><SavedPage /></ProtectedRoute>} />
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <p className="text-6xl">🎓</p>
                    <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
                    <a href="/" className="text-indigo-400 hover:text-indigo-300">Go Home</a>
                  </div>
                } />
              </Routes>
            </main>
            <CompareBar />
            <Toaster position="bottom-right" toastOptions={{ style: { background:'#1e293b', color:'#e2e8f0', border:'1px solid rgba(255,255,255,0.1)' }, success: { iconTheme: { primary:'#6366f1', secondary:'white' } } }} />
          </div>
        </CompareProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
