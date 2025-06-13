import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

import "./sweetalert-custom.css";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";

function AddExam() {
  const [categories, setCategories] = useState([]);
  const [exams, setExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate(); 
  const [preTests, setPreTests] = useState([]);

 
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  
  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:5000/exams");
      const data = await response.json();
      setExams(data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };



  const fetchPreTests = async () => {
    try {
      const response = await fetch("http://localhost:5000/exams?exam_type=pre-test");
      const data = await response.json();
      setPreTests(data); 
    } catch (error) {
      console.error("Error fetching pre-tests:", error);
    }
  };

  const handleTogglePublish = async (examId) => {
    const result = await Swal.fire({
      title: "ยืนยันการเผยแพร่",
      text: "คุณต้องการเผยแพร่ชุดข้อสอบนี้ให้นักเรียนเห็นหรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "เผยแพร่",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600",
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
      },
    });
  
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/exams/${examId}/publish`, {
          method: "PUT",
        });
  
        if (response.ok) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "ชุดข้อสอบถูกเผยแพร่เรียบร้อยแล้ว",
            icon: "success",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
            },
          });
          fetchExams(); 
        } else {
          const errorData = await response.json();
          Swal.fire("ผิดพลาด!", errorData.message || "ไม่สามารถเผยแพร่ชุดข้อสอบได้", "error");
        }
      } catch (error) {
        console.error("Error publishing exam:", error);
        Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการเผยแพร่ชุดข้อสอบ", "error");
      }
    }
  };


  const handleAddCategory = () => {
    Swal.fire({
      title: "เพิ่มประเภทคำถาม",
      html: `
        <div>
          <label for="swal-input-category-name" class="swal2-label">ชื่อประเภท</label>
          <input id="swal-input-category-name" class="swal2-input" placeholder="Category Name">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
      },
      preConfirm: () => {
        const categoryName = document.getElementById("swal-input-category-name").value;

        if (!categoryName) {
          Swal.showValidationMessage("Category name is required");
          return false;
        }

        return { categoryName };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { categoryName } = result.value;

        fetch("http://localhost:5000/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: categoryName,
            tags: [], 
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (data.message === "Category already exists") {
              Swal.fire({
                title: "Notice",
                text: "Category already exists",
                icon: "info",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
                },
              });
            } else if (data.message === "Category created successfully") {
              fetchCategories();
              Swal.fire({
                title: "Success",
                text: "Category added successfully",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
                },
              });
            } else {
              Swal.fire("Error", data.message, "error");
            }
          })
          .catch((error) => {
            console.error("Error adding category:", error);
            Swal.fire("Error", "Failed to add category", "error");
          });
      }
    });
  };

  const handleAddExam = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มชุดข้อสอบ",
      html: `
        <div style="text-align: left; display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center;">
          
          
          <label for="examName" class="swal2-label">ชื่อข้อสอบ</label>
          <input type="text" id="examName" class="swal2-input" placeholder="ชื่อข้อสอบ">
          
          <label for="examCategory" class="swal2-label">หมวดหมู่ข้อสอบ</label>
          <input
            type="text"
            id="examCategory"
            class="swal2-input"
            placeholder="เลือกหรือเพิ่มหมวดหมู่"
            list="categoryList"
          />
          <datalist id="categoryList">
            ${categories.map((category) => `<option value="${category.name}"></option>`).join("")}
          </datalist>
          
          <label for="examDescription" class="swal2-label">วัตถุประสงค์ของข้อสอบ</label>
          <textarea id="examDescription" class="swal2-textarea" placeholder="วัตถุประสงค์ของข้อสอบ"></textarea>
          
          <label for="maxExam" class="swal2-label">คะแนนเต็ม</label>
          <input type="number" id="maxExam" class="swal2-input" placeholder="คะแนนเต็ม">
          
          <label for="examType" class="swal2-label">รูปแบบข้อสอบ</label>
          <select id="examType" class="swal2-select">
            <option value="pre-test">Pre-test</option>
            <option value="post-test">Post-test</option>
          </select>
  
          <!-- Placeholder for dynamically adding the Pre-Test dropdown -->
          <div id="dynamicPreTestDropdown"></div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
      },
      didOpen: () => {
        const examTypeSelect = document.getElementById("examType");
        const dynamicPreTestDropdown = document.getElementById("dynamicPreTestDropdown");

        
        examTypeSelect.addEventListener("change", async (e) => {
          if (e.target.value === "post-test") {
            await fetchPreTests();
            dynamicPreTestDropdown.innerHTML = `
              <label for="preTestId" class="swal2-label" style="margin-top: 10px;">เลือก Pre-Test</label>
              <select id="preTestId" class="swal2-select">
                <option value="">-- เลือก Pre-Test --</option>
                ${preTests.map((test) => `<option value="${test._id}">${test.exam_name}</option>`).join("")}
              </select>
            `;
          } else {
            
            dynamicPreTestDropdown.innerHTML = "";
          }
        });
      },
      preConfirm: async () => {
        const examName = document.getElementById("examName").value;
        const examCategory = document.getElementById("examCategory").value;
        const examDescription = document.getElementById("examDescription").value;
        const maxExam = document.getElementById("maxExam").value;
        const examType = document.getElementById("examType").value;
        const preTestId = document.getElementById("preTestId")?.value;

        if (!examName || !examCategory || !examDescription || !maxExam || !examType) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }

       
        if (examType === "post-test" && !preTestId) {
          Swal.showValidationMessage("กรุณาเลือก Pre-Test สำหรับ Post-Test");
          return false;
        }

        return { examName, examCategory, examDescription, maxExam, examType, preTestId };
      },
    });

    if (formValues) {
      try {
        const response = await fetch("http://localhost:5000/exams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam_name: formValues.examName,
            max_exam: parseInt(formValues.maxExam, 10),
            category: formValues.examCategory, 
            description: formValues.examDescription,
            exam_type: formValues.examType,
            pre_test_id: formValues.examType === "post-test" ? formValues.preTestId : null,
          }),
        });

        if (response.ok) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "เพิ่มชุดข้อสอบเรียบร้อยแล้ว",
            icon: "success",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
            },
          });
          fetchExams(); 
        } else {
          const errorData = await response.json();
          Swal.fire("ผิดพลาด!", errorData.message || "ไม่สามารถเพิ่มชุดข้อสอบได้", "error");
        }
      } catch (error) {
        console.error("Error adding exam:", error);
        Swal.fire("ผิดพลาด!", "ไม่สามารถเพิ่มชุดข้อสอบได้", "error");
      }
    }
  };


  const handleEditExam = async (exam) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขชุดข้อสอบ",
      html: `
        <div style="text-align: left; display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center;">
          <label for="examName" class="swal2-label">ชื่อข้อสอบ</label>
          <input type="text" id="examName" class="swal2-input" placeholder="ชื่อข้อสอบ" value="${exam.exam_name}">
          
          <label for="examCategory" class="swal2-label">หมวดหมู่ข้อสอบ</label>
          <input
            type="text"
            id="examCategory"
            class="swal2-input"
            placeholder="เลือกหรือเพิ่มหมวดหมู่"
            value="${exam.category?.name || ""}"
          />
          
          <label for="examDescription" class="swal2-label">วัตถุประสงค์ของข้อสอบ</label>
          <textarea id="examDescription" class="swal2-textarea" placeholder="วัตถุประสงค์ของข้อสอบ">${exam.description}</textarea>
          
          <label for="maxExam" class="swal2-label">คะแนนเต็ม</label>
          <input type="number" id="maxExam" class="swal2-input" placeholder="คะแนนเต็ม" value="${exam.max_exam}">
          
          <label for="examType" class="swal2-label">รูปแบบข้อสอบ</label>
          <select id="examType" class="swal2-select">
            <option value="pre-test" ${exam.exam_type === "pre-test" ? "selected" : ""}>Pre-test</option>
            <option value="post-test" ${exam.exam_type === "post-test" ? "selected" : ""}>Post-test</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
      },
      preConfirm: () => {
        const examName = document.getElementById("examName").value;
        const examCategory = document.getElementById("examCategory").value;
        const examDescription = document.getElementById("examDescription").value;
        const maxExam = document.getElementById("maxExam").value;
        const examType = document.getElementById("examType").value;
  
        if (!examName || !examCategory || !examDescription || !maxExam || !examType) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }
  
        return { examName, examCategory, examDescription, maxExam, examType };
      },
    });
  
    if (formValues) {
      try {
        const response = await fetch(`http://localhost:5000/exams/${exam._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam_name: formValues.examName,
            description: formValues.examDescription,
            max_exam: parseInt(formValues.maxExam, 10),
            exam_type: formValues.examType,
            category: formValues.examCategory,
          }),
        });
  
        if (response.ok) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "แก้ไขชุดข้อสอบเรียบร้อยแล้ว",
            icon: "success",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
            },
          });
          fetchExams(); 
        } else {
          Swal.fire({
            title: "ผิดพลาด!",
            text: "ไม่สามารถแก้ไขชุดข้อสอบได้",
            icon: "error",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
            },
          });
        }
      } catch (error) {
        console.error("Error editing exam:", error);
        Swal.fire({
          title: "ผิดพลาด!",
          text: "เกิดข้อผิดพลาดในการแก้ไขชุดข้อสอบ",
          icon: "error",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
          },
        });
      }
    }
  };

  const handleDeleteExam = async (examId) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบชุดข้อสอบนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
        cancelButton: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
      },
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:5000/exams/${examId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "ลบชุดข้อสอบเรียบร้อยแล้ว",
            icon: "success",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
            },
          });
          fetchExams(); 
        } else {
          const errorData = await response.json();
          Swal.fire("ผิดพลาด!", errorData.message || "ไม่สามารถลบชุดข้อสอบได้", "error");
        }
      } catch (error) {
        console.error("Error deleting exam:", error);
        Swal.fire("ผิดพลาด!", "เกิดข้อผิดพลาดในการลบชุดข้อสอบ", "error");
      }
    }
  };



  
  const handleTypeChange = (event) => {
    const newExamTypeInput = document.getElementById("newExamType");
    if (event.target.value === "add-new-type") {
      newExamTypeInput.style.display = "block"; 
    } else {
      newExamTypeInput.style.display = "none"; 
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchExams();
    fetchPreTests(); 
  }, []);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-4">
          <Typography variant="h3" color="white" className="font-thai">
            เพิ่มชุดข้อสอบ
          </Typography>
        </CardHeader>


        
        <CardBody className="px-0 pt-0 pb-2">
          <div className="flex items-center gap-x-4 mb-6 px-4">
        
            <div className="relative w-auto min-w-[250px]">
              <input
                type="text"
                placeholder="ค้นหาชุดข้อสอบ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>


            <button
              onClick={handleAddExam}
              className="text-white px-6 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: "#382c4c" }}
            >
              <Typography
                variant="h7"
                color="white"
                className="font-thai font-bold"
              >
                เพิ่มชุดข้อสอบ
              </Typography>
            </button>
          </div>

     
          <table className="w-full min-w-[640px] table-auto border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-gray-700 font-thai"
                  >
                    ชื่อข้อสอบ
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-gray-700 font-thai"
                  >
                    คะแนนเต็ม
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-gray-700 font-thai"
                  >
                    วัตถุประสงค์ของข้อสอบ
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-gray-700 font-thai"
                  >
                    หมวดหมู่ข้อสอบ
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-gray-700 font-thai"
                  >
                    สถานะ
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left w-1/5">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-gray-700 font-thai"
                  >
                    การกระทำ
                  </Typography>
                </th>
              </tr>
            </thead>

            <tbody>
              {exams
                .filter((exam) =>
                  exam.exam_name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((exam, index) => (
                  <tr
                    key={index}
                    className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-gray-100`}
                  >
                    <td className="py-2 px-4 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold font-thai"
                      >
                        {exam.exam_name}{" "}
                        <span className="text-sm text-gray-500">
                          ({exam.exam_type})
                        </span>
                      </Typography>
                    </td>
                    <td className="py-2 px-4 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold font-thai"
                      >
                        {exam.max_exam}
                      </Typography>
                    </td>
                    <td className="py-2 px-4 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold font-thai"
                      >
                        {exam.description}
                      </Typography>
                    </td>
                    <td className="py-2 px-4 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold font-thai"
                      >
                        {exam.category?.name || "ไม่มีหมวดหมู่"}
                      </Typography>
                    </td>
                    <td className="py-2 px-4 border-b border-blue-gray-50">
                      <Typography
                        variant="small"
                        color={exam.published ? "green" : "red"}
                        className="font-semibold font-thai"
                      >
                        {exam.published ? "เผยแพร่" : "ซ่อน"}
                      </Typography>
                    </td>
                    <td className="py-2 px-4 border-b border-blue-gray-50 flex gap-2">
                      
                      <button
                        onClick={() => handleEditExam(exam)}
                        className="text-white px-4 py-2 rounded bg-blue-500 hover:bg-blue-600"
                      >
                        แก้ไข
                      </button>

             
                      <button
                        onClick={() => handleDeleteExam(exam._id)}
                        className="text-white px-4 py-2 rounded bg-red-500 hover:bg-red-600"
                      >
                        ลบ
                      </button>

                    
                      {!exam.published && (
                        <button
                          onClick={() => handleTogglePublish(exam._id)} 
                          className="text-white px-4 py-2 rounded bg-green-500 hover:bg-green-600"
                          title="เผยแพร่ชุดข้อสอบนี้ให้นักเรียนเห็น" 
                        >
                          เผยแพร่
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>

          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default AddExam;