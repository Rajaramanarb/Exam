import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
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
        const response = await axios.get('${apiUrl}/exams');
        const validExams = response.data.filter(exam => moment().isBefore(moment(exam.Exam_Valid_Upto, "YYYY-MM-DD hh:mm A")));
        setExams(validExams);
        setFilteredExams(validExams);
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
          <label className="form-label">Author Name</label>
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
          <label className="form-label">Subject</label>
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
          <label className="form-label">Exam Category</label>
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
      <div>
        {filteredExams.length > 0 ? (
          filteredExams.map((exam, index) => (
            <div key={index} className="card mb-3">
              <div className="card-header text-center">
                {exam.Exam_Desc}
              </div>
              <div className="d-flex flex-row card-body">
                <div className="flex-fill me-3">
                  <h5 className="card-title">{exam.Subject}</h5>
                  <p className="card-text">Author: {exam.Author_Name}</p>
                  <p className="card-text">Category: {exam.Exam_Category}</p>
                  <p className="card-text">Difficulty Level: {exam.Difficulty_Level}</p>
                  <p className="card-text">Number of Questions: {exam.No_of_Questions}</p>
                </div>
                <div className="flex-fill me-3">
                  <p className="card-text">Exam Duration: {exam.Exam_Duration} min</p>
                  <p className="card-text">Question Duration: {exam.Question_Duration} min</p>
                  <p className="card-text">Valid Upto: {exam.Exam_Valid_Upto}</p>
                  <p className="card-text">Exam ID: {exam.Exam_Id}</p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    variant="primary"
                    onClick={() => handleTakeExam(exam)}
                  >
                    Take Exam
                  </Button>
                </div>
              </div>
              <div className="card-footer text-body-secondary text-center">
                {moment(exam.Audit_Details, "YYYY-MM-DD hh:mm A").fromNow()}
              </div>
            </div>
          ))
        ) : (
          <p>No exams available.</p>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
