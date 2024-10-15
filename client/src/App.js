import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExamForm from './pages/ExamForm';
import TakeExam from './pages/TakeExam';
import ExamPage from './pages/ExamPage';
import HostedExam from './pages/HostedExam';
import Statistics from './pages/Statistics';
import EditDetails from './pages/EditDetails';
import ViewDetails from './pages/ViewDetails';
import TopExams from './pages/TopExams';
import RateExam from './pages/RateExam';
import License from './admin/License';
import MainContent from './admin/MainContent';
import Advertisement from './admin/Advertisement';
import Admin from './admin/Admin';
import AdminPassword from './admin/AdminPassword';
import AdTime from './admin/AdTime';
import ApproveExam from './admin/ApproveExam';
import ListExam from './admin/ListExam';
import Unauthorized from './admin/Unauthorized';
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
          <Route path="TopExams" element={<TopExams />} />
          <Route path="RateExam" element={<RateExam />} />
          <Route path="/License" element={<License />} />
          <Route path="/MainContent" element={<MainContent />} />
          <Route path="/Advertisement" element={<Advertisement />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/AdminPassword" element={<AdminPassword />} />          
          <Route path="/AdTime" element={<AdTime />} />
          <Route path="/ViewDetails/:examId" element={<ViewDetails />} />
          <Route path="/ApproveExam/:examId" element={<ApproveExam />} />     
          <Route path="/ListExam" element={<ListExam />} />
          <Route path="/Unauthorized" element={<Unauthorized />} />        
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;