import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import moment from 'moment';

const TakeExam = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [subject, setSubject] = useState('');
  const [examCategory, setExamCategory] = useState('');

  const navigate = useNavigate();

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/exams`);
        console.log('API Response:', response);
    
        if (Array.isArray(response.data)) {
          const validExams = response.data.filter(exam => moment().isBefore(moment(exam.Exam_Valid_Upto, "YYYY-MM-DD hh:mm A")));
          setExams(validExams);
          setFilteredExams(validExams);
        } else {
          console.error('Expected an array but received:', response.data);
          toast.error('Unexpected data format');
        }
      } catch (error) {
        console.error('Error retrieving exams:', error);
        toast.error('Error retrieving exams');
      }
    };    

    fetchExams();
  }, []);

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
    <div className="container mt-5">
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
      <Table class="table table-hover">
        <thead class="thead-dark">
          <tr>
            <th>Exam ID</th>
            <th>Description</th>
            <th>Subject</th>
            <th>Author</th>
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
                <td>{exam.Author_Name}</td>
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
              <td colSpan="6" className="text-center">No exams available.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TakeExam;
