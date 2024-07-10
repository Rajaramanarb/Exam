import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExamForm from './pages/ExamForm';
import TakeExam from './pages/TakeExam';
import ExamPage from './pages/ExamPage';
import HostedExam from './pages/HostedExam';
import Statistics from './pages/Statistics';
import EditDetails from './pages/EditDetails';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
    
  return (
    <div>
      <Routes>
        <Route path="/" element={<Outlet />}>
          <Route index element={<HomePage />} />
          <Route path="ExamForm" element={<ExamForm />} />
          <Route path="TakeExam" element={<TakeExam />} />
          <Route path="/take-exam/:examId" element={<ExamPage />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="HostedExam" element={<HostedExam />} />
          <Route path="/EditDetails/:examId" element={<EditDetails />} />
        </Route>
      </Routes>
      <hr />
      <ToastContainer />
    </div>
  );
};

export default App;