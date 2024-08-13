import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import moment from 'moment';
import { useUser } from '@clerk/clerk-react';

const TopExams = () => {
  const { user } = useUser();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [ratings, setRatings] = useState({});

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${apiUrl}/exams`);
        if (Array.isArray(response.data)) {
          const validExams = response.data.filter(exam => {
            const now = moment();
            const validUpto = moment(exam.Exam_Valid_Upto, "YYYY-MM-DD hh:mm A");
            const publishDate = moment(exam.Publish_Date, "YYYY-MM-DD hh:mm A");
          
            return !exam.isDeleted && now.isBefore(validUpto) && now.isAfter(publishDate);
          });
          setExams(validExams);
          fetchRatings(validExams);
        } else {
          console.error('Expected an array but received:', response.data);
        }
      } catch (error) {
        console.error('Error retrieving exams:', error);
      }
    };

    const fetchRatings = async (exams) => {
      try {
        const ratingsData = {};
        for (const exam of exams) {
          const ratingResponse = await axios.get(`${apiUrl}/rating/${exam.Exam_Id}`);
          if (ratingResponse.data.length > 0) {
            ratingsData[exam.Exam_Id] = ratingResponse.data[0].averageRating;
          }
        }
        setRatings(ratingsData);
        sortAndFilterExams(exams, ratingsData);
      } catch (error) {
        console.error('Error retrieving ratings:', error);
      }
    };

    const sortAndFilterExams = (exams, ratingsData) => {
      const sortedExams = exams.sort((a, b) => {
        const ratingA = ratingsData[a.Exam_Id] || 0;
        const ratingB = ratingsData[b.Exam_Id] || 0;
        return ratingB - ratingA; // Sort descending
      });
      setFilteredExams(sortedExams);
    };

    fetchExams();
  }, [apiUrl]);

  const handleTakeExam = (exam) => {
    navigate(`/take-exam/${exam.Exam_Id}`, {
      state: {
        numberOfQuestions: exam.No_of_Questions,
        examDuration: exam.Exam_Duration,
        questionDuration: exam.Question_Duration,
      },
    });
  };

  return (
   <div>
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <a className="navbar-brand" href="/">Home</a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a className="nav-link" href="/ExamForm">Host Exam</a>
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
    <div className="container">
      <h2>Top Rated Exams</h2>
      <Table className="table table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Exam ID</th>
            <th>Description</th>
            <th>Subject</th>
            <th>Exam Category</th>
            <th>Author</th>
            <th>Rating</th>
            <th>Difficulty Level</th>            
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExams.length > 0 ? (
            filteredExams.map((exam, index) => (
              <tr key={index}>
                <td>{exam.Exam_Id}</td>
                <td>{exam.Exam_Desc}</td>
                <td>{exam.Subject}</td>
                <td>{exam.Exam_Category}</td>
                <td>{exam.Author_Name}</td>
                <td>{ratings[exam.Exam_Id]?.toFixed(1) || 'N/A'} of 5</td>
                <td>
                  <span className={`text fw-bold ${
                    exam.Difficulty_Level === 'Easy'
                      ? 'text-success'
                      : exam.Difficulty_Level === 'Medium'
                      ? 'text-warning'
                      : exam.Difficulty_Level === 'Hard'
                      ? 'text-danger'
                      : ''
                  }`}>
                    {exam.Difficulty_Level}
                  </span>
                </td>
                <td>
                  <Button
                    variant="primary"
                    onClick={() => handleTakeExam(exam)}
                  >
                    Take Exam
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No exams available.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  </div>
  );
};

export default TopExams;
