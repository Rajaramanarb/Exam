import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Modal, Navbar, Nav } from 'react-bootstrap';
import { useUser } from '@clerk/clerk-react';
import Rating from 'react-rating-stars-component'; // Import the rating component
import '../css/ExamPage.css';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [showStartModal, setShowStartModal] = useState(true);
  const [examDuration, setExamDuration] = useState(0);
  const [questionDuration, setQuestionDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionTimesLeft, setQuestionTimesLeft] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [originalQuestionsOrder, setOriginalQuestionsOrder] = useState([]);
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [examDetails, setExamDetails] = useState({});
  const [rating, setRating] = useState(0); // State to handle the rating
  const [examResultBuffer, setExamResultBuffer] = useState(null); // Buffer for exam results

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:9000/exams/${examId}`);
        const exam = response.data;
        setExamDetails(exam);
        setExamDuration(exam.Exam_Duration);
        setQuestionDuration(exam.Question_Duration);
    
        const noOfQuestions = exam.No_of_Questions;  // Total questions set by the author
        const questionsToAttend = exam.Questions_To_Attend;  // Questions user needs to attend
        setQuestionTimesLeft(new Array(questionsToAttend).fill(exam.Question_Duration * 60));
        setAnswers(new Array(questionsToAttend).fill(null));
    
        let allQuestions = [];
        let allCorrectAnswers = {};
    
        // Fetch all questions set by the author
        for (let i = 0; i < noOfQuestions; i++) {
          const questionResponse = await axios.get(`http://localhost:9000/questions/${examId}/${i}`);
          const questionData = questionResponse.data;
          questionData.Question_ID = Number(questionData.Question_ID);
          allQuestions.push(questionData);
          allCorrectAnswers[questionData.Question_ID] = questionData.Correct_Answer - 1;
        }
    
        // Randomly select the required number of questions
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);
        const selectedQuestions = allQuestions.slice(0, questionsToAttend);
        const selectedOrder = selectedQuestions.map(q => q.Question_ID);
        
        setQuestions(selectedQuestions);
        setCorrectAnswers(allCorrectAnswers);
        setOriginalQuestionsOrder(selectedOrder);
        setCurrentQuestion(selectedQuestions[0]);
      } catch (error) {
        console.error('Error fetching exam details:', error);
        toast.error('Error fetching exam details');
      }
    };
    
    fetchExamDetails();
  }, [examId, apiUrl]);    

  useEffect(() => {
    if (timeLeft === 0) {
      finishExam();
    } else if (timeLeft !== null) {
      const examTimer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(examTimer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (questionTimesLeft[currentQuestionIndex] === 0 && timeLeft !== null) {
      handleNextQuestion();
    } else if (questionTimesLeft[currentQuestionIndex] !== null && timeLeft !== null) {
      const questionTimer = setTimeout(() => {
        const newTimesLeft = [...questionTimesLeft];
        newTimesLeft[currentQuestionIndex] -= 1;
        setQuestionTimesLeft(newTimesLeft);
      }, 1000);
      return () => clearTimeout(questionTimer);
    }
  }, [questionTimesLeft, currentQuestionIndex, timeLeft]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentQuestion(questions[currentQuestionIndex + 1]);
    } else {
      toast.success('You have completed the exam!');
      endExam();
    }
  };

  const endExam = () => {
    let newScore = 0;
    const isNegativeMarking = examDetails.Negative_Marking;

    answers.forEach((answer, index) => {
      const questionId = questions[index].Question_ID;
      if (answer === correctAnswers[questionId]) {
        newScore += 1;
      } else if (answer !== null && isNegativeMarking) {
        newScore -= 1;
      }
    });
    setScore(newScore);

    const examResult = {
      Exam_ID: examId,
      Author_Id: user.id,
      Author_Name: user.firstName,
      Score: newScore,
      Responses: questions.map((question, index) => {
        return {
          Question_ID: question.Question_ID,
          Selected_Option: answers[index] !== null ? answers[index] + 1 : 0,
          Correct_Answer: correctAnswers[question.Question_ID] + 1,
          Is_Correct: answers[index] === correctAnswers[question.Question_ID]
        };
      })
    };

    setExamResultBuffer(examResult);
    setShowScoreModal(true);
  };

  const finishExam = async () => {
    const examResult = { ...examResultBuffer, Rating: rating };

    try {
      await axios.post(`http://localhost:9000/exam-results`, examResult);
      toast.success('Exam results saved successfully!');
      setShowScoreModal(false);
      navigate('/');
    } catch (error) {
      console.error('Error saving exam results:', error);
      toast.error('Error saving exam results');
    }
  };

  const handleStartExam = () => {
    setShowStartModal(false);
    setTimeLeft(examDuration * 60);
  };

  const handleAnswerChange = (index) => {
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex] = index;
    setAnswers(updatedAnswers);
  };

  const navigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    setCurrentQuestion(questions[index]);
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  return (
    <div className="container mt-5">
      <Navbar bg="light" className="mb-4" expand="lg">
        <Nav className="scrollable-navbar">
          {questions.map((_, index) => (
            <Nav.Link
              key={index}
              onClick={() => navigateToQuestion(index)}
              className={currentQuestionIndex === index ? 'active' : answers[index] !== null ? 'answered' : ''}
            >
              {index + 1}
            </Nav.Link>
          ))}
        </Nav>
      </Navbar>
      <h2 className="text-center">Exam</h2>
      <Modal show={showStartModal} onHide={() => setShowStartModal(false)}  backdrop="static">
        <Modal.Header>
          <Modal.Title>Start Exam</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Exam Description:</strong> {examDetails.Exam_Desc}</p>
          <p><strong>Subject:</strong> {examDetails.Subject}</p>
          <p><strong>Author Name:</strong> {examDetails.Author_Name}</p>
          <p><strong>Exam Category:</strong> {examDetails.Exam_Category}</p>
          <p><strong>Difficulty Level:</strong> {examDetails.Difficulty_Level}</p>
          <p><strong>Number of Questions:</strong> {examDetails.Questions_To_Attend}</p>
          <p><strong>Exam Duration:</strong> {examDetails.Exam_Duration} minutes</p>
          <p><strong>Question Duration:</strong> {examDetails.Question_Duration} minutes</p>
          <b>Are you ready to start the exam?</b>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate('/TakeExam')}>No</Button>
          <Button variant="primary" onClick={handleStartExam}>Yes</Button>
        </Modal.Footer>
      </Modal>
      {!showStartModal && currentQuestion ? (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>Time Left: {formatTime(timeLeft)}</div>
              <div>Question Time Left: {formatTime(questionTimesLeft[currentQuestionIndex])}</div>
            </div>
            <h5 className="card-title">{currentQuestion.Question}</h5>
            <div className="answers">
              {[currentQuestion.Answer_1, currentQuestion.Answer_2, currentQuestion.Answer_3, currentQuestion.Answer_4].map((answer, index) => (
                <div className="form-check" key={index}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="answer"
                    id={`answer${index}`}
                    value={index}
                    checked={answers[currentQuestionIndex] === index}
                    onChange={() => handleAnswerChange(index)}
                  />
                  <label className="form-check-label" htmlFor={`answer${index}`}>
                    {answer}
                  </label>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between mt-4">
              {currentQuestionIndex > 0 && (
                <Button variant="secondary" onClick={() => navigateToQuestion(currentQuestionIndex - 1)}>
                  Previous
                </Button>
              )}
              {currentQuestionIndex < questions.length - 1 ? (
                <Button variant="primary" onClick={handleNextQuestion}>
                  Next
                </Button>
              ) : (
                <Button variant="danger" onClick={endExam}>
                  End Exam
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>Loading question...</div>
      )}
      <Modal show={showScoreModal} onHide={() => setShowScoreModal(false)} backdrop="static">
        <Modal.Header>
          <Modal.Title>Exam Finished</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Your score is: {score} / {questions.length}</h5>
          <div>
            <h6>Rate the exam:</h6>
            <Rating
              count={5}
              size={24}
              activeColor="#ffd700"
              value={rating}
              onChange={handleRatingChange}
            />
            <p className="mt-2">Your Rating: {rating}</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={finishExam}>Finish Exam</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExamPage;
