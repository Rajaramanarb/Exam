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
  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExamResults = async () => {
      if (user && user.id) {
        try {
          const response = await axios.get(`${apiUrl}/exam-results/${user.id}`);
          const results = response.data;

          for (let result of results) {
            const questionsResponse = await axios.get(`${apiUrl}/questions/${result.Exam_ID}`);
            const questions = questionsResponse.data;

            result.Questions = questions;
          }

          setExamResults(results);
        } catch (error) {
          console.error('Error fetching exam results:', error);
        }
      }
    };

    fetchExamResults();
  }, [user]);

  const calculateStatistics = (examResult) => {
    const overall = { correct: 0, total: 0 };
    const difficultyLevels = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 }
    };

    examResult.Responses.forEach(response => {
      overall.total += 1;
      if (response.Is_Correct) {
        overall.correct += 1;
      }

      const question = examResult.Questions.find(q => q.Question_ID === response.Question_ID);
      if (question && question.Difficulty_Level) {
        const level = question.Difficulty_Level.toLowerCase();
        if (difficultyLevels[level]) {
          difficultyLevels[level].total += 1;
          if (response.Is_Correct) {
            difficultyLevels[level].correct += 1;
          }
        }
      }
    });

    return { overall, difficultyLevels };
  };

  const renderPieChart = (data, title, size = 'large') => {
    const chartData = {
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          data: [data.correct, data.total - data.correct],
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
              const percentage = ((value / data.total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
      maintainAspectRatio: false,
    };

    return (
      <div className={`chart-container ${size}`} key={title}>
        <h3 className="chart-title">{title}</h3>
        <div className="chart-wrapper">
          <Pie data={chartData} options={options} />
        </div>
      </div>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href="/">Home</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a className="nav-link" href="/TakeExam">Take Exam</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/HostedExam">My Exam <span className="sr-only">(current)</span></a>
            </li>
          </ul>

          <div className="collapse navbar-collapse justify-content-end">
            <span className="navbar-text">
              Welcome, {user?.firstName || 'Guest'} 
            </span>
          </div>
        </div>
      </nav>
      <div className="statistics-page">
        <h1 className="page-title">Exam Statistics</h1>
        <div className="charts-grid">
          {examResults.map((examResult) => {
            const { overall, difficultyLevels } = calculateStatistics(examResult);

            return (
              <div key={examResult._id} className="exam-card">
                <div className="overall-chart">
                  {renderPieChart(overall, `Overall Exam (ID: ${examResult.Exam_ID})`)}
                </div>
                <div className="difficulty-charts">
                  {difficultyLevels.easy.total > 0 && renderPieChart(difficultyLevels.easy, 'Easy Questions', 'small')}
                  {difficultyLevels.medium.total > 0 && renderPieChart(difficultyLevels.medium, 'Medium Questions', 'small')}
                  {difficultyLevels.hard.total > 0 && renderPieChart(difficultyLevels.hard, 'Hard Questions', 'small')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
