import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { useUser } from "@clerk/clerk-react";

const ExamForm = () => {
  const { user } = useUser();
  const [examDetails, setExamDetails] = useState({
    Exam_Desc: '',
    Difficulty_Level: '',
    Subject: '',
    Exam_Category: '',
    No_of_Questions: '',
    Exam_Duration: '',
    Question_Duration: '',
    Author_Name: user?.firstName,
    Author_Id: user?.id,
    Exam_Valid_Upto: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionDetails, setQuestionDetails] = useState({
    Question: '',
    Answer_1: '',
    Answer_2: '',
    Answer_3: '',
    Answer_4: '',
    Correct_Answer: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExamDetails({
      ...examDetails,
      [name]: value,
    });
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionDetails({
      ...questionDetails,
      [name]: value,
    });
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleQuestionNext = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = questionDetails;

    setQuestions(updatedQuestions);
    setQuestionDetails({
      Question: '',
      Answer_1: '',
      Answer_2: '',
      Answer_3: '',
      Answer_4: '',
      Correct_Answer: ''
    });

    if (questionIndex + 1 === parseInt(examDetails.No_of_Questions)) {
      saveExamAndQuestions(updatedQuestions);
    } else {
      setQuestionIndex(questionIndex + 1);
      if (updatedQuestions[questionIndex + 1]) {
        setQuestionDetails(updatedQuestions[questionIndex + 1]);
      }
    }
  };

  const handleQuestionPrevious = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = questionDetails;

    setQuestions(updatedQuestions);
    setQuestionIndex(questionIndex - 1);
    setQuestionDetails(updatedQuestions[questionIndex - 1]);
  };

  const saveExamAndQuestions = async (questionsToSave) => {
    try {
      const examData = {
        ...examDetails,
        Exam_Valid_Upto: moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DD hh:mm A')
      };

      const examResponse = await axios.post('https://appsail-50020062734.development.catalystappsail.in/exams', examData);
      const examId = examResponse.data.Exam_Id;

      for (let i = 0; i < questionsToSave.length; i++) {
        const questionData = {
          Exam_ID: examId,
          ...questionsToSave[i]
        };
        await axios.post('https://appsail-50020062734.development.catalystappsail.in/questions', questionData);
      }

      toast.success('Exam and all questions saved successfully');
      navigate('/');
    } catch (error) {
      console.error('Error saving exam or questions:', error);
      toast.error('Error saving exam or questions');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Exam Form</h2>
      <form onSubmit={handleExamSubmit}>
        {/* Exam form fields */}
        <div className="mb-3">
          <label className="form-label">Exam Description</label>
          <input
            type="text"
            className="form-control"
            name="Exam_Desc"
            value={examDetails.Exam_Desc}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Difficulty Level</label>
          <input
            type="number"
            className="form-control"
            name="Difficulty_Level"
            value={examDetails.Difficulty_Level}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Subject</label>
          <input
            type="text"
            className="form-control"
            name="Subject"
            value={examDetails.Subject}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Exam Category</label>
          <input
            type="text"
            className="form-control"
            name="Exam_Category"
            value={examDetails.Exam_Category}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Number of Questions</label>
          <input
            type="number"
            className="form-control"
            name="No_of_Questions"
            value={examDetails.No_of_Questions}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Exam Duration (minutes)</label>
          <input
            type="number"
            className="form-control"
            name="Exam_Duration"
            value={examDetails.Exam_Duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Question Duration (minutes)</label>
          <input
            type="number"
            className="form-control"
            name="Question_Duration"
            value={examDetails.Question_Duration}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Exam Valid Up To</label>
          <input
            type="datetime-local"
            className="form-control"
            name="Exam_Valid_Upto"
            value={examDetails.Exam_Valid_Upto}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Question Form ({questionIndex + 1} of {examDetails.No_of_Questions})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="form-label">Question</label>
              <input
                type="text"
                className="form-control"
                name="Question"
                value={
                  questionDetails.Question}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Answer 1</label>
              <input
                type="text"
                className="form-control"
                name="Answer_1"
                value={questionDetails.Answer_1}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Answer 2</label>
              <input
                type="text"
                className="form-control"
                name="Answer_2"
                value={questionDetails.Answer_2}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Answer 3</label>
              <input
                type="text"
                className="form-control"
                name="Answer_3"
                value={questionDetails.Answer_3}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Answer 4</label>
              <input
                type="text"
                className="form-control"
                name="Answer_4"
                value={questionDetails.Answer_4}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Correct Answer</label>
              <select
                className="form-control"
                name="Correct_Answer"
                value={questionDetails.Correct_Answer}
                onChange={handleQuestionChange}
                required
              >
                <option value="" disabled>Select the correct answer</option>
                <option value="1">Answer 1</option>
                <option value="2">Answer 2</option>
                <option value="3">Answer 3</option>
                <option value="4">Answer 4</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          {questionIndex > 0 && (
            <Button variant="secondary" onClick={handleQuestionPrevious}>
              Previous
            </Button>
          )}
          <Button variant="primary" onClick={handleQuestionNext}>
            {questionIndex + 1 < examDetails.No_of_Questions ? 'Next' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExamForm;
