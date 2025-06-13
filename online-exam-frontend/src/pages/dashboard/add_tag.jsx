import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";

export function AddTag() {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(""); 
  const [loading, setLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState(""); 


  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/categories"); 
      const data = await response.json();
      setCategories(data); 
      setLoading(false); 
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false); 
    }
  };


  const fetchTags = async (categoryName) => {
    if (!categoryName) {
      setTags([]); 
      return;
    }

    try {
      setLoading(true); 
      const response = await fetch(
        `http://localhost:5000/categories/tags?name=${categoryName}`
      ); 
      const data = await response.json();
      setTags(data.tags || []); 
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tags:", error);
      setLoading(false); 
    }
  };

 
  const handleAddTag = () => {
    if (!selectedCategory) {
      Swal.fire({
        title: "Error",
        text: "โปรดเลือก Category ก่อนเพิ่ม tags",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          confirmButton:
            "bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600", 
        },
      });
      return;
    }

    Swal.fire({
      title: "Add Tags",
      html: `
        <div>
          <label for="swal-input-tag-name" class="swal2-label">Tag Name</label>
          <input id="swal-input-tag-name" class="swal2-input" placeholder="ชื่อแท็ก..." />
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600", 
        cancelButton:
          "bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600", 
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const tagInput = document.getElementById("swal-input-tag-name").value;

        if (!tagInput) {
          Swal.showValidationMessage("Tag name is required");
          return false;
        }

        const tags = tagInput.split(",").map((tag) => tag.trim()); 

        fetch("http://localhost:5000/categories/add-tags", {
          method: "PATCH", 
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: selectedCategory, tags }), 
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((updatedCategory) => {
            Swal.fire({
              title: "Success",
              text: "Tags added successfully",
              icon: "success",
              confirmButtonText: "OK",
              customClass: {
                confirmButton:
                  "bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600", 
              },
            });
            fetchTags(selectedCategory); 
          })
          .catch((error) => {
            console.error("Error adding tags:", error);
            Swal.fire("Error", "Failed to add tags", "error");
          });
      }
    });
  };

  const handleEditTag = (oldTag) => {
    Swal.fire({
      title: "Edit Tag",
      input: "text",
      inputValue: oldTag,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600",
        cancelButton:
          "bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newTag = result.value;
  
        fetch("http://localhost:5000/categories/tags/edit", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: selectedCategory, 
            oldTag, 
            newTag, 
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(() => {
            Swal.fire({
              title: "Success",
              text: "Tag updated successfully",
              icon: "success",
              confirmButtonText: "OK",
              customClass: {
                confirmButton:
                  "bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600",
              },
            });
            fetchTags(selectedCategory); 
          })
          .catch((error) => {
            console.error("Error updating tag:", error);
            Swal.fire("Error", "Failed to update tag", "error");
          });
      }
    });
  };

  
  const handleDeleteTag = (tag) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete the tag "${tag}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "bg-red-500 text-white px-6 py-3 rounded hover:bg-red-600",
        cancelButton:
          "bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("http://localhost:5000/categories/tags/delete", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: selectedCategory, 
            tag, 
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then(() => {
            Swal.fire("Deleted!", "Tag has been deleted.", "success");
            fetchTags(selectedCategory); 
          })
          .catch((error) => {
            console.error("Error deleting tag:", error);
            Swal.fire("Error", "Failed to delete tag", "error");
          });
      }
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;
    setSelectedCategory(categoryName);
    fetchTags(categoryName); 
  };

  const filteredTags = tags.filter((tag) =>
    tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-4">
          <Typography variant="h3" color="white" className="font-thai">
            เพิ่มแท็ก
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <div className="flex items-center gap-x-4 mb-6 px-4">
           
            <div className="relative w-auto min-w-[250px]">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

          
            <div className="relative w-auto min-w-[250px]">
              <input
                type="text"
                placeholder="ค้นหาแท็ก..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            
            <button
              onClick={handleAddTag}
              className="text-white px-6 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: "#382c4c" }}
            >
              <Typography
                variant="h6"
                color="white"
                className="font-thai font-bold"
              >
                เพิ่มแท็ก
              </Typography>
            </button>
          </div>

          
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-black-400 font-thai"
                  >
                    ชื่อแท็ก
                  </Typography>
                </th>
                <th className="border-b border-blue-gray-50 py-3 px-4 text-left">
                  <Typography
                    variant="small"
                    className="text-[20px] font-bold uppercase text-blue-black-400 font-thai"
                  >
                    การกระทำ
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.map((tag, index) => (
                <tr key={index}>
                 
                  <td className="py-2 px-4 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold font-thai"
                    >
                      {tag}
                    </Typography>
                  </td>

                
                  <td className="py-2 px-4 border-b border-blue-gray-50">
                  
                    <button
                      onClick={() => handleEditTag(tag)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>

                   
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
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

export default AddTag;