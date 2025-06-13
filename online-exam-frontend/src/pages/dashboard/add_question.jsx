import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@material-tailwind/react";

function AddQuestion() {
  const [exams, setExams] = useState([]); 
  const [selectedExam, setSelectedExam] = useState(null); 
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]); 
  const [examQuestions, setExamQuestions] = useState([]); 
  const [searchTag, setSearchTag] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [pendingQuestions, setPendingQuestions] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null); 

  const fetchExams = async () => {
    try {
      const response = await fetch("http://localhost:5000/exams");
      const data = await response.json();
      setExams(data || []); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching exams:", error);
      setExams([]); 
      setLoading(false);
    }
  };

  const fetchQuestionBank = async () => {
    if (!selectedExam || !selectedExam.category || !selectedExam.category.name) {
      console.error("No exam or category selected.");
      setQuestionBank([]); 
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/questions?category=${encodeURIComponent(selectedExam.category.name)}`
      );
      const data = await response.json();
      console.log("Fetched Question Bank:", data); 
      setQuestionBank(data || []); 
    } catch (error) {
      console.error("Error fetching question bank:", error);
      setQuestionBank([]); 
    }
  };

  const fetchExamQuestions = async (exam_id) => {
    if (!exam_id) {
      console.error("No exam ID provided.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/exams/${exam_id}/questions`);
      if (response.ok) {
        const data = await response.json();
        setExamQuestions(data.questions || []); 
      } else {
        const errorData = await response.json();
        console.error("Failed to fetch questions:", errorData.message);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

 
  const handleAddToExam = async () => {
    if (!selectedExam) {
      Swal.fire("Error", "Please select an exam first!", "error");
      return;
    }

    if (selectedQuestions.length === 0) {
      Swal.fire("Error", "Please select at least one question!", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/exams/${selectedExam.exam_id}/add-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questionIds: selectedQuestions }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "สำเร็จ!",
          text: "เพิ่มคำถามไปยังชุดข้อสอบเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "swal-button-blue", 
          },
        });
        setSelectedQuestions([]); 
        fetchExamQuestions(selectedExam.exam_id); 
      } else {
        Swal.fire("Error", "Failed to add questions to the exam.", "error");
      }
    } catch (error) {
      console.error("Error adding questions to the exam:", error);
      Swal.fire("Error", "An error occurred while adding questions.", "error");
    }
  };


  const handleEditQuestion = async (questionId, updatedData) => {
    try {
      const response = await fetch(
        `http://localhost:5000/exams/${selectedExam.exam_id}/questions/${questionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {

        Swal.fire({
          title: "สำเร็จ!",
          text: "แก้ไขคำถามเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "swal-button-blue", 
          },
        });
        fetchExamQuestions(selectedExam.exam_id); 
      } else {
        Swal.fire("Error", "Failed to update the question.", "error");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      Swal.fire("Error", "An error occurred while updating the question.", "error");
    }
  };


  
  const handleCheckboxChange = (questionId) => {
  setSelectedQuestions((prevSelected) => {
    if (prevSelected.includes(questionId)) {
     
      return prevSelected.filter((id) => id !== questionId);
    } else {
    
      return [...prevSelected, questionId];
    }
  });
};

  const handleEditClick = (question) => {
    Swal.fire({
      title: "Edit Question",
      html: `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <label style="width: 100px;">คำถาม:</label>
      <input id="question_text" class="swal2-input" style="width: calc(100% - 110px);" value="${question.question_text}" />
    </div>
    <div style="margin-bottom: 16px;">
      ${question.options
          .map(
            (option, index) =>
              `<div style="display: flex; align-items: center; margin-bottom: 8px;">
              <label style="width: 100px;">ตัวเลือก ${index + 1}:</label>
              <input id="option_${index}" class="swal2-input" style="width: calc(100% - 110px);" value="${option}" />
            </div>`
          )
          .join("")}
    </div>
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <label style="width: 100px;">คำตอบที่ถูกต้อง:</label>
      <input id="correct_answer" class="swal2-input" style="width: calc(100% - 110px);" value="${question.correct_answer}" />
    </div>
    <div style="margin-bottom: 16px;">
      <label style="width: 100px;">แท็ก:</label>
      <div id="tags_container">
        ${question.tags
          .map(
            (tag, index) =>
              `<div style="display: flex; align-items: center; margin-bottom: 8px;">
                <input id="tag_${index}" class="swal2-input" style="width: calc(100% - 110px);" value="${tag}" />
                <button
  type="button"
  class="remove-tag"
  data-index="${index}"
  style="
    margin-left: 8px;
    background-color: #ff4d4f;
    color: white;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 50px;
    min-height: 60px;
  "
>
  <i class="fas fa-trash-alt" style="font-size: 18px; margin-bottom: 4px;"></i>
  <span style="font-size font-bold: 14px;">ลบ</span>
</button>
              </div>`
          )
          .join("")}
      </div>
      <button id="add_tag" type="button" style="margin-top: 8px; background-color: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">เพิ่มแท็ก</button>
    </div>
  `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "swal-button-blue",
        cancelButton: "swal-button-red",
      },
      didOpen: () => {
       
        const addTagButton = document.getElementById("add_tag");
        if (addTagButton) {
          addTagButton.addEventListener("click", () => {
            const tagsContainer = document.getElementById("tags_container");
            const newTagIndex = tagsContainer.querySelectorAll("input").length;
            const newTagHtml = `
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <input id="tag_${newTagIndex}" class="swal2-input" style="width: calc(100% - 110px);" placeholder="แท็ก ${newTagIndex + 1}" />
              <button type="button" class="remove-tag" data-index="${newTagIndex}" style="margin-left: 8px; background-color: #ff4d4f; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">
                <i class="fas fa-trash-alt"></i> ลบ
              </button>
            </div>`;
            tagsContainer.insertAdjacentHTML("beforeend", newTagHtml);
          });
        }

       
        document.querySelectorAll(".remove-tag").forEach((button) => {
          button.addEventListener("click", (e) => {
            const index = e.target.dataset.index;
            const tagElement = document.getElementById(`tag_${index}`).parentElement;
            tagElement.remove();
          });
        });
      },
      preConfirm: () => {
        const question_text = document.getElementById("question_text").value;
        const correct_answer = document.getElementById("correct_answer").value;
        const options = Array.from(
          document.querySelectorAll("input[id^='option_']")
        ).map((input) => input.value);
        const tags = Array.from(
          document.querySelectorAll("#tags_container input")
        ).map((input) => input.value);

    
        if (!question_text || options.some((opt) => !opt) || !correct_answer) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return null;
        }

        return { question_text, correct_answer, options, tags };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedQuestion = {
          ...question,
          question_text: result.value.question_text,
          correct_answer: result.value.correct_answer,
          options: result.value.options,
          tags: result.value.tags,
        };
        handleSaveChanges(updatedQuestion); 
      }
    });
  };



  const handleAddToPendingQuestions = (question) => {
    setPendingQuestions((prev) => [...prev, question]);
  };

  const handleSubmitQuestions = async () => {
    if (!selectedExam) {
      Swal.fire("Error", "กรุณาเลือกชุดข้อสอบก่อน!", "error");
      return;
    }

    if (pendingQuestions.length === 0) {
      Swal.fire("Error", "ไม่มีคำถามที่ต้องการเพิ่ม!", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/exams/${selectedExam.exam_id}/add-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questions: pendingQuestions }),
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "สำเร็จ!",
          text: "เพิ่มคำถามไปยังชุดข้อสอบเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
        });
        setPendingQuestions([]); 
        fetchExamQuestions(selectedExam.exam_id); 
      } else {
        Swal.fire("Error", "Failed to submit questions to the exam.", "error");
      }
    } catch (error) {
      console.error("Error submitting questions:", error);
      Swal.fire("Error", "An error occurred while submitting questions.", "error");
    }
  };


  const handleSaveChanges = async (updatedQuestion) => {
    if (!updatedQuestion || !updatedQuestion.id) {
      console.error("No question selected for editing.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/exams/${selectedExam._id}/questions/${updatedQuestion.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedQuestion), 
        }
      );

      if (response.ok) {
        Swal.fire({
          title: "สำเร็จ!",
          text: "แก้ไขคำถามเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "swal-button-blue",
          },
        });
        fetchExamQuestions(selectedExam._id); 
      } else {
        Swal.fire("Error", "Failed to update the question.", "error");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      Swal.fire("Error", "An error occurred while updating the question.", "error");
    }
  };

  const fetchPreTestTags = async (postTestName) => {

    const preTestName = postTestName.replace("(Post-Test)", "(Pre-Test)");

    try {
 
      const response = await fetch(`http://localhost:5000/exams?name=${encodeURIComponent(preTestName)}`);
      const preTestExam = await response.json();

      if (preTestExam && preTestExam.length > 0) {

        const preTestQuestionsResponse = await fetch(
          `http://localhost:5000/exams/${preTestExam[0].exam_id}/questions`
        );
        const preTestQuestions = await preTestQuestionsResponse.json();

        return preTestQuestions.map((question) => ({
          question_text: question.question_text,
          tags: question.tags,
        }));
      } else {
        console.warn("Pre-Test not found for:", preTestName);
        return [];
      }
    } catch (error) {
      console.error("Error fetching Pre-Test tags:", error);
      return [];
    }
  };



  const compareTagsWithPreTest = async () => {
    if (!selectedExam || selectedExam.exam_type !== "post-test") {
      Swal.fire("ข้อผิดพลาด", "ฟีเจอร์นี้ใช้ได้เฉพาะกับ Post-Test เท่านั้น", "error");
      return;
    }

    if (!selectedExam.pre_test_id) {
      Swal.fire("ข้อผิดพลาด", "ไม่พบ Pre-Test ที่เกี่ยวข้องกับ Post-Test นี้", "error");
      return;
    }

    try {

      const response = await fetch(`http://localhost:5000/exams/${selectedExam.pre_test_id}/questions`);
      if (!response.ok) {
        Swal.fire("ข้อผิดพลาด", "ไม่สามารถดึงข้อมูล Pre-Test ได้", "error");
        return;
      }

      const preTestData = await response.json();
      const preTestQuestions = preTestData.questions || [];


      const preTestTagCounts = countTags(preTestQuestions);

  
      const postTestTagCounts = countCoveredTags(preTestTagCounts, examQuestions);

    
      const missingTagCounts = calculateMissingTags(preTestTagCounts, postTestTagCounts);

   
      if (Object.keys(missingTagCounts).length === 0) {
        Swal.fire({
          title: "สำเร็จ!",
          text: "ไม่มีแท็กที่ขาดหาย แท็กทั้งหมดถูกครอบคลุมแล้ว",
          icon: "success",
          confirmButtonText: "ตกลง",
          customClass: {
            confirmButton: "swal-button-blue",
          },
        });
        return;
      }

    
      const missingTagsSummary = Object.entries(missingTagCounts)
        .map(
          ([tags, count]) =>
            `<div style="margin-bottom: 8px;">
            <strong>${count} คำถาม</strong> ที่ต้องการสำหรับแท็ก: <span style="color: #007bff;">${tags}</span>
          </div>`
        )
        .join("");

   
      Swal.fire({
        title: '<h3 style="color: #333;">สรุปแท็กที่ขาดหาย</h3>',
        html: `
        <div style="text-align: center; font-size: 16px; color: #555;">
          ${missingTagsSummary}
        </div>
      `,
        icon: "info",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "swal-button-blue",
        },
      });
    } catch (error) {
      console.error("Error comparing tags with Pre-Test:", error);
      Swal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการตรวจสอบแท็ก", "error");
    }
  };

 
  const countTags = (questions) => {
    return questions.reduce((acc, { tags }) => {
      const key = tags.join(", "); 
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += 1; 
      return acc;
    }, {});
  };

  
  const countCoveredTags = (preTestTagCounts, postTestQuestions) => {
    return Object.keys(preTestTagCounts).reduce((acc, key) => {
      const tags = key.split(", "); 
      const count = postTestQuestions.filter((postTestQuestion) =>
        tags.every((tag) => postTestQuestion.tags.includes(tag))
      ).length;

      acc[key] = count;
      return acc;
    }, {});
  };

  
  const calculateMissingTags = (preTestTagCounts, postTestTagCounts) => {
    return Object.entries(preTestTagCounts).reduce((acc, [key, preTestCount]) => {
      const postTestCount = postTestTagCounts[key] || 0; 
      const missingCount = preTestCount - postTestCount;

      if (missingCount > 0) {
        acc[key] = missingCount; 
      }

      return acc;
    }, {});
  };


  const formatMissingTags = (missingTagCounts) => {
    return Object.entries(missingTagCounts)
      .map(([tags, count]) => `${count} คำถามที่ต้องการสำหรับแท็ก: ${tags}`)
      .join("<br>");
  };

  const handleCreateQuestionClick = () => {
    Swal.fire({
      title: "สร้างคำถามใหม่",
      html: `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Question Name -->
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <label style="width: 100px;">คำถาม:</label>
            <input id="new_question_text" class="swal2-input" style="width: calc(100% - 110px);" placeholder="กรอกคำถาม" />
          </div>
  
          <!-- Options -->
          <div style="margin-bottom: 16px;">
            <label style="width: 100px;">ตัวเลือก:</label>
            <div id="options_container">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <label style="width: 100px;">ตัวเลือก 1:</label>
                <input id="option_0" class="swal2-input" style="width: calc(100% - 110px);" placeholder="ตัวเลือก 1" />
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <label style="width: 100px;">ตัวเลือก 2:</label>
                <input id="option_1" class="swal2-input" style="width: calc(100% - 110px);" placeholder="ตัวเลือก 2" />
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <label style="width: 100px;">ตัวเลือก 3:</label>
                <input id="option_2" class="swal2-input" style="width: calc(100% - 110px);" placeholder="ตัวเลือก 3" />
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <label style="width: 100px;">ตัวเลือก 4:</label>
                <input id="option_3" class="swal2-input" style="width: calc(100% - 110px);" placeholder="ตัวเลือก 4" />
              </div>
            </div>
	<!-- Points -->
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <label style="width: 100px;">คะแนน:</label>
            <input id="new_points" class="swal2-input" style="width: calc(100% - 110px);" placeholder="กรอกคะแนน" type="number" />
          </div>
        </div>
          </div>
  
          <!-- Correct Answer -->
          <div style="margin-bottom: 16px;">
            
            <select id="new_correct_answer" class="swal2-input" style="width: calc(100% - 110px);">
              <option value="" disabled selected>เลือกคำตอบที่ถูกต้อง</option>
            </select>
          </div>
  
          <!-- Tags -->
          <div style="margin-bottom: 16px;">
            
            <div id="tags_container">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <label style="width: 100px;">แท็ก 1:</label>
                <input id="tag_0" class="swal2-input" style="width: calc(100% - 110px);" placeholder="แท็ก 1" />
              </div>
            </div>
            <button 
              id="add_tag" 
              type="button" 
              style="margin-top: 8px; background-color: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 50%; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;"
            >
              +
            </button>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "swal-button-blue",
        cancelButton: "swal-button-red",
      },
      didOpen: () => {
        
        const addTagButton = document.getElementById("add_tag");
        if (addTagButton) {
          addTagButton.addEventListener("click", () => {
            const tagsContainer = document.getElementById("tags_container");
            const newTagIndex = tagsContainer.querySelectorAll("input").length;
            const newTagHtml = `
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <label style="width: 100px;">แท็ก ${newTagIndex + 1}:</label>
                <input id="tag_${newTagIndex}" class="swal2-input" style="width: calc(100% - 110px);" placeholder="แท็ก ${newTagIndex + 1}" />
              </div>`;
            tagsContainer.insertAdjacentHTML("beforeend", newTagHtml);
          });
        }

       
        const optionsContainer = document.getElementById("options_container");
        const correctAnswerDropdown = document.getElementById("new_correct_answer");

        const updateCorrectAnswerDropdown = () => {
          correctAnswerDropdown.innerHTML = `
            <option value="" disabled selected>เลือกคำตอบที่ถูกต้อง</option>
          `;
          const optionInputs = optionsContainer.querySelectorAll("input");
          optionInputs.forEach((input, index) => {
            if (input.value.trim() !== "") {
              const option = document.createElement("option");
              option.value = input.value;
              option.textContent = `ตัวเลือก ${index + 1}: ${input.value}`;
              correctAnswerDropdown.appendChild(option);
            }
          });
        };

  
        optionsContainer.addEventListener("input", updateCorrectAnswerDropdown);
      },
      preConfirm: () => {

        const question_text = document.getElementById("new_question_text").value;
        const correct_answer = document.getElementById("new_correct_answer").value;
        const points = document.getElementById("new_points").value;

        const options = Array.from(
          document.querySelectorAll("#options_container input")
        ).map((input) => input.value);

     
        const tags = Array.from(
          document.querySelectorAll("#tags_container input")
        ).map((input) => input.value);


        if (!question_text || options.some((opt) => !opt) || !correct_answer) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return null;
        }

        return { question_text, options, correct_answer, tags, points }; 
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleCreateQuestion(result.value); 
      }
    });
  };

  const handleCreateQuestion = async (newQuestion) => {
    if (!selectedExam) {
      Swal.fire("Error", "กรุณาเลือกชุดข้อสอบก่อน!", "error");
      return;
    }

   
    const questionWithCategory = {
      ...newQuestion,
      category: selectedExam.category, 
    };

    try {
      const response = await fetch(
        `http://localhost:5000/exams/${selectedExam._id}/add-question`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(questionWithCategory), 
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire("Error", errorData.error || "Failed to add question", "error");
        return;
      }

      const data = await response.json();
      console.log("Question Added Successfully:", data);

      Swal.fire({
        title: "สำเร็จ!",
        text: "สร้างคำถามใหม่เรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
        customClass: {
          confirmButton: "swal-button-blue",
        },
      });

 
      fetchExamQuestions(selectedExam._id);
    } catch (error) {
      console.error("Error Adding Question:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการเพิ่มคำถาม", "error");
    }
  };

  const handleAddQuestionsFromBank = async () => {
  if (!selectedExam || !selectedExam._id) {
    Swal.fire("Error", "กรุณาเลือกชุดข้อสอบก่อน!", "error");
    return;
  }

  if (selectedQuestions.length === 0) {
    Swal.fire({
      title: "Error!",
      text: "กรุณาเลือกคำถามจากคลังคำถาม",
      icon: "error",
      confirmButtonText: "ตกลง",
      customClass: {
        confirmButton: "swal-button-blue",
      },
    });
    return;
  }

  
  console.log("Payload being sent:", { question_ids: selectedQuestions });

  try {
    const response = await fetch(
      `http://localhost:5000/exams/${selectedExam._id}/add-questions-from-bank`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question_ids: selectedQuestions }), 
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error response from server:", errorData);
      Swal.fire("Error", errorData.message || "ไม่สามารถเพิ่มคำถามได้", "error");
      return;
    }

    const data = await response.json();
    Swal.fire({
      title: "สำเร็จ!",
      text: "เพิ่มคำถามจากคลังคำถามเรียบร้อยแล้ว",
      icon: "success",
      confirmButtonText: "ตกลง",
      customClass: {
        confirmButton: "swal-button-blue",
      },
    });
    setSelectedQuestions([]);
    fetchExamQuestions(selectedExam._id); 
  } catch (error) {
    console.error("Error adding questions:", error);
    Swal.fire("Error", "เกิดข้อผิดพลาดในการเพิ่มคำถาม", "error");
  }
};

  const handleSaveToDatabase = async () => {
    if (!selectedExam || !selectedExam._id) {
      Swal.fire("Error", "กรุณาเลือกชุดข้อสอบก่อน!", "error");
      return;
    }

    if (pendingQuestions.length === 0) {
      Swal.fire("Error", "ไม่มีคำถามที่ต้องการเพิ่ม!", "error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/exams/${selectedExam._id}/add-questions-from-bank`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ questions: pendingQuestions }),
        }
      );

      if (response.ok) {
        Swal.fire("สำเร็จ!", "เพิ่มคำถามเรียบร้อยแล้ว!", "success");
        setPendingQuestions([]); 
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "ไม่สามารถเพิ่มคำถามได้", "error");
      }
    } catch (error) {
      console.error("Error submitting questions:", error);
      Swal.fire("Error", "เกิดข้อผิดพลาดในการเพิ่มคำถาม", "error");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    Swal.fire({
      text: "คุณต้องการลบคำถามนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      customClass: {
        confirmButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
        cancelButton: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `http://localhost:5000/exams/${selectedExam._id}/questions/${questionId}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            setExamQuestions((prev) => prev.filter((q) => q.id !== questionId));
            Swal.fire({
              title: "สำเร็จ!",
              text: "ลบคำถามเรียบร้อยแล้ว",
              icon: "success",
              confirmButtonText: "ตกลง",
              customClass: {
                confirmButton: "swal-button-blue",
              },
            });
          } else {
            const errorData = await response.json();
            Swal.fire({
              title: "Error",
              text: errorData.message || "Failed to delete the question.",
              icon: "error",
              confirmButtonText: "OK",
              customClass: {
                confirmButton: "swal-button-red",
              },
            });
          }
        } catch (error) {
          console.error("Error deleting question:", error);
          Swal.fire({
            title: "Error",
            text: "An error occurred while deleting the question.",
            icon: "error",
            confirmButtonText: "OK",
            customClass: {
              confirmButton: "swal-button-red",
            },
          });
        }
      }
    });
  };

  useEffect(() => {
    fetchExams();
    fetchQuestionBank();
  }, []);

  useEffect(() => {
    if (selectedExam && selectedExam._id) {
      fetchQuestionBank(); 
      fetchExamQuestions(selectedExam._id); 
    }
  }, [selectedExam]);

  const filteredQuestions = searchTag
    ? questionBank.filter((question) =>
      question.tags.some((tag) => tag.toLowerCase().includes(searchTag.toLowerCase()))
    )
    : questionBank || []; 

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-4">
          <Typography variant="h3" color="white" className="font-thai">
            เพิ่มคำถาม
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
       
          <div className="px-4 flex items-center gap-4">
            <Typography variant="h6" className="font-thai mb-4">
              เลือกชุดข้อสอบ:
            </Typography>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => {
                const exam = exams.find((exam) => exam._id === e.target.value); 
                setSelectedExam(exam);
                console.log("Selected Exam:", exam); 
              }}
            >
              <option value="">-- เลือกชุดข้อสอบ --</option>
              {Array.isArray(exams) && exams.length > 0 ? (
                exams.map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.exam_name} ({exam.exam_type === "pre-test" ? "Pre-Test" : "Post-Test"})
                  </option>
                ))
              ) : (
                <option disabled>Loading exams...</option>
              )}
            </select>
          </div>


          {selectedExam && (
            <div className="mt-6 px-4 flex gap-8">
            
              <div className="w-1/2">
                <div className="flex items-center gap-2 mb-4">
                  <Typography variant="h5" className="font-thai">
                    คลังคำถาม
                  </Typography>
                  <button
                    onClick={handleAddQuestionsFromBank}
                    className="text-white px-6 py-2 rounded hover:opacity-90"
                    style={{ backgroundColor: "#382c4c" }}
                  >
                    <Typography variant="h7" color="white" className="font-thai font-bold">
                      เพิ่มคำถามไปยังชุดข้อสอบ
                    </Typography>
                  </button>
                </div>

                <table className="w-full min-w-[320px] table-auto border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">เลือก</th>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">คำถาม</th>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">ตัวเลือก</th>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">คำตอบที่ถูกต้อง</th>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">หมวดหมู่</th> 
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(filteredQuestions) && filteredQuestions.length > 0 ? (
                      filteredQuestions.map((question) => (
                        <tr key={question._id} className="hover:bg-gray-100">
                          <td className="py-2 px-4 border-b border-blue-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedQuestions.includes(question._id)}
                              onChange={() => handleCheckboxChange(question._id)}
                            />
                          </td>
                          <td className="py-2 px-4 border-b border-blue-gray-50">
                            {question.question_text}
                          </td>
                          <td className="py-2 px-4 border-b border-blue-gray-50">
                            <ul className="list-disc list-inside">
                              {question.options.map((option, index) => (
                                <li key={index}>{option}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="py-2 px-4 border-b border-blue-gray-50">
                            {question.correct_answer}
                          </td>
                          <td className="py-2 px-4 border-b border-blue-gray-50">
                            {question.category || "No Category"} 
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No questions available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>


              </div>


              <div className="w-1/2">
                <div className="flex items-center gap-4 mb-4">
                  <Typography variant="h5" className="font-thai">
                    คำถามในชุดข้อสอบนี้
                  </Typography>
                  <button
                    onClick={handleCreateQuestionClick}
                    className="text-white px-6 py-2 rounded hover:opacity-90"
                    style={{ backgroundColor: "#382c4c" }}
                  >
                    <Typography variant="h7" color="white" className="font-thai font-bold">
                      สร้างคำถามใหม่
                    </Typography>
                  </button>
                  {selectedExam && selectedExam.exam_type === "post-test" && (
                    <div className="relative group">
                      <button
                        onClick={compareTagsWithPreTest}
                        className="text-white px-6 py-2 rounded hover:opacity-90"
                        style={{ backgroundColor: "#2894f4" }}
                      >
                        <Typography variant="h7" color="white" className="font-thai font-bold">
                          ตรวจสอบแท็กที่ขาดหาย
                        </Typography>
                      </button>

                      <div className="absolute left-0 mt-2 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        คลิกเพื่อตรวจสอบว่าแท็กทั้งหมดจาก Pre-Test มีอยู่ใน Post-Test หรือไม่
                      </div>
                    </div>
                  )}
                </div>

                <table className="w-full min-w-[320px] table-auto border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">คำถาม</th>
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">คำตอบที่ถูกต้อง</th> 
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">แท็ก</th> 
                      <th className="border-b border-blue-gray-50 py-3 px-4 text-left">การกระทำ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examQuestions.map((question) => (
                      <tr key={question._id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b border-blue-gray-50">
                          {question.question_text}
                        </td>
                        <td className="py-2 px-4 border-b border-blue-gray-50">
                          {question.correct_answer}
                        </td>
                        <td className="py-2 px-4 border-b border-blue-gray-50">
                          <div className="flex flex-wrap gap-2">
                            {question.tags && question.tags.length > 0 ? (
                              question.tags.map((tag, idx) => {
                                
                                let borderColor = "border-green-400";
                                let bgColor = "bg-green-50";
                                let textColor = "text-green-700";

                               
                                if (tag.includes("Critical")) {
                                  borderColor = "border-red-500";
                                  bgColor = "bg-red-100";
                                  textColor = "text-red-700";
                                } else if (tag.includes("Warning")) {
                                  borderColor = "border-yellow-500";
                                  bgColor = "bg-yellow-200";
                                  textColor = "text-yellow-800";
                                }

                                return (
                                  <div
                                    key={idx}
                                    className={`inline-flex items-center border-2 ${borderColor} ${bgColor} rounded-full px-4 py-2 text-sm font-thai font-bold shadow-sm`}
                                  >
                                    <span className={`${textColor}`}>{tag}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="inline-flex items-center border-2 border-gray-300 bg-gray-100 rounded-full px-4 py-2 text-sm font-thai font-bold shadow-sm">
                                <span className="text-gray-600">ไม่มีแท็ก</span> 
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-9 px-4 border-b border-blue-gray-50 flex gap-2">
                          <button
                            onClick={() => handleEditClick(question)}
                            className="text-white px-4 py-2 rounded bg-blue-500 hover:bg-blue-600"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-white px-4 py-2 rounded bg-red-500 hover:bg-red-600"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardBody>
      </Card>


      {editModalOpen && currentQuestion && (
        <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <ModalHeader>แก้ไขคำถาม</ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-6">
            


              <div>
                <Typography variant="small" className="mb-2">คำถาม:</Typography>
                <Input
                  type="text"
                  value={currentQuestion.question_text}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, question_text: e.target.value })
                  }
                />
              </div>

      
              <div>
                <Typography variant="small" className="mb-2">ตัวเลือก:</Typography>
                {(currentQuestion.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-4 mt-2">
                    <Input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...currentQuestion.options];
                        updatedOptions[index] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
                      }}
                    />
                    <Button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        const updatedOptions = currentQuestion.options.filter((_, i) => i !== index);
                        setCurrentQuestion({ ...currentQuestion, options: updatedOptions });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  className="bg-blue-500 text-white mt-2"
                  onClick={() =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      options: [...currentQuestion.options, ""], 
                    })
                  }
                >
                  Add Option
                </Button>
              </div>

        
              <div>
                <Typography variant="small" className="mb-2">แท็ก:</Typography>
                {(currentQuestion.tags || []).map((tag, index) => (
                  <div key={index} className="flex items-center gap-4 mt-2">
                    <Input
                      type="text"
                      value={tag}
                      onChange={(e) => {
                        const updatedTags = [...currentQuestion.tags];
                        updatedTags[index] = e.target.value;
                        setCurrentQuestion({ ...currentQuestion, tags: updatedTags });
                      }}
                    />
                    <Button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => {
                        const updatedTags = currentQuestion.tags.filter((_, i) => i !== index);
                        setCurrentQuestion({ ...currentQuestion, tags: updatedTags });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  className="bg-blue-500 text-white mt-2"
                  onClick={() =>
                    setCurrentQuestion({
                      ...currentQuestion,
                      tags: [...currentQuestion.tags, ""], 
                    })
                  }
                >
                  Add Tag
                </Button>
              </div>

             
              <div>
                <Typography variant="small" className="mb-2">คำตอบที่ถูกต้อง:</Typography>
                <Input
                  type="text"
                  value={currentQuestion.correct_answer}
                  onChange={(e) =>
                    setCurrentQuestion({ ...currentQuestion, correct_answer: e.target.value })
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              className="bg-blue-500 text-white"
              onClick={handleSaveChanges}
            >
              บันทึก
            </Button>
            <Button
              className="bg-gray-500 text-white"
              onClick={() => setEditModalOpen(false)}
            >
              ยกเลิก
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default AddQuestion;