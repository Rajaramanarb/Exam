import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Table } from 'react-bootstrap';
import moment from 'moment';
import { useUser } from '@clerk/clerk-react';

const AdTime = () => {
  const { user } = useUser();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [ratings, setRatings] = useState({});
  const [editingExamId, setEditingExamId] = useState(null); // Track the exam being edited
  const [editedTime, setEditedTime] = useState(''); // Track the new time input

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;
  const location = useLocation(); // Getting the current location
  const navigate = useNavigate(); // Hook for programmatic navigation

  useEffect(() => {
    // Check if the previous page is not '/Admin', redirect to '/Admin'
    if (location.state?.from !== '/Admin') {
      navigate('/Admin');
    }
  }, [location, navigate]);

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
          if (ratingResponse.data && ratingResponse.data.averageRating !== undefined) {
            ratingsData[exam.Exam_Id] = ratingResponse.data.averageRating;
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

  const handleEditClick = (examId, currentTime) => {
    setEditingExamId(examId);
    setEditedTime(currentTime); // Set the current time as the initial value
  };

  const handleSaveClick = async (examId) => {
    try {
      // Update the time in the backend
      const response = await axios.put(`${apiUrl}/exams/${examId}`, { time: editedTime });
      if (response.status === 200) {
        toast.success('Time updated successfully');
  
        // Update the local state with the new time
        setExams((prevExams) =>
          prevExams.map((exam) =>
            exam.Exam_Id === examId ? { ...exam, time: editedTime } : exam
          )
        );
  
        // Also update the filteredExams state
        setFilteredExams((prevFilteredExams) =>
          prevFilteredExams.map((exam) =>
            exam.Exam_Id === examId ? { ...exam, time: editedTime } : exam
          )
        );
  
        // Exit edit mode
        setEditingExamId(null);
      } else {
        toast.error('Failed to update time');
      }
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Failed to update time');
    }
  };
  

  const handleCancelClick = () => {
    setEditingExamId(null); // Exit edit mode without saving
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
              <th>Ad Time (in sec)</th>
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
                    {editingExamId === exam.Exam_Id ? (
                      <input
                        type="text"
                        value={editedTime}
                        onChange={(e) => setEditedTime(e.target.value)}
                      />
                    ) : (
                      exam.time
                    )}
                  </td>
                  <td>
                    {editingExamId === exam.Exam_Id ? (
                      <>
                        <Button variant="success" className="me-2" onClick={() => handleSaveClick(exam.Exam_Id)}>
                          Save
                        </Button>
                        <Button variant="danger" onClick={handleCancelClick}>
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button variant="primary" className="me-2" onClick={() => handleEditClick(exam.Exam_Id, exam.time)}>
                        Edit Time
                      </Button>
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

export default AdTime;
