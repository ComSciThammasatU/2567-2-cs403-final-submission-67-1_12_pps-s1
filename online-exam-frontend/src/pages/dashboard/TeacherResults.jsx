import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function TeacherResults() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questionStats, setQuestionStats] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userResults, setUserResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch("http://localhost:5000/exams/all");
        const data = await response.json();
        setExams(data.exams);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exams:", error);
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const fetchQuestionStats = async (examId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/userAnswers/${examId}/question-stats`
      );
      const data = await response.json();

      const sortedStats = data.questionStats.sort(
        (a, b) => (b.percentage || 0) - (a.percentage || 0)
      );
      setQuestionStats(sortedStats);
      setSelectedExam(examId);

      
      const usersResponse = await fetch(
        `http://localhost:5000/userAnswers/${examId}/users`
      );
      const usersData = await usersResponse.json();

  
      console.log(usersData.users);

      setUsers(usersData.users);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching question statistics:", error);
      setLoading(false);
    }
  };

  const fetchUserResults = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/userAnswers/${selectedExam}/user/${userId}`
      );
      const data = await response.json();
    
      if (data.questionStats) {
        data.questionStats.sort((a, b) => (b.is_correct ? b.points : 0) - (a.is_correct ? a.points : 0));
      }
      setUserResults(data);
      setSelectedUser(userId);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user results:", error);
      setLoading(false);
    }
  };

  const totalQuestions = questionStats.length;
  const totalStudents =
    totalQuestions > 0 ? questionStats[0].total : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Typography variant="h6" className="font-thai text-gray-500">
          กำลังโหลดข้อมูล...
        </Typography>
      </div>
    );
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {!selectedExam ? (
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-4 flex justify-between"
          >
            <Typography variant="h4" color="white" className="font-thai">
              รายการข้อสอบ
            </Typography>
          </CardHeader>
          <CardBody className="px-4 pt-4 pb-8">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b py-3 px-4 text-left font-thai text-gray-800">
                    ชื่อข้อสอบ
                  </th>
                  <th className="border-b py-3 px-4 text-left font-thai text-gray-800">
                    ประเภทข้อสอบ
                  </th>
                  <th className="border-b py-3 px-4 text-left font-thai text-gray-800">
                    รายละเอียดข้อสอบ
                  </th>
                  <th className="border-b py-3 px-4 text-left font-thai text-gray-800">
                    การกระทำ
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                  >
                    <td className="py-2 px-4 border-b font-thai text-gray-700">
                      {exam.exam_name}
                    </td>
                    <td className="py-2 px-4 border-b font-thai text-gray-700">
                      {exam.exam_type}
                    </td>
                    <td className="py-2 px-4 border-b font-thai text-gray-700">
                      {exam.description}
                    </td>
                    <td className="py-2 px-4 border-b font-thai text-gray-700">
                      <Button
                        color="blue"
                        className="text-lg"
                        onClick={() => fetchQuestionStats(exam.exam_id)}
                      >
                        แสดงสถิติคำถาม
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ) : selectedUser ? (
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-4 flex justify-between"
          >
            <Typography variant="h4" color="white" className="font-thai">
              ผลการสอบของผู้ใช้
            </Typography>
            <Button color="red" onClick={() => setSelectedUser(null)}>
              กลับไปยังรายชื่อนักเรียน
            </Button>
          </CardHeader>
          <CardBody className="px-4 pt-4 pb-8">
            
            <Typography variant="h6" className="font-thai text-gray-800">
              คะแนน: {userResults?.score} / {userResults?.maxScore}
            </Typography>
            <Typography variant="h6" className="font-thai text-gray-800">
              ข้อสอบ: {userResults?.exam_name}
            </Typography>

           
            {userResults?.questionStats && userResults.questionStats.length > 0 ? (
              <table className="w-full table-auto border-collapse mt-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b py-4 px-4 text-left font-thai text-gray-800">
                      คำถาม
                    </th>
                    <th className="border-b py-4 px-4 text-center font-thai text-gray-800">
                      คำตอบของผู้ใช้
                    </th>
                    <th className="border-b py-4 px-4 text-center font-thai text-gray-800">
                      คำตอบที่ถูกต้อง
                    </th>
                    <th className="border-b py-4 px-4 text-center font-thai text-gray-800">
                      คะแนน
                    </th>
                    <th className="border-b py-4 px-4 text-center font-thai text-gray-800">
                      สถานะ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {userResults.questionStats
                    .slice()
                    .sort((a, b) => (b.is_correct ? b.points : 0) - (a.is_correct ? a.points : 0))
                    .map((question, index) => (
                      <tr
                        key={index}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100`}
                      >
                        <td className="py-4 px-4 border-b font-thai text-gray-700">
                          {question.question_text}
                        </td>
                        <td className="py-4 px-4 border-b text-center font-thai text-gray-700">
                          {question.user_answer || "ไม่ได้ตอบ"}
                        </td>
                        <td className="py-4 px-4 border-b text-center font-thai text-gray-700">
                          {question.correct_answer}
                        </td>
                        <td className="py-4 px-4 border-b text-center font-thai text-gray-700">
                          {question.is_correct ? question.points : 0}
                        </td>
                        <td
                          className={`py-4 px-4 border-b text-center font-thai font-bold ${question.is_correct ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {question.is_correct ? "ถูกต้อง" : "ผิด"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              <Typography variant="h6" className="font-thai text-gray-500 mt-6">
                ไม่มีข้อมูลคำถามสำหรับผู้ใช้นี้
              </Typography>
            )}
          </CardBody>
        </Card>
      ) : (
        <div>
      
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-4">
              <Typography variant="h6" className="font-thai text-gray-800">
                จำนวนคำถามทั้งหมด
              </Typography>
              <Typography variant="h4" className="font-thai text-blue-500">
                {totalQuestions}
              </Typography>
            </Card>

            <Card className="p-4">
              <Typography variant="h6" className="font-thai text-gray-800">
                จำนวนนักเรียนทั้งหมดที่ทำข้อสอบ
              </Typography>
              <Typography variant="h4" className="font-thai text-red-500">
                {totalStudents}
              </Typography>
            </Card>
          </div>

         
          <Card>
            <CardHeader
              variant="gradient"
              color="gray"
              className="mb-8 p-4 flex justify-between"
            >
              <Typography variant="h4" color="white" className="font-thai">
                สถิติคำถามสำหรับข้อสอบ
              </Typography>
              <Button color="red" onClick={() => setSelectedExam(null)} >
                กลับไปยังรายการข้อสอบ
              </Button>
            </CardHeader>
            <CardBody className="px-4 pt-4 pb-8">
              {questionStats.length > 0 ? (
               <table className="w-full table-auto border-collapse ">
  <thead>
    <tr className="bg-gray-100">
      <th className="border-b py-4 px-4 text-left font-thai text-gray-800 text-lg">
        คำถาม
      </th>
      <th className="border-b py-4 px-4 text-center font-thai text-gray-800 text-lg">
        จำนวนตอบถูก
      </th>
      <th className="border-b py-4 px-4 text-center font-thai text-gray-800 text-lg">
        จำนวนทั้งหมด
      </th>
      <th className="border-b py-4 px-4 text-center font-thai text-gray-800 text-lg">
        เปอร์เซ็นต์ตอบถูก
      </th>
    </tr>
  </thead>
  <tbody>
    {questionStats.map((question, index) => {
      const percentage = parseFloat(question.percentage) || 0;

      const percentageColor =
        percentage >= 80
          ? "text-green-600"
          : percentage >= 50
          ? "text-yellow-900"
          : "text-red-600";

      return (
        <tr
          key={index}
          className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
        >
          <td className="py-4 px-4 border-b font-thai text-gray-700">
            {question.question_text}
          </td>
          <td className="py-4 px-4 border-b text-center font-thai text-gray-700">
            {question.correct}
          </td>
          <td className="py-4 px-4 border-b text-center font-thai text-gray-700">
            {question.total}
          </td>
          <td className="py-4 px-4 border-b text-center font-thai font-bold">
            <div className="flex items-center justify-center gap-2">
              <span className={`${percentageColor}`}>{percentage.toFixed(2)}%</span>
              
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
              ) : (
                <Typography variant="h6" className="font-thai text-gray-500">
                  ไม่มีข้อมูลคำถามสำหรับข้อสอบนี้
                </Typography>
              )}
            </CardBody>
          </Card>

   
          <Card>
            <CardHeader
              variant="gradient"
              color="gray"
              className="mb-8 p-4 flex justify-between"
            >
              <Typography variant="h4" color="white" className="font-thai">
                รายชื่อนักเรียนที่ทำข้อสอบ
              </Typography>
            </CardHeader>
            <CardBody className="px-4 pt-4 pb-8">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b py-4 px-4 text-left font-thai text-gray-800">
                      ชื่อผู้ใช้
                    </th>
                    <th className="border-b py-4 px-4 text-center font-thai text-gray-800">

                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={index}
                      className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
                    >
                      <td className="py-4 px-4 border-b font-thai text-gray-700">
                        {user.user_name || "ไม่พบชื่อผู้ใช้"} 
                      </td>
                      <td className="py-4 px-4 border-b font-thai text-center">
                        <Button
                          color="blue"
                          className="text-lg"
                          onClick={() => fetchUserResults(user.user_id)}
                        >
                          ดูผลการสอบ
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

export default TeacherResults;