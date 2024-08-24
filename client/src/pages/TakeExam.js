import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import moment from 'moment';
import { useUser } from '@clerk/clerk-react';

const TakeExam = () => {
  const { user } = useUser();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [ratings, setRatings] = useState({});
  const [authorName, setAuthorName] = useState('');
  const [subject, setSubject] = useState('');
  const [examCategory, setExamCategory] = useState('');

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`${apiUrl}/exams`);
        if (Array.isArray(response.data)) {
          const validExams = await Promise.all(response.data.map(async (exam) => {
            const now = moment();
            const validUpto = moment(exam.Exam_Valid_Upto, "YYYY-MM-DD hh:mm A");
            const publishDate = moment(exam.Publish_Date, "YYYY-MM-DD hh:mm A");
            const isReady = await checkExamReadiness(exam.Exam_Id, exam.No_of_Questions);
          
            return !exam.isDeleted && now.isBefore(validUpto) && now.isAfter(publishDate) && isReady ? exam : null;
          }));
    
          const filteredValidExams = validExams.filter(exam => exam !== null);
          setExams(filteredValidExams);
          setFilteredExams(filteredValidExams);
          fetchRatings(filteredValidExams);
        } else {
          console.error('Expected an array but received:', response.data);
          //toast.error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error retrieving exams:', error);
      }
    };    

    const checkExamReadiness = async (examId, noOfQuestions) => {
      try {
        const response = await axios.get(`${apiUrl}/valid-questions/${examId}`);
        const questionCount = response.data;
        return questionCount === noOfQuestions;
      } catch (error) {
        console.error(`Error checking exam readiness for Exam ID ${examId}:`, error);
        return false;
      }
    };

    const fetchRatings = async (exams) => {
      try {
        const ratingsData = {};
        for (const exam of exams) {
          const ratingResponse = await axios.get(`${apiUrl}/rating/${exam.Exam_Id}`);
          if (ratingResponse.data && ratingResponse.data.averageRating !== undefined) {
            ratingsData[exam.Exam_Id] = ratingResponse.data.averageRating;
          }
        }
        setRatings(ratingsData);
      } catch (error) {
        console.error('Error retrieving ratings:', error);
        //toast.error('Error retrieving ratings');
      }
    };

    fetchExams();
  }, [apiUrl]);

  useEffect(() => {
    filterExams();
  }, [authorName, subject, examCategory]);

  const filterExams = () => {
    let filtered = exams;
    if (authorName) {
      filtered = filtered.filter(exam => exam.Author_Name === authorName);
    }
    if (subject) {
      filtered = filtered.filter(exam => exam.Subject === subject);
    }
    if (examCategory) {
      filtered = filtered.filter(exam => exam.Exam_Category === examCategory);
    }
    setFilteredExams(filtered);
  };

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
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <a class="navbar-brand" href="/">Home</a>
          <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item">
              <a class="nav-link" href="/ExamForm">Host Exam</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/HostedExam">My Exam <span class="sr-only">(current)</span></a>
            </li>
          </ul>

          <div class="collapse navbar-collapse justify-content-end">
            <span class="navbar-text">
              Welcome, {user?.firstName || 'Guest'} 
            </span>
          </div>
        </div>
      </nav>
    <div className="container">
      <h2>Available Exams</h2>
      <div className="d-flex justify-content-between mb-3">
        <div className="flex-fill me-2">
          <label className="form-label fw-bold">Author Name</label>
          <select
            className="form-control"
            value={authorName}
            onChange={e => setAuthorName(e.target.value)}
          >
            <option value="">All</option>
            {[...new Set(exams.map(exam => exam.Author_Name))].map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div className="flex-fill me-2">
          <label className="form-label fw-bold">Subject</label>
          <select
            className="form-control"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          >
            <option value="">All</option>
            {[...new Set(exams.map(exam => exam.Subject))].map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        <div className="flex-fill">
          <label className="form-label fw-bold">Exam Category</label>
          <select
            className="form-control"
            value={examCategory}
            onChange={e => setExamCategory(e.target.value)}
          >
            <option value="">All</option>
            {[...new Set(exams.map(exam => exam.Exam_Category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>
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
                <td>
                  {ratings[exam.Exam_Id] !== undefined 
                    ? Number.isInteger(ratings[exam.Exam_Id])
                      ? `${ratings[exam.Exam_Id]} of 5`
                      : `${ratings[exam.Exam_Id].toFixed(1)} of 5`
                    : 'N/A'}
                </td>
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

export default TakeExam;
