import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Typography, Button } from "@material-tailwind/react";
import Swal from "sweetalert2";

function DoQuestion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { examId } = location.state || {}; 

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); 
  const [answers, setAnswers] = useState({}); 

  const user_id = localStorage.getItem("userId"); 

  const fetchExamDetails = async () => {
  if (!examId) {
    console.error("No examId provided.");
    navigate("/doExam");
    return;
  }

  try {
    console.log("Fetching questions for examId:", examId);
    const response = await fetch(`http://localhost:5000/exams/${examId}/questions`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const questions = data.questions || []; 

    if (questions.length === 0) {
      console.warn("No questions found for this exam.");
      setExam({ questions: [] });
    } else {
      setExam({ questions });
    }
    setLoading(false);
  } catch (error) {
    console.error("Error fetching questions:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load exam questions. Please try again later.",
      confirmButtonColor: "#3085d6",
    });
    setLoading(false);
  }
};

  useEffect(() => {
  fetchExamDetails();
}, [examId]);

useEffect(() => {
  console.log("Exam state updated:", exam);
}, [exam]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h4" className="text-gray-500">
          Loading...
        </Typography>
      </div>
    );
  }

  if (!exam || !exam.questions || exam.questions.length === 0) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Typography variant="h4" className="text-gray-500">
        No questions available for this exam.
      </Typography>
    </div>
  );
}

const currentQuestion = exam.questions[currentQuestionIndex];

if (!currentQuestion) {
  return (
    <div className="flex justify-center items-center h-screen">
      <Typography variant="h4" className="text-gray-500">
        No question available for the current index.
      </Typography>
    </div>
  );
}

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: selectedOption, 
    }));
  };

  const handleSubmit = async () => {
  
    const unansweredQuestions = exam.questions.filter(
      (question) => !answers[question.id]
    );
  
    if (unansweredQuestions.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Test",
        text: "Please answer all the questions before submitting.",
        confirmButtonColor: "#3085d6",
      });
      return; 
    }
  
    try {
      const response = await fetch("http://localhost:5000/userAnswers/save-answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: localStorage.getItem("userId"), 
          exam_id: examId,
          answers,
        }),
      });
  
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Your answers have been submitted successfully!",
          confirmButtonColor: "#3085d6",
        }).then(() => {
          navigate("/dashboard/doExam"); 
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: "Failed to submit your answers. Please try again.",
          confirmButtonColor: "#3085d6",
        });
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while submitting your answers. Please try again.",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white-50">
    <div className="flex-grow flex flex-col justify-center items-center p-8">
      <div className="w-full max-w-4xl text-center">

        <Typography
          variant="h5"
          className="font-thai text-gray-800 mb-6 text-2xl font-bold"
        >
          {currentQuestionIndex + 1}. {currentQuestion.question_text}
        </Typography>
        <div className="flex flex-col gap-4">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <input
                type="radio"
                name={`question-${currentQuestion.id}`}
                value={option}
                checked={answers[currentQuestion.id] === option}
                onChange={() => handleAnswerChange(currentQuestion.id, option)}
                className="w-5 h-5"
              />
              <Typography
                variant="body1"
                className="font-thai text-gray-700 text-lg"
              >
                {option}
              </Typography>
            </label>
          ))}
        </div>
      </div>
    </div>
  
   
    <div className="w-full max-w-4xl mx-auto flex justify-between items-center mt-8 p-4 border-t">
      <Button
        onClick={handlePrevious}
        disabled={currentQuestionIndex === 0}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50"
      >
        Previous
      </Button>
      <div className="flex gap-2">
        {exam.questions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleQuestionClick(index)}
            className={`w-10 h-10 flex items-center justify-center rounded ${
              index === currentQuestionIndex
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {currentQuestionIndex === exam.questions.length - 1 ? (
        <Button
          onClick={handleSubmit}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit
        </Button>
      ) : (
        <Button
          onClick={handleNext}
          disabled={currentQuestionIndex === exam.questions.length - 1}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Next
        </Button>
      )}
    </div>
  </div>
 
);
}

export default DoQuestion;