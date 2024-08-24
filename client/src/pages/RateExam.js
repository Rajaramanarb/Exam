import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Table, Button, FormControl } from 'react-bootstrap'; // Import FormControl
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RateExam = () => {
  const { user } = useUser();
  const [exams, setExams] = useState([]);
  const [editingRating, setEditingRating] = useState(null); // State for tracking which exam is being edited
  const [newRating, setNewRating] = useState({}); // State for storing new rating values
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        const examResultsResponse = await axios.get(`${apiUrl}/exam-results/${user.id}`);
        const examResults = examResultsResponse.data;

        const examDetailsPromises = examResults.map(async (result) => {
          const examDetailsResponse = await axios.get(`${apiUrl}/exams/${result.Exam_ID}`);
          return {
            ...result,
            ...examDetailsResponse.data,
          };
        });

        const examsWithDetails = await Promise.all(examDetailsPromises);
        setExams(examsWithDetails);
      } catch (error) {
        console.error('Error fetching exams:', error);
        toast.error('Error fetching exams');
      }
    };

    if (user) {
      fetchExamData();
    }
  }, [user]);

  const handleEdit = (examId) => {
    setEditingRating(examId);
    setNewRating((prev) => ({ ...prev, [examId]: exams.find((exam) => exam.Exam_ID === examId)?.Rating || 0 }));
  };

  const handleRatingChange = (examId, value) => {
    const numericValue = Number(value); // Convert value to number
    if (numericValue >= 1 && numericValue <= 5 && Number.isInteger(numericValue)) {
      setNewRating((prev) => ({ ...prev, [examId]: numericValue }));
    }
  };
  

  const handleSaveRating = async (examId) => {
    try {
      const response = await axios.put(`${apiUrl}/exam-results/${examId}/${user.id}`, { Rating: newRating[examId] });
      if (response.status === 200) {
        toast.success('Rating updated successfully.');
        setExams((prevExams) =>
          prevExams.map((exam) => (exam.Exam_ID === examId ? { ...exam, Rating: newRating[examId] } : exam))
        );
        setEditingRating(null);
      } else {
        toast.error('Failed to update rating.');
      }
    } catch (error) {
      console.error('Error updating rating:', error);
      toast.error('Error updating rating.');
    }
  }; 
  
  const handleCancelEdit = () => {
    setEditingRating(null);
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
              <a className="nav-link" href="/TakeExam">Take Exam <span className="sr-only">(current)</span></a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/ExamForm">Host Exam</a>
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
      <h2>Hosted Exams</h2>
      <Table className="table table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Exam ID</th>
            <th>Description</th>
            <th>Subject</th>
            <th>Exam Category</th>
            <th>Difficulty Level</th>
            <th>Score</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.length > 0 ? (
            exams.map((exam, index) => (
              <tr key={index}>
                <td>{exam.Exam_ID}</td>
                <td>{exam.Exam_Desc}</td>
                <td>{exam.Subject}</td>
                <td>{exam.Exam_Category}</td>
                <td>
                  <span
                    className={`text fw-bold ${
                      exam.Difficulty_Level === 'Easy'
                        ? 'text-success'
                        : exam.Difficulty_Level === 'Medium'
                        ? 'text-warning'
                        : exam.Difficulty_Level === 'Hard'
                        ? 'text-danger'
                        : ''
                    }`}
                  >
                    {exam.Difficulty_Level}
                  </span>
                </td>
                <td>{exam.Score} / {exam.Responses.length}</td>
                <td>
                  {editingRating === exam.Exam_ID ? (
                    <div className="d-flex align-items-center">
                      <FormControl
                        type="number"
                        value={newRating[exam.Exam_ID]}
                        onChange={(e) => handleRatingChange(exam.Exam_ID, e.target.value)}
                        min={1}
                        max={5}
                        style={{ width: '60px' }}
                      />
                      <span className="ms-1">/ 5</span>
                    </div>
                  ) : (
                    `${exam.Rating} / 5`
                  )}
                </td>
                <td>
                  {editingRating === exam.Exam_ID ? (
                    <>
                      <Button variant="success" onClick={() => handleSaveRating(exam.Exam_ID)} className="me-2">Save</Button>
                      <Button variant="danger" onClick={handleCancelEdit}>Cancel</Button>
                    </>
                  ) : (
                    <Button variant="primary" className="me-2" onClick={() => handleEdit(exam.Exam_ID)}>Rate Exam</Button>
                  )}
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

export default RateExam;
