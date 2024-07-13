import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUser } from "@clerk/clerk-react";
import '../css/Statistics.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Statistics = () => {
  const [examResults, setExamResults] = useState([]);
  const { user } = useUser();
  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExamResults = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`${apiUrl}/exam-results/${user.id}`);
          setExamResults(response.data);
        } catch (error) {
          console.error('Error fetching exam results:', error);
        }
      }
    };

    fetchExamResults();
  }, [user]);

  const renderPieChart = (examResult) => {
    const totalQuestions = examResult.Responses.length;
    const score = examResult.Score;

    const data = {
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          data: [score, totalQuestions - score],
          backgroundColor: ['#36A2EB', '#FF6384'],
          hoverBackgroundColor: ['#36A2EB', '#FF6384'],
        },
      ],
    };

    const options = {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.raw;
              const percentage = ((value / totalQuestions) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div key={examResult._id} className="chart-container">
        <h3 className="chart-title">Exam Id {examResult.Exam_Id}</h3>
        <div className="chart-wrapper">
          <Pie data={data} options={options} />
        </div>
      </div>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="statistics-page">
      <h1 className="page-title">Exam Statistics</h1>
      <div className="charts-grid">
        {examResults.map(renderPieChart)}
      </div>
    </div>
  );
};

export default Statistics;
