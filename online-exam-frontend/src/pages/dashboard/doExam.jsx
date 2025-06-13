import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

function DoExam() {
  const [exams, setExams] = useState([]); 
  const [completedExams, setCompletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  const fetchExams = async () => {
    try {
      console.log("Fetching published exams...");
      const response = await fetch("http://localhost:5000/exams/published"); 
      const data = await response.json();
      console.log("Published exams fetched:", data);
      setExams(data); 
    } catch (error) {
      console.error("Error fetching published exams:", error);
    }
  };

  const fetchCompletedExams = async () => {
    try {
      const userId = localStorage.getItem("userId");
      console.log("Fetching completed exams for userId:", userId);
      const response = await fetch(
        `http://localhost:5000/userAnswers/completed-exams?userId=${userId}`
      );
      const data = await response.json();
      console.log("Completed exams fetched:", data);
      setCompletedExams(data.completedExams); 
    } catch (error) {
      console.error("Error fetching completed exams:", error);
    }
  };

  
  const handleStartExam = (exam) => {
    const examId = exam.exam_id || exam._id; 

    Swal.fire({
      title: "ยืนยันการทำข้อสอบ",
      text: "คุณแน่ใจหรือไม่ว่าต้องการเริ่มทำข้อสอบนี้?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, เริ่มทำข้อสอบ",
      cancelButtonText: "ยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        if (!examId) {
          console.error("No examId provided."); 
          Swal.fire("Error", "No examId provided.", "error");
          return;
        }

        console.log("Navigating to /do-question with examId:", examId); 
        navigate("/do-question", { state: { examId } }); 
      } else {
        console.log("User canceled starting the exam.");
      }
    });
  };

  useEffect(() => {
    console.log("Component mounted, fetching exams...");
    const fetchData = async () => {
      setLoading(true);
      await fetchExams();
      await fetchCompletedExams();
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    console.log("Loading exams...");
    return <div>Loading...</div>;
  }

  const sortedExams = exams.sort((a, b) => {
    const aIsCompleted = completedExams.some(
      (completedExam) => completedExam.exam_id === a._id
    );
    const bIsCompleted = completedExams.some(
      (completedExam) => completedExam.exam_id === b._id 
    );

    
    return aIsCompleted - bIsCompleted;
  });

  return (
    <div className="mt-12 mb-8 flex flex-col gap-5">
      <CardHeader variant="gradient" color="gray" className="mb-8 p-4">
        <Typography variant="h3" color="white" className="font-thai">
          ทำข้อสอบ
        </Typography>
      </CardHeader>
      <CardBody className="px-0 pt-0 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedExams.map((exam) => {
           
            const isCompleted = completedExams.some(
              (completedExam) => completedExam.exam_id === exam._id 
            );

            return (
              <Card
                key={exam._id}
                className="shadow-lg border border-black" 
              >
                <div className="bg-[#384ca4] p-4 rounded-t-lg">
                  <Typography variant="h4" className="font-thai text-white">
                    Exam Name: {exam.exam_name} ({exam.exam_type})
                  </Typography>
                  <Typography
                    variant="small"
                    className="font-thai text-white text-lg"
                  >
                    Description: {exam.description}
                  </Typography>
                </div>
                <CardBody className="p-4">
                  <Typography
                    variant="small"
                    className="font-thai font-bold text-gray-700 mb-1 text-lg"
                  >
                    คะแนนเต็ม: {exam.max_exam} คะแนน
                  </Typography>
                  <div className="flex justify-end mt-4">
                    {isCompleted ? (
                      <Button
                        disabled
                        className="font-thai bg-gray-400 text-white px-4 py-2 text-base rounded cursor-not-allowed"
                      >
                        ข้อสอบนี้ทำเสร็จแล้ว
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleStartExam(exam)}
                        className="font-thai bg-blue-500 text-white px-4 py-2 text-base rounded hover:bg-blue-600"
                      >
                        ทำข้อสอบ
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </CardBody>
    </div>
  );
}

export default DoExam;