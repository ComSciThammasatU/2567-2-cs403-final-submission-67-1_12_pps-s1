import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Card, CardHeader, CardBody, Typography, Button, Input, Select, Option } from "@material-tailwind/react";

function AddQuestionsFromBank() {
  const [questionBank, setQuestionBank] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [categories, setCategories] = useState([]);

 
  const fetchQuestionBank = async () => {
    try {
      const response = await fetch("http://localhost:5000/questions");
      const data = await response.json();
      setQuestionBank(data || []);
      setFilteredQuestions(data || []);
      const uniqueCategories = [...new Set(data.map((q) => q.category || "No Category"))];
      setCategories(["All", ...uniqueCategories]);
    } catch (error) {
      console.error("Error fetching question bank:", error);
    }
  };

const handleAddQuestion = async () => {
  const { value: formValues } = await Swal.fire({
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
        </div>

        <!-- Correct Answer -->
        <div style="margin-bottom: 16px;">
          <select id="new_correct_answer" class="swal2-input" style="width: calc(100% - 110px);">
            <option value="" disabled selected>เลือกคำตอบที่ถูกต้อง</option>
          </select>
        </div>

        <!-- Points -->
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <label style="width: 100px;">คะแนน:</label>
          <input id="new_points" class="swal2-input" style="width: calc(100% - 110px);" placeholder="กรอกคะแนน" type="number" />
        </div>

        <!-- Category -->
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <label style="width: 100px;">หมวดหมู่:</label>
          <input id="new_category" class="swal2-input" style="width: calc(100% - 110px);" placeholder="กรอกหมวดหมู่" />
        </div>

        <!-- Tags -->
        <div style="margin-bottom: 16px;">
          <label style="width: 100px;">แท็ก:</label>
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
    confirmButtonText: "เพิ่มคำถาม",
    cancelButtonText: "ยกเลิก",
    customClass: {
      confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
      cancelButton: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
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
      const questionText = document.getElementById("new_question_text").value.trim();
      const options = Array.from(document.querySelectorAll("#options_container input")).map((input) =>
        input.value.trim()
      );
      const correctAnswer = document.getElementById("new_correct_answer").value.trim();
      const points = document.getElementById("new_points").value.trim();
      const category = document.getElementById("new_category").value.trim();
      const tags = Array.from(document.querySelectorAll("#tags_container input")).map((input) =>
        input.value.trim()
      );

      if (!questionText || options.some((opt) => !opt) || !correctAnswer || !category || tags.some((tag) => !tag)) {
        Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน!");
        return null;
      }

      return {
        question_text: questionText,
        options,
        correct_answer: correctAnswer,
        points: points || null, 
        category,
        tags,
      };
    },
  });

  if (formValues) {
    try {
      const response = await fetch("http://localhost:5000/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (response.ok) {
        
        Swal.fire({
          title: "สำเร็จ!",
          text: "เพิ่มคำถามเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
          },
        });
        fetchQuestionBank();
      } else {
        const errorData = await response.json();
        Swal.fire("ข้อผิดพลาด", errorData.error || "ไม่สามารถเพิ่มคำถามได้", "error");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      Swal.fire("ข้อผิดพลาด", "เกิดข้อผิดพลาดในการเพิ่มคำถาม", "error");
    }
  }
};

const handleEdit = async (id) => {
  const question = filteredQuestions.find((q) => q._id === id);

  const { value: formValues } = await Swal.fire({
    title: "แก้ไขคำถาม",
    html: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Question Name -->
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <label style="width: 100px;">คำถาม:</label>
          <input id="edit_question_text" class="swal2-input" value="${question.question_text}" placeholder="Edit Question Text" />
        </div>

        <!-- Options -->
        <div style="margin-bottom: 16px;">
          <label style="width: 100px;">ตัวเลือก:</label>
          <div id="options_container">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <label style="width: 100px;">ตัวเลือก 1:</label>
              <input id="edit_option_0" class="swal2-input" value="${question.options[0] || ""}" placeholder="Edit Option 1" />
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <label style="width: 100px;">ตัวเลือก 2:</label>
              <input id="edit_option_1" class="swal2-input" value="${question.options[1] || ""}" placeholder="Edit Option 2" />
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <label style="width: 100px;">ตัวเลือก 3:</label>
              <input id="edit_option_2" class="swal2-input" value="${question.options[2] || ""}" placeholder="Edit Option 3" />
            </div>
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <label style="width: 100px;">ตัวเลือก 4:</label>
              <input id="edit_option_3" class="swal2-input" value="${question.options[3] || ""}" placeholder="Edit Option 4" />
            </div>
          </div>
        </div>

        <!-- Correct Answer -->
        <div style="margin-bottom: 16px;">
          <label style="width: 100px;">คำตอบที่ถูกต้อง:</label>
          <input id="edit_correct_answer" class="swal2-input" value="${question.correct_answer}" placeholder="Edit Correct Answer" />
        </div>

        <!-- Points -->
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <label style="width: 100px;">คะแนน:</label>
          <input id="edit_points" class="swal2-input" value="${question.points || ""}" placeholder="Edit Points" type="number" />
        </div>

        <!-- Category -->
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <label style="width: 100px;">หมวดหมู่:</label>
          <input id="edit_category" class="swal2-input" value="${question.category}" placeholder="Edit Category" />
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Save Changes",
    customClass: {
      confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
      cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
    },
    preConfirm: () => {
      const questionText = document.getElementById("edit_question_text").value.trim();
      const options = [
        document.getElementById("edit_option_0").value.trim(),
        document.getElementById("edit_option_1").value.trim(),
        document.getElementById("edit_option_2").value.trim(),
        document.getElementById("edit_option_3").value.trim(),
      ];
      const correctAnswer = document.getElementById("edit_correct_answer").value.trim();
      const points = document.getElementById("edit_points").value.trim();
      const category = document.getElementById("edit_category").value.trim();

      if (!questionText || options.some((opt) => !opt) || !correctAnswer || !category) {
        Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน!");
        return null;
      }

      return {
        question_text: questionText,
        options,
        correct_answer: correctAnswer,
        points: points || null, 
        category,
      };
    },
  });

  if (formValues) {
    try {
      const response = await fetch(`http://localhost:5000/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formValues),
      });

      if (response.ok) {
        Swal.fire({
          title: "สำเร็จ!",
          text: "คำถามถูกแก้ไขเรียบร้อยแล้ว",
          icon: "success",
          confirmButtonText: "OK",
          customClass: {
            confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
          },
        });

       
        fetchQuestionBank();
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.error || "Failed to update question.", "error");
      }
    } catch (error) {
      console.error("Error updating question:", error);
      Swal.fire("Error", "An error occurred while updating the question.", "error");
    }
  }
};

const handleDelete = async (id) => {
  const confirmation = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
        customClass: {
            confirmButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
            cancelButton: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
        },
  });

  if (confirmation.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:5000/questions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
      
        Swal.fire({
                        title: "Deleted!",
                        text: "The question has been deleted.",
                        icon: "success",
                        confirmButtonText: "OK",
                        customClass: {
              confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
            },
                      });
        fetchQuestionBank(); 
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.error || "Failed to delete question.", "error");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      Swal.fire("Error", "An error occurred while deleting the question.", "error");
    }
  }
};


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    filterQuestions(e.target.value, categoryFilter);
  };

  const handleCategoryChange = (category) => {
  setCategoryFilter(category);

  const filtered = questionBank.filter((question) => {
    const matchesCategory = category === "All" || question.category === category;
    return matchesCategory;
  });

  setFilteredQuestions(filtered);
};

  const filterQuestions = (query, category) => {
    const filtered = questionBank.filter((question) => {
      const matchesQuery = question.question_text.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All" || question.category === category;
      return matchesQuery && matchesCategory;
    });
    setFilteredQuestions(filtered);
  };

  useEffect(() => {
    fetchQuestionBank();
  }, []);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-6">
      <Card>
        <CardHeader variant="gradient" color="gray" className="p-4">
          <Typography variant="h4" color="white">
            Question Bank
          </Typography>
        </CardHeader>

        <CardBody className="px-4 pt-0 pb-2">

  <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-6 px-4 mt-6">

  <div className="relative w-auto min-w-[250px]">
    <input
      type="text"
      placeholder="Search questions..."
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={searchQuery}
      onChange={handleSearchChange}
    />
  </div>


  <div className="relative w-auto min-w-[150px]">
    <Select
      value={categoryFilter}
      onChange={(value) => handleCategoryChange(value)}
      
    >
      {categories.map((category, index) => (
        <Option key={index} value={category}>
          {category}
        </Option>
      ))}
    </Select>
  </div>


  <button
    onClick={handleAddQuestion}
    className="text-white px-6 py-2 rounded hover:opacity-90"
    style={{ backgroundColor: "#382c4c" }}
  >
    <Typography variant="h7" color="white" className="font-thai font-bold">
      Add New Question
    </Typography>
  </button>
</div>


  <table className="w-full min-w-[320px] table-auto border-collapse">
    <thead className="bg-gray-100">
      <tr>
        <th className="border-b border-blue-gray-50 py-3 px-4 text-left">คำถาม</th>
        <th className="border-b border-blue-gray-50 py-3 px-4 text-left">ตัวเลือก</th>
        <th className="border-b border-blue-gray-50 py-3 px-4 text-left">คำตอบที่ถูกต้อง</th>
        <th className="border-b border-blue-gray-50 py-3 px-4 text-left">หมวดหมู่</th>
        <th className="border-b border-blue-gray-50 py-3 px-4 text-left"></th>
      </tr>
    </thead>
    <tbody>
  {filteredQuestions.length > 0 ? (
    filteredQuestions.map((question) => (
      <tr key={question._id} className="hover:bg-gray-100">
        <td className="py-2 px-4 border-b border-blue-gray-50">{question.question_text}</td>
        <td className="py-2 px-4 border-b border-blue-gray-50">
          <ul className="list-disc list-inside">
            {question.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </td>
        <td className="py-2 px-4 border-b border-blue-gray-50">{question.correct_answer}</td>
        <td className="py-2 px-4 border-b border-blue-gray-50">{question.category || "No Category"}</td>
        <td className="py-2 px-4 border-b border-blue-gray-50">
  <button
    onClick={() => handleEdit(question._id)}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
  >
    Edit
  </button>
  <button
    onClick={() => handleDelete(question._id)}
    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
  >
    Delete
  </button>
</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="text-center py-4">
        No questions available.
      </td>
    </tr>
  )}
</tbody>
  </table>
</CardBody>
      </Card>
    </div>
  );
}

export default AddQuestionsFromBank;