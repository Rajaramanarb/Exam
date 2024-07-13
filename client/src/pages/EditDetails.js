import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Alert } from 'react-bootstrap';
import moment from 'moment';
import 'bootstrap/dist/css/bootstrap.min.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '@clerk/clerk-react';
import '../css/ExamForm.css';

const EditDetails = () => {
  const { user } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examDetails, setExamDetails] = useState({});
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [questionDetails, setQuestionDetails] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [authoredQuestions, setAuthoredQuestions] = useState([]);
  const [error, setError] = useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState('');

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/exams/${examId}`);
        setExamDetails(response.data);
      } catch (error) {
        toast.error('Error fetching exam details:');
        console.error('Error fetching exam details:', error);
      }
    };

    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/questions/${examId}`);
        setQuestions(response.data);
      } catch (error) {
        toast.error('Error fetching questions');
        console.error('Error fetching questions:', error);
      }
    };

    const fetchAuthoredQuestions = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`http://localhost:9000/author-questions/${user.id}`);
          setAuthoredQuestions(response.data);
        }
      } catch (error) {
        //toast.error('Error fetching authored questions');
        console.error('Error fetching authored questions:', error);
      }
    };

    if (user) {
      fetchExamDetails();
      fetchQuestions();
      fetchAuthoredQuestions();
    }
  }, [examId, user]);

  useEffect(() => {
    if (examDetails.No_of_Questions) {
      setExamDetails((prevDetails) => ({
        ...prevDetails,
        Questions_To_Attend: prevDetails.No_of_Questions
      }));
    }
  }, [examDetails.No_of_Questions]);

  const handleExamChange = (e) => {
    const { name, value, type, checked } = e.target;
    let errorMessage = '';
    if (name === 'Questions_To_Attend') {
      const numValue = Number(value);
      if (numValue > examDetails.No_of_Questions) {
        errorMessage = 'Questions to attend cannot be more than the total number of questions.';
      } else if (numValue < 1) {
        errorMessage = 'Questions to attend cannot be less than 1.';
      }
    }

    setExamDetails({ ...examDetails, [name]: value, [name]: type === 'checkbox' ? checked : value });
    setError(errorMessage);
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionDetails({ ...questionDetails, [name]: value });
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
        Difficulty_Level: ''
      });
    }
  };

  const handleQuestionEdit = (index) => {
    setQuestionIndex(index);
    setQuestionDetails(questions[index]);
    setShowModal(true);
  };

  const handleQuestionPrevious = () => {
    if (questionIndex > 0) {
      const prevIndex = questionIndex - 1;
      setQuestionIndex(prevIndex);
      setQuestionDetails(questions[prevIndex]);
    }
  };

  const handleQuestionNext = () => {
    if (questionIndex < questions.length - 1) {
      const nextIndex = questionIndex + 1;
      setQuestionIndex(nextIndex);
      setQuestionDetails(questions[nextIndex]);
    } else {
      setShowModal(false);
    }
  };

  const handleQuestionSave = () => {
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
      Difficulty_Level: ''
    });
    setSelectedQuestionId('');
    setShowModal(false);
  };

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    try {
      const examData = {
        ...examDetails,
        Exam_Valid_Upto: moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DD hh:mm A'),
        Publish_Date: moment(examDetails.Publish_Date).format('YYYY-MM-DD hh:mm A')
      };
      await axios.put(`http://localhost:9000/exams/${examId}`, examData);
      for (let i = 0; i < questions.length; i++) {
        if (questions[i].Question_ID) {
          // Check if the question already exists and is just being added to the exam
          const questionExists = authoredQuestions.find(q => q.Question_ID === questions[i].Question_ID);
          if (questionExists) {
            // If the question already exists, update its Exam_ID field
            const updatedQuestion = {
              ...questions[i],
              Exam_ID: [...new Set([...questionExists.Exam_ID, parseInt(examId)])] // Ensure unique Exam_IDs
            };
            await axios.put(`http://localhost:9000/questions/${questions[i].Question_ID}`, updatedQuestion);
          } else {
            // Otherwise, update the question normally
            await axios.put(`http://localhost:9000/questions/${questions[i].Question_ID}`, questions[i]);
          }
        } else {
          const questionData = {
            Exam_ID: [examId],
            Author_Id: user.id,
            ...questions[i],
            Correct_Answer: parseInt(questions[i].Correct_Answer)
          };
          await axios.post(`http://localhost:9000/questions`, questionData);
        }
      }
      toast.success('Exam and questions updated successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error updating exam and questions');
      console.error('Error updating exam and questions:', error);
    }
  };

  useEffect(() => {
    setExamDetails(prevDetails => ({
      ...prevDetails,
      Question_Duration: (prevDetails.Exam_Duration / prevDetails.Questions_To_Attend).toFixed(1),
    }));
  }, [examDetails.Exam_Duration, examDetails.Questions_To_Attend]);

  useEffect(() => {
    if (examDetails.No_of_Questions > questions.length) {
      const newQuestions = Array(examDetails.No_of_Questions - questions.length).fill({
        Question: '',
        Answer_1: '',
        Answer_2: '',
        Answer_3: '',
        Answer_4: '',
        Correct_Answer: '',
        Difficulty_Level: ''
      });
      setQuestions([...questions, ...newQuestions]);
    }
  }, [examDetails.No_of_Questions, questions]);

  return (
    <div className="container">
      <h2>Edit Exam Details</h2>
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
                onChange={handleExamChange}
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
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">Exam Category<span style={{ color: 'red' }}>*</span></label>
              <select
                className="form-control"
                name="Exam_Category"
                value={examDetails.Exam_Category}
                onChange={handleExamChange}
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
                onChange={handleExamChange}
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
            <div className="mb-3">
              <label className="form-check-label fw-bold me-4" htmlFor="flexCheckbox">Negative Marking</label>
              <input
                type="checkbox"
                className="form-check-input custom-checkbox"
                id="flexCheckbox"
                name="Negative_Marking"
                checked={examDetails.Negative_Marking}
                onChange={handleExamChange}
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
                onChange={handleExamChange}
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
                onChange={handleExamChange}
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
                  onChange={handleExamChange}
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
                value={moment(examDetails.Exam_Valid_Upto).format('YYYY-MM-DDTHH:mm')}
                onChange={handleExamChange}
                required
              />
            </div>
            <div className="mb-3">
                <label className="form-label fw-bold">Publish Date<span style={{ color: 'red' }}>*</span></label>
                <input
                  type="datetime-local"
                  className="form-control"
                  name="Publish_Date"
                  value={moment(examDetails.Publish_Date).format('YYYY-MM-DDTHH:mm')}
                  onChange={handleExamChange}
                  required
                />
            </div>
          </div>
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-primary">Update</button>
        </div>
      </form>

      <h2 className="mt-4">Edit Questions</h2>
      <Table className="table table-hover">
        <thead className="thead-dark">
          <tr>
            <th>Question</th>
            <th>Answer 1</th>
            <th>Answer 2</th>
            <th>Answer 3</th>
            <th>Answer 4</th>
            <th>Correct Answer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((question, index) => (
            <tr key={index}>
              <td>{question.Question}</td>
              <td>{question.Answer_1}</td>
              <td>{question.Answer_2}</td>
              <td>{question.Answer_3}</td>
              <td>{question.Answer_4}</td>
              <td>{question.Correct_Answer}</td>
              <td>
                <Button variant="warning" onClick={() => handleQuestionEdit(index)}>✏️ Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Question</Modal.Title>
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
                rows="3"
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
              <label className="form-label fw-bold">Correct Answer <span style={{ color: 'red' }}>*</span></label>
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
            <div className="mb-3">
              <label className="form-label fw-bold">Difficulty Level<span style={{ color: 'red' }}>*</span></label>
              <select
                className="form-control"
                name="Difficulty_Level"
                value={questionDetails.Difficulty_Level}
                onChange={handleQuestionChange}
                required
              >
                <option value="">Select Difficulty Level</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
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
          {questionIndex < questions.length - 1 && (
            <Button variant="primary" onClick={handleQuestionNext}>
            Next
          </Button>
          )}
          <Button variant="success" onClick={handleQuestionSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EditDetails;
