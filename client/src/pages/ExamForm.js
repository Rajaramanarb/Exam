import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { Modal, Button, Alert } from 'react-bootstrap';
import { useUser } from "@clerk/clerk-react";
import '../css/ExamForm.css';

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
    Publish_Date: '',
    Negative_Marking: false
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
    Correct_Answer: '',
    Difficulty_Level: '',
    Question_Subject: '',
    Image: null 
  });
  const [selectedQuestionId, setSelectedQuestionId] = useState('');
  const [setQuestionSubject] = useState('');
  const questionSubjectOptions = {
    NEET: ['Physics', 'Chemistry', 'Botany', 'Zoology'],
    JEE: ['Physics', 'Chemistry', 'Maths']
  };

  const apiUrl = process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchAuthoredQuestions = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`${apiUrl}/author-questions/${user.id}`);
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

  const [noOfQuestionsError, setNoOfQuestionsError] = useState('');
  const [questionsToAttendError, setQuestionsToAttendError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
  
    if (name === 'Exam_Category') {
      setQuestionDetails(prevDetails => ({
        ...prevDetails,
        Question_Subject: ''
      }));
    }
  
    if (name === 'Questions_To_Attend') {
      const numValue = Number(value);
      if (numValue > examDetails.No_of_Questions) {
        setQuestionsToAttendError('Questions to attend cannot be more than the total number of questions.');
      } else if (numValue < 1) {
        setQuestionsToAttendError('Questions to attend cannot be less than 1.');
      } else {
        setQuestionsToAttendError(''); // Clear error if validation passes
      }
    }
  
    if (name === 'No_of_Questions') {
      const numValue = Number(value);
      if (numValue < 1) {
        setNoOfQuestionsError('Number of questions cannot be less than 1.');
      } else {
        setNoOfQuestionsError(''); // Clear error if validation passes
      }
    }
  
    setExamDetails({
      ...examDetails,
      [name]: type === 'checkbox' ? checked : value,
    });
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
    const { name, value, files } = e.target;
    if (name === 'Image') {
      setQuestionDetails({
        ...questionDetails,
        [name]: files[0] // Save the image file
      });
    } else {
      setQuestionDetails({
        ...questionDetails,
        [name]: value,
      });
    }
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
        Correct_Answer: '',
        Difficulty_Level: '',
        Question_Subject: '',
        Image: null 
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
      Correct_Answer: '',
      Difficulty_Level: '',
      Question_Subject: '',
      Image: null 
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
  
  const handleSave = () => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = questionDetails;
  
    setQuestions(updatedQuestions);
    saveExamAndQuestions(updatedQuestions);
  };  

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
  
      const examResponse = await axios.post(`${apiUrl}/exams`, examData);
      const examId = examResponse.data.Exam_Id;
  
      const totalQuestions = parseInt(examDetails.No_of_Questions);
      const questionsToSaveFixedLength = [...questionsToSave];
      while (questionsToSaveFixedLength.length < totalQuestions) {
        questionsToSaveFixedLength.push({
          Question: '',
          Answer_1: '',
          Answer_2: '',
          Answer_3: '',
          Answer_4: '',
          Correct_Answer: '',
          Difficulty_Level: '',
          Question_Subject: '',
          Image: null
        });
      }
  
      for (let i = 0; i < questionsToSaveFixedLength.length; i++) {
        if (questionsToSaveFixedLength[i].Question_ID) {
          const questionExists = authoredQuestions.find(q => q.Question_ID === questionsToSaveFixedLength[i].Question_ID);
  
          if (questionExists) {
            const updatedQuestion = {
              ...questionsToSaveFixedLength[i],
              Exam_ID: [...new Set([...questionExists.Exam_ID, parseInt(examId)])]
            };
  
            await axios.put(`${apiUrl}/questions/${questionsToSaveFixedLength[i].Question_ID}`, updatedQuestion);
          }
        } else {
          const formData = new FormData();
          formData.append('Exam_ID', examId);
          formData.append('Author_Id', user.id);
          formData.append('Question', questionsToSaveFixedLength[i].Question);
          formData.append('Answer_1', questionsToSaveFixedLength[i].Answer_1);
          formData.append('Answer_2', questionsToSaveFixedLength[i].Answer_2);
          formData.append('Answer_3', questionsToSaveFixedLength[i].Answer_3);
          formData.append('Answer_4', questionsToSaveFixedLength[i].Answer_4);
          if (questionsToSaveFixedLength[i].Correct_Answer) {
            formData.append('Correct_Answer', parseInt(questionsToSaveFixedLength[i].Correct_Answer));
          }
          formData.append('Difficulty_Level', questionsToSaveFixedLength[i].Difficulty_Level);
          if (questionsToSaveFixedLength[i].Question_Subject) {
            formData.append('Question_Subject', questionsToSaveFixedLength[i].Question_Subject);
          }
          if (questionsToSaveFixedLength[i].Image) {
            formData.append('Image', questionsToSaveFixedLength[i].Image);
          }
  
          await axios.post(`${apiUrl}/questions`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }
  
      toast.success('Exam and all questions saved successfully');
      navigate('/');
    } catch (error) {
      console.error('Error details:', error.response ? error.response.data : error.message);
      // toast.error('Error saving exam or questions');
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
                <option value="LowerGrade">Lower Grade</option>
                <option value="College">College</option>
                <option value="NEET">NEET</option>
                <option value="JEE">JEE</option>
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
                value={examDetails.Question_Duration}
                readOnly
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-check-label fw-bold me-4" htmlFor="flexCheckbox">Negative Marking</label>
              <input
                type="checkbox"
                className="form-check-input custom-checkbox"
                id="flexCheckbox"
                name="Negative_Marking"
                checked={examDetails.Negative_Marking}
                onChange={handleChange}
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
              <label className="form-label fw-bold">
                Number of Questions<span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="No_of_Questions"
                placeholder="Enter the number of questions"
                value={examDetails.No_of_Questions}
                onChange={handleChange}
                required
              />
              {noOfQuestionsError && <Alert variant="danger">{noOfQuestionsError}</Alert>}
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">
                Questions To Attend<span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="number"
                className="form-control"
                name="Questions_To_Attend"
                placeholder="Enter number of questions to attend"
                value={examDetails.Questions_To_Attend}
                onChange={handleChange}
                required
              />
              {questionsToAttendError && <Alert variant="danger">{questionsToAttendError}</Alert>}
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
            {examDetails.Exam_Category === 'NEET' || examDetails.Exam_Category === 'JEE' ? (
              <div className="mb-3">
                <label className="form-label fw-bold">Question Subject<span style={{ color: 'red' }}>*</span></label>
                <select
                  className="form-control"
                  name="Question_Subject"
                  value={questionDetails.Question_Subject}
                  onChange={handleQuestionChange}
                  //required
                >
                  <option value="">Select Subject</option>
                  {questionSubjectOptions[examDetails.Exam_Category].map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="mb-3">
              <label className="form-label fw-bold">Question<span style={{ color: 'red' }}>*</span></label>
              <textarea
                type="text"
                className="form-control"
                name="Question"
                placeholder="Enter the question"
                value={questionDetails.Question}
                onChange={handleQuestionChange}
                //required
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
                //required
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
                //required
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
                //required
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
                //required
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
                //required
              >
                <option value="">Select Correct Answer</option>
                <option value="1">Answer 1</option>
                <option value="2">Answer 2</option>
                <option value="3">Answer 3</option>
                <option value="4">Answer 4</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Difficulty Level<span style={{ color: 'red' }}>*</span></label>
              <select
                className="form-control"
                name="Difficulty_Level"
                value={questionDetails.Difficulty_Level}
                onChange={handleQuestionChange}
                //required
              >
                <option value="">Select Difficulty Level</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Add image</label>
              <input
                className="form-control"
                type="file"
                name="Image"
                onChange={handleQuestionChange}
              />
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <div className="alert-message">*Note: Click on save button if you want to continue later.</div>
          {questionIndex > 0 && (
            <Button variant="secondary" onClick={handleQuestionPrevious}>
              Previous
            </Button>
          )}
          <Button variant="primary" onClick={handleQuestionNext}>
            {questionIndex + 1 === parseInt(examDetails.No_of_Questions) ? 'Finish' : 'Next'}
          </Button>
          {questionIndex + 1 !== parseInt(examDetails.No_of_Questions) && (
            <Button variant="success" onClick={handleSave}>
              Save
            </Button>
          )}          
        </Modal.Footer>
      </Modal>
    </div>
  </div>
  );
};

export default ExamForm;
