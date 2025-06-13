import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

function ExamResults() {
  const [completedExams, setCompletedExams] = useState([]);
  const [selectedExamName, setSelectedExamName] = useState(null);
  const [examResults, setExamResults] = useState({ preTest: null, postTest: null });
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const fetchCompletedExams = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID is missing");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:5000/userAnswers/get-user-exams?user_id=${userId}`
        );
        const data = await response.json();
        console.log("Completed Exams:", data.exams);
        setCompletedExams(data.exams);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching completed exams:", error);
        setLoading(false);
      }
    };
    fetchCompletedExams();
  }, []);

  const groupedExams = completedExams.reduce((acc, exam) => {
    const name = exam.exam_name || exam.name || "ชื่อข้อสอบไม่พบ";
    if (!acc[name]) acc[name] = {};
    acc[name][exam.exam_type] = exam;
    return acc;
  }, {});
  console.log("Grouped Exams:", groupedExams);

  const fetchExamResultsForName = async (examName) => {
    setLoading(true);
    const exams = groupedExams[examName];
    const userId = localStorage.getItem("userId");

    try {
      const examId = exams?.["pre-test"]?.exam_id || exams?.["post-test"]?.exam_id;
      if (!examId) {
        console.error(`No valid exam ID found for exam: ${examName}`);
        setLoading(false);
        return;
      }

      const response = await fetch(
        `http://localhost:5000/userAnswers/exam-results/${examId}/${userId}`
      );
      const data = await response.json();
      console.log("Exam Results API Response:", data); 
      setExamResults(data);
      setSelectedExamName(examName);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exam results:", error);
      setLoading(false);
    }
  };
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      {!selectedExamName ? (
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-4 flex justify-between"
          >
            <Typography variant="h4" color="white" className="font-thai">
              ข้อสอบที่คุณทำเสร็จแล้ว
            </Typography>
          </CardHeader>
          <CardBody className="px-4 pt-4 pb-8">
            {loading ? (
              <Typography className="font-thai text-gray-700">
                กำลังโหลด...
              </Typography>
            ) : Object.keys(groupedExams).length === 0 ? (
              <Typography className="font-thai text-gray-700">
                ไม่มีข้อสอบที่ทำเสร็จแล้ว
              </Typography>
            ) : (
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border-b py-3 px-4 text-left font-thai text-gray-800">
                      ชื่อข้อสอบ
                    </th>
                    <th className="border-b py-3 px-4 text-center font-thai text-gray-800">
                      Pre-Test
                    </th>
                    <th className="border-b py-3 px-4 text-center font-thai text-gray-800">
                      Post-Test
                    </th>
                    <th className="border-b py-3 px-4 text-center font-thai text-gray-800">
                      การกระทำ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groupedExams).map(([name, exams], idx) => (
                    <tr
                      key={name}
                      className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                    >
                   
                      <td className="py-2 px-4 border-b font-thai text-gray-700">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg">{name}</span>

                        </div>
                      </td>

                      <td className="py-2 px-4 border-b text-center">
                        {exams["pre-test"] ? (
                          <span className="text-green-600 text-xl font-bold">✅</span>
                        ) : (
                          <span className="text-red-600 text-xl font-bold">❌</span>
                        )}
                      </td>

                 
                      <td className="py-2 px-4 border-b text-center">
                        {exams["post-test"] ? (
                          <span className="text-green-600 text-xl font-bold">✅</span>
                        ) : (
                          <span className="text-red-600 text-xl font-bold">❌</span>
                        )}
                      </td>

                
                      <td className="py-2 px-4 border-b text-center">
                        <Button
                          color="blue"
                          onClick={() => fetchExamResultsForName(name)}
                          className="text-sm font-thai"
                        >
                          ดูผลการสอบ (Pre/Post)
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader
            variant="gradient"
            color="gray"
            className="mb-8 p-4 flex justify-between items-center"
          >
            <Typography variant="h4" color="white" className="font-thai">
              ผลการสอบ: {selectedExamName}
            </Typography>
            <Button color="red" onClick={() => setSelectedExamName(null)}>
              กลับไปยังรายการข้อสอบ
            </Button>
          </CardHeader>
          <CardBody className="px-6 pt-6 pb-8">
            {loading ? (
              <Typography className="font-thai text-gray-700 text-center">
                กำลังโหลด...
              </Typography>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-left font-bold text-gray-700 text-md mb-2">
                      PRE-TEST
                    </h2>
                    <div className="mb-2">
                      <div className="text-gray-600 font-medium">คะแนน:</div>
                      <div className="text-2xl font-bold text-black">
                        {examResults?.preTest?.score ?? "-"} /{" "}
                        {examResults?.preTest?.maxScore ?? "-"}
                      </div>
                      <div className="w-full h-2 bg-gray-300 rounded mt-1">
                        <div
                          className="h-2 bg-black rounded"
                          style={{
                            width: examResults?.preTest?.maxScore
                              ? `${(examResults.preTest.score / examResults.preTest.maxScore) * 100}%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium mb-1">
                        จุดที่ผู้สอบควรนำไปพัฒนา:
                      </div>
                      <div className="flex flex-wrap gap-3 justify-start">
                        {(examResults?.preTest?.tagFeedback || [])
                          .filter((tag) => tag.incorrect > 0) 
                          .sort((a, b) => {
                        
                            const percentA = a.total > 0 ? (a.incorrect / a.total) * 100 : 0;
                            const percentB = b.total > 0 ? (b.incorrect / b.total) * 100 : 0;

                           
                            if (percentB >= 60 && percentA < 60) return 1;
                            if (percentA >= 60 && percentB < 60) return -1;
                            if (percentB >= 30 && percentA < 30) return 1;
                            if (percentA >= 30 && percentB < 30) return -1;

                           
                            return b.incorrect - a.incorrect;
                          })
                          .map((tag, idx) => {
                            const percent = tag.total > 0 ? (tag.incorrect / tag.total) * 100 : 0;
                            let borderColor = "border-green-400";
                            let bgColor = "bg-green-50";
                            let textColor = "text-green-700";

                            if (percent >= 60) {
                              borderColor = "border-red-500";
                              bgColor = "bg-red-100";
                              textColor = "text-red-700";
                            } else if (percent >= 30) {
                              borderColor = "border-yellow-500"; 
                              bgColor = "bg-yellow-200"; 
                              textColor = "text-yellow-800";
                            }

                            return (
                             <div
  key={idx}
  className={`inline-flex items-center border-2 ${borderColor} ${bgColor} rounded-full px-4 py-2 text-sm font-thai font-bold shadow-sm`}
>
  <span className={`${textColor}`}>
    {`${tag.tag} ผิด ${tag.incorrect}/${tag.total} ข้อ`}
  </span>
</div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                
                  <div className="bg-white shadow-md rounded-lg p-4">
                    <h2 className="text-left font-bold text-gray-700 text-md mb-2">
                      POST-TEST
                    </h2>
                    <div className="mb-2">
                      <div className="text-gray-600 font-medium">คะแนน:</div>
                      <div className="text-2xl font-bold text-black">
                        {examResults?.postTest?.score ?? "-"} /{" "}
                        {examResults?.postTest?.maxScore ?? "-"}
                      </div>
                      <div className="w-full h-2 bg-gray-300 rounded mt-1">
                        <div
                          className="h-2 bg-black rounded"
                          style={{
                            width: examResults?.postTest?.maxScore
                              ? `${(examResults.postTest.score / examResults.postTest.maxScore) * 100}%`
                              : "0%",
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium mb-1">
                        จุดที่ผู้สอบควรนำไปพัฒนา:
                      </div>
                      <div className="flex flex-wrap gap-3 justify-start">
                        {(examResults?.postTest?.tagFeedback || [])
                          .filter((tag) => tag.incorrect > 0) 
                          .sort((a, b) => {
                            
                            const percentA = a.total > 0 ? (a.incorrect / a.total) * 100 : 0;
                            const percentB = b.total > 0 ? (b.incorrect / b.total) * 100 : 0;

                        
                            if (percentB >= 60 && percentA < 60) return 1;
                            if (percentA >= 60 && percentB < 60) return -1;
                            if (percentB >= 30 && percentA < 30) return 1;
                            if (percentA >= 30 && percentB < 30) return -1;

                           
                            return b.incorrect - a.incorrect;
                          })
                          .map((tag, idx) => {
  const percent = tag.total > 0 ? (tag.incorrect / tag.total) * 100 : 0;
  let borderColor = "border-green-400";
  let bgColor = "bg-green-50";
  let textColor = "text-green-700";

  if (percent >= 60) {
    borderColor = "border-red-500";
    bgColor = "bg-red-100";
    textColor = "text-red-700";
  } else if (percent >= 30) {
    borderColor = "border-yellow-600"; 
    bgColor = "bg-yellow-300"; 
    textColor = "text-yellow-900"; 
  }

  return (
    <div
      key={idx}
      className={`inline-flex items-center border-2 ${borderColor} ${bgColor} rounded-full px-4 py-2 text-sm font-thai font-bold shadow-sm`}
    >
      <span className={`${textColor}`}>
        {`${tag.tag} ผิด ${tag.incorrect}/${tag.total} ข้อ`}
      </span>
    </div>
  );
})}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default ExamResults;