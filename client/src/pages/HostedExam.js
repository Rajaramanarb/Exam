import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const HostedExam = () => {
  const { user } = useUser();
  const [exams, setExams] = useState([]);
  const [ratings, setRatings] = useState({});
  const [editableExams, setEditableExams] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/hosted-exams/${user.id}`);
        setExams(response.data);
        fetchRatings(response.data);
        fetchEditStatus(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    };

    const fetchRatings = async (exams) => {
      try {
        const ratingsData = {};
        for (const exam of exams) {
          const ratingResponse = await axios.get(`http://localhost:9000/rating/${exam.Exam_Id}`);
          if (ratingResponse.data.length > 0) {
            ratingsData[exam.Exam_Id] = ratingResponse.data[0].averageRating;
          }
        }
        setRatings(ratingsData);
      } catch (error) {
        console.error('Error retrieving ratings:', error);
      }
    };

    const fetchEditStatus = async (exams) => {
      try {
        const editStatusData = {};
        for (const exam of exams) {
          const resultResponse = await axios.get(`http://localhost:9000/examresults/${exam.Exam_Id}`);
          editStatusData[exam.Exam_Id] = !resultResponse.data || resultResponse.data.length === 0;
        }
        setEditableExams(editStatusData);
      } catch (error) {
        console.error('Error fetching exam results:', error);
      }
    };

    if (user) {
      fetchExams();
    }
  }, [user]);

  const handleEdit = (examId) => {
    navigate(`/EditDetails/${examId}`);
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
              <a class="nav-link" href="/TakeExam">Take Exam <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/ExamForm">Host Exam</a>
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
      <h2>Hosted Exams</h2>
      <Table className="table table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Exam ID</th>
            <th>Description</th>
            <th>Subject</th>
            <th>Rating</th>
            <th>Difficulty Level</th>
            <th>Published On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam, index) => (
            <tr key={index}>
              <td>{exam.Exam_Id}</td>
              <td>{exam.Exam_Desc}</td>
              <td>{exam.Subject}</td>
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
              <td>{moment(exam.Audit_Details).format('YYYY-MM-DD hh:mm A')}</td>
              <td>
                {editableExams[exam.Exam_Id] && (
                  <Button
                    variant="warning"
                    onClick={() => handleEdit(exam.Exam_Id)}
                  >
                    ✏️ Edit
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </div>
  );
};

export default HostedExam;
