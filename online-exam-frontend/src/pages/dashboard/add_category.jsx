import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";

export function AddCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [searchQuery, setSearchQuery] = useState(""); 

  
  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:5000/categories"); 
      const data = await response.json();
      console.log("Fetched Categories:", data); 
      setCategories(data); 
      setLoading(false); 
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false); 
    }
  };

  const handleEditCategory = (id) => {
    const currentCategory = categories.find((category) => category._id === id);

    Swal.fire({
      title: "Edit Category",
      input: "text",
      inputLabel: "Category Name",
      inputValue: currentCategory?.name || "",
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600", 
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",   
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedName = result.value;
    
        fetch(`http://localhost:5000/categories/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: updatedName }),
        })
          .then((response) => response.json())
          .then(() => {
            fetchCategories(); 
            Swal.fire({
              title: "Success",
              text: "Category added successfully",
              icon: "success",
              confirmButtonText: "OK",
              customClass: {
                confirmButton: "bg-blue-500 text-white px-6 py-3 text-lg rounded hover:bg-blue-600 w-321", 
              },
            });
          })
          .catch((error) => {
            console.error("Error updating category:", error);
            Swal.fire("Error", "Failed to update category", "error");
          });
      }
    });
  };

  const handleDeleteCategory = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600", 
        cancelButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",   
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/categories/${id}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then(() => {
            fetchCategories(); 
            Swal.fire({
              title: "Deleted!",
              text: "Category has been deleted.",
              icon: "success",
              confirmButtonText: "OK",
              customClass: {
                confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600", 
              },
            });
          })
          .catch((error) => {
            console.error("Error deleting category:", error);
            Swal.fire("Error", "Failed to delete category", "error");
          });
      }
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
          .then((newCategory) => {
            console.log("API Response:", newCategory);
            if (newCategory.message === "Category created successfully") {
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
              Swal.fire("Error", newCategory.message, "error");
            }
          })
          .catch((error) => {
            console.error("Error adding category:", error);
            Swal.fire("Error", "Failed to add category", "error");
          });
      }
    });
  };

  
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-4">
          <Typography variant="h3" color="white" className="font-thai">
            เพิ่มประเภทคำถาม
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <div className="flex items-center gap-x-4 mb-6 px-4">
   
            <div className="relative w-auto min-w-[250px]">
              <input
                type="text"
                placeholder="ค้นหาประเภทคำถาม..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

     
            <button
              onClick={handleAddCategory}
              className="text-white px-6 py-2 rounded hover:opacity-90"
              style={{ backgroundColor: "#382c4c" }}
            >
              <Typography variant="h7" color="white" className="font-thai font-bold">
                เพิ่มประเภทคำถาม
              </Typography>
            </button>
          </div>

 
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
              
                <th className="border-b border-blue-gray-50 py-3 px-10 text-left">
                  <Typography
                    variant="small"
                    className="text-[25px] font-bold uppercase text-blue-black-400 font-thai"
                  >
                    ชื่อประเภท
                  </Typography>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(({ _id, name }) => {
                const className = `py-3 px-10 border-b border-blue-gray-50`;

                return (
                  <tr key={_id}>
                 
                    <td className={className}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-semibold font-thai"
                      >
                        {name}
                      </Typography>
                    </td>

                   
                    <td className="py-3 px-10 border-b border-blue-gray-50 flex gap-2">
                    
                      <button
                        onClick={() => handleEditCategory(_id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Edit
                      </button>

                    
                      <button
                        onClick={() => handleDeleteCategory(_id)}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default AddCategory;