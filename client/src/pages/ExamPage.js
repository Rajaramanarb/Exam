import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button, Modal, Navbar, Nav } from 'react-bootstrap';
import { useUser } from '@clerk/clerk-react';
import '../css/ExamPage.css';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser(); // Get the user info from Clerk
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [showStartModal, setShowStartModal] = useState(true);
  const [examDuration, setExamDuration] = useState(0); // in minutes
  const [questionDuration, setQuestionDuration] = useState(0); // in minutes
  const [timeLeft, setTimeLeft] = useState(null); // for exam timer in seconds
  const [questionTimesLeft, setQuestionTimesLeft] = useState([]); // for question timer in seconds
  const [answers, setAnswers] = useState([]); // to store user answers
  const [correctAnswers, setCorrectAnswers] = useState([]); // to store correct answers
  const [score, setScore] = useState(0);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const apiUrl = process.env.NODE_ENV === 'production' 
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_DEVELOPMENT;

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        const response = await axios.get(`${apiUrl}/exams/${examId}`);
        const exam = response.data;
        setExamDuration(exam.Exam_Duration);
        setQuestionDuration(exam.Question_Duration);
  
        const noOfQuestions = exam.No_of_Questions;
        setQuestionTimesLeft(new Array(noOfQuestions).fill(exam.Question_Duration * 60));
        setAnswers(new Array(noOfQuestions).fill(null));
  
        // Load all questions
        let allQuestions = [];
        let allCorrectAnswers = [];
        for (let i = 0; i < noOfQuestions; i++) {
          const questionResponse = await axios.get(`${apiUrl}/questions/${examId}/${i}`);
          const questionData = questionResponse.data;
          questionData.Question_ID = Number(questionData.Question_ID); // Ensure Question_ID is a number
          allQuestions.push(questionData);
          allCorrectAnswers.push(questionData.Correct_Answer - 1); // -1 because index is 0-based
        }
  
        allQuestions = allQuestions.sort(() => Math.random() - 0.5);
        setQuestions(allQuestions);
        setCorrectAnswers(allCorrectAnswers);
        setCurrentQuestion(allQuestions[0]);
      } catch (error) {
        console.error('Error fetching exam details:', error);
        toast.error('Error fetching exam details');
      }
    };
  
    fetchExamDetails();
  }, [examId]);  

  useEffect(() => {
    if (timeLeft === 0) {
      finishExam();
    } else if (timeLeft !== null) {
      const examTimer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(examTimer);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (questionTimesLeft[currentQuestionIndex] === 0) {
      handleNextQuestion();
    } else if (questionTimesLeft[currentQuestionIndex] !== null) {
      const questionTimer = setTimeout(() => {
        const newTimesLeft = [...questionTimesLeft];
        newTimesLeft[currentQuestionIndex] -= 1;
        setQuestionTimesLeft(newTimesLeft);
      }, 1000);
      return () => clearTimeout(questionTimer);
    }
  }, [questionTimesLeft, currentQuestionIndex]);

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
      finishExam();
    }
  };

  const finishExam = async () => {
    let newScore = 0;
    answers.forEach((answer, index) => {
      if (answer === correctAnswers[index]) {
        newScore += 1;
      }
    });
    setScore(newScore);
    setShowScoreModal(true);
  
    const examResult = {
      Exam_Id: examId,
      Author_Id: user.id,
      Author_Name: user.firstName,
      Score: newScore,
      Responses: questions.map((question, index) => ({
        Question_Id: question.Question_ID, // Make sure this is a number
        Selected_Option: answers[index] !== null ? answers[index] : 0,
        Correct_Answer: correctAnswers[index] + 1, // +1 because correct answers are 1-based
        Is_Correct: answers[index] === correctAnswers[index]
      }))
    };
  
    try {
      await axios.post('http://localhost:9000/exam-results', examResult);
      toast.success('Exam results saved successfully!');
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
      <Modal show={showStartModal} onHide={() => setShowStartModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Start Exam</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you ready to start the exam?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
          <Button variant="primary" onClick={handleStartExam}>Start Exam</Button>
        </Modal.Footer>
      </Modal>
      {currentQuestion ? (
        <div className="card mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-3">
              <div>Time Left: {formatTime(timeLeft)}</div>
              <div>Question Time Left: {formatTime(questionTimesLeft[currentQuestionIndex])}</div>
            </div>
            <h5 className="card-title">{currentQuestion.Question}</h5>
            <div className="answers">
              {currentQuestion.Answer_1 && currentQuestion.Answer_2 && currentQuestion.Answer_3 && currentQuestion.Answer_4 ? (
                [currentQuestion.Answer_1, currentQuestion.Answer_2, currentQuestion.Answer_3, currentQuestion.Answer_4].map((answer, index) => (
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
                ))
              ) : (
                <p>Loading...</p>
              )}
            </div>
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="secondary"
                disabled={currentQuestionIndex === 0}
                onClick={() => {
                  setCurrentQuestionIndex(currentQuestionIndex - 1);
                  setCurrentQuestion(questions[currentQuestionIndex - 1]);
                }}
              >
                Previous
              </Button>
              {currentQuestionIndex === questions.length - 1 ? (
                <Button variant="success" onClick={finishExam}>Finish Exam</Button>
              ) : (
                <Button variant="primary" onClick={handleNextQuestion}>Next</Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center">Loading question...</p>
      )}
      <Modal show={showScoreModal} onHide={() => setShowScoreModal(false)} backdrop="static">
        <Modal.Header>
          <Modal.Title>Exam Completed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Your Score: {score} / {questions.length}</h5>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => navigate('/')}>Go to Home</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExamPage;
