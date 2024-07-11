import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useUser } from "@clerk/clerk-react";

const ExamForm = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [examDetails, setExamDetails] = useState({
    Exam_Desc: '',
    Difficulty_Level: '',
    Subject: '',
    Exam_Category: '',
    No_of_Questions: '',
    Exam_Duration: '',
    Question_Duration: '',
    Author_Name: '',
    Author_Id: '',
    Exam_Valid_Upto: '',
    Questions_To_Attend: '',
    Publish_Date: ''
  });

  const [authoredQuestions, setAuthoredQuestions] = useState([]);
  const [error, setError] = useState('');
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
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  useEffect(() => {
    const fetchAuthoredQuestions = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`http://localhost:9000/author-questions/${user.id}`);
          setAuthoredQuestions(response.data);
        }
      } catch (error) {
        console.error('Error fetching authored questions:', error);
      }
    };

    if (user) {
      fetchAuthoredQuestions();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setExamDetails((prevDetails) => ({
        ...prevDetails,
        Author_Name: user.firstName,
        Author_Id: user.id
      }));
    }
  }, [user]);

  useEffect(() => {
    if (examDetails.No_of_Questions) {
      setExamDetails((prevDetails) => ({
        ...prevDetails,
        Questions_To_Attend: prevDetails.No_of_Questions
      }));
    }
  }, [examDetails.No_of_Questions]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let errorMessage = '';
    if (name === 'Questions_To_Attend') {
      const numValue = Number(value);
      if (numValue > examDetails.No_of_Questions) {
        errorMessage = 'Questions to attend cannot be more than the total number of questions.';
      } else if (numValue < 1) {
        errorMessage = 'Questions to attend cannot be less than 1.';
      }
    }

    setExamDetails({
      ...examDetails,
      [name]: value,
    });
    setError(errorMessage);
  };

  useEffect(() => {
    if (examDetails.Exam_Duration && examDetails.Questions_To_Attend) {
      const questionDuration = (examDetails.Exam_Duration / examDetails.Questions_To_Attend).toFixed(1);
      setExamDetails((prevDetails) => ({
        ...prevDetails,
        Question_Duration: questionDuration
      }));
    }
  }, [examDetails.Exam_Duration, examDetails.Questions_To_Attend]);

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionDetails({
      ...questionDetails,
      [name]: value,
    });
  };

  const handleAuthoredQuestionSelect = (e) => {
    const selectedQuestionId = e.target.value;
    setSelectedQuestionId(selectedQuestionId);
    const selectedQuestion = authoredQuestions.find(question => question.Question_ID === parseInt(selectedQuestionId));
    if (selectedQuestion) {
      setQuestionDetails(selectedQuestion);
    } else {
      setQuestionDetails({
        Question: '',
        Answer_1: '',
        Answer_2: '',
        Answer_3: '',
        Answer_4: '',
        Correct_Answer: ''
      });
    }
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
    setSelectedQuestionId('');

    if (questionIndex + 1 === parseInt(examDetails.No_of_Questions)) {
      saveExamAndQuestions(updatedQuestions);
    } else {
      setQuestionIndex(questionIndex + 1);
      if (updatedQuestions[questionIndex + 1]) {
        setQuestionDetails(updatedQuestions[questionIndex + 1]);
      }
    }
  };

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_DEVELOPMENT;

  const handleQuestionPrevious = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = questionDetails;

    setQuestions(updatedQuestions);
    setQuestionIndex(questionIndex - 1);
    setQuestionDetails(updatedQuestions[questionIndex - 1]);
    setSelectedQuestionId(updatedQuestions[questionIndex - 1].Question_ID || '');
  };

  const saveExamAndQuestions = async (questionsToSave) => {
    try {
      const examData = {
        ...examDetails,
        Exam_Valid_Upto: moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DD hh:mm A'),
        Publish_Date: moment(examDetails.Publish_Date).format('YYYY-MM-DD hh:mm A')
      };
  
      console.log('Exam data to be saved:', examData); // Log exam data
  
      const examResponse = await axios.post(`http://localhost:9000/exams`, examData);
      const examId = examResponse.data.Exam_Id;
  
      console.log('Exam saved successfully with ID:', examId); // Log successful exam save
  
      for (let i = 0; i < questionsToSave.length; i++) {
        console.log(`Processing question ${i + 1} of ${questionsToSave.length}`); // Log question processing
  
        if (questionsToSave[i].Question_ID) {
          const questionExists = authoredQuestions.find(q => q.Question_ID === questionsToSave[i].Question_ID);
  
          if (questionExists) {
            const updatedQuestion = {
              ...questionsToSave[i],
              Exam_ID: [...new Set([...questionExists.Exam_ID, parseInt(examId)])] // Ensure unique Exam_IDs
            };
  
            console.log('Updating existing question:', updatedQuestion); // Log question update
  
            await axios.put(`http://localhost:9000/questions/${questionsToSave[i].Question_ID}`, updatedQuestion);
          }
        } else {
          const questionData = {
            Exam_ID: examId,
            Author_Id: user.id,
            ...questionsToSave[i],
            Correct_Answer: parseInt(questionsToSave[i].Correct_Answer)
          };
  
          console.log('Saving new question:', questionData); // Log new question save
  
          await axios.post(`http://localhost:9000/questions`, questionData);
        }
      }
  
      toast.success('Exam and all questions saved successfully');
      navigate('/');
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error.message); // Log detailed error
      toast.error('Error saving exam or questions');
    }
  };  

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
    <div className="container">
      <center><h2>Exam Form</h2></center>
      <form onSubmit={handleExamSubmit} className="p-4 border rounded shadow-sm">
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Exam Description<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                name="Exam_Desc"
                placeholder="Enter the exam description"
                value={examDetails.Exam_Desc}
                onChange={handleChange}
                required
              />
            </div>            
            <div className="mb-3">
              <label className="form-label fw-bold">Subject<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                name="Subject"
                placeholder="Enter the subject"
                value={examDetails.Subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Exam Category<span style={{ color: 'red' }}>*</span></label>
              <select
                className="form-control"
                name="Exam_Category"
                value={examDetails.Exam_Category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Exam Duration (minutes)<span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                className="form-control"
                name="Exam_Duration"
                placeholder="Enter the exam duration in minutes"
                value={examDetails.Exam_Duration}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Question Duration (minutes)<span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                className="form-control"
                name="Question_Duration"
                placeholder="Enter the question duration in minutes"
                value={examDetails.Question_Duration}
                readOnly
                required
              />
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-bold">Difficulty Level<span style={{ color: 'red' }}>*</span></label>
              <select
                className="form-control"
                name="Difficulty_Level"
                value={examDetails.Difficulty_Level}
                onChange={handleChange}
                required
              >
                <option value="">Select Difficulty Level</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Number of Questions<span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                className="form-control"
                name="No_of_Questions"
                placeholder="Enter the number of questions"
                value={examDetails.No_of_Questions}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Questions To Attend<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="number"
                  className="form-control"
                  name="Questions_To_Attend"
                  placeholder="Enter number of questions to attend"
                  value={examDetails.Questions_To_Attend}
                  onChange={handleChange}
                  required
                />
                {error && <Alert variant="danger">{error}</Alert>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Exam Valid Up To<span style={{ color: 'red' }}>*</span></label>
              <input
                type="datetime-local"
                className="form-control"
                name="Exam_Valid_Upto"
                value={examDetails.Exam_Valid_Upto}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Publish Date<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="Publish_Date"
                  value={examDetails.Publish_Date}
                  onChange={handleChange}
                  required
                />
            </div>
          </div>
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>

      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" size="lg">
        <Modal.Header>
          <Modal.Title>Question Form ({questionIndex + 1} of {examDetails.No_of_Questions})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="mb-3">
              <label className="form-label fw-bold">Your Question</label>
              <select
                className="form-control"
                id="authoredQuestions"
                name="authoredQuestions"
                value={selectedQuestionId}
                onChange={handleAuthoredQuestionSelect}
              >
                <option value="">Select a question</option>
                {authoredQuestions.map((q) => (
                  <option key={q.Question_ID} value={q.Question_ID}>
                    {q.Question}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Question<span style={{ color: 'red' }}>*</span></label>
              <textarea
                type="text"
                className="form-control"
                name="Question"
                placeholder="Enter the question"
                value={questionDetails.Question}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Answer 1<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                name="Answer_1"
                placeholder="Enter answer 1"
                value={questionDetails.Answer_1}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Answer 2<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                name="Answer_2"
                placeholder="Enter answer 2" 
                value={questionDetails.Answer_2}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Answer 3<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                name="Answer_3"
                placeholder="Enter answer 3"
                value={questionDetails.Answer_3}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Answer 4<span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                name="Answer_4"
                placeholder="Enter answer 4"
                value={questionDetails.Answer_4}
                onChange={handleQuestionChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Correct Answer<span style={{ color: 'red' }}>*</span></label>
              <select
                className="form-control"
                name="Correct_Answer"
                value={questionDetails.Correct_Answer}
                onChange={(e) => setQuestionDetails({
                  ...questionDetails,
                  Correct_Answer: parseInt(e.target.value) // Convert to number
                })}
                required
              >
                <option value="">Select Correct Answer</option>
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
            {questionIndex + 1 === parseInt(examDetails.No_of_Questions) ? 'Finish' : 'Next'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  </div>
  );
};

export default ExamForm;
