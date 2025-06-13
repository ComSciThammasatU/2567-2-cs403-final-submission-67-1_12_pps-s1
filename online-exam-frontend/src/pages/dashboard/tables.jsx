import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./table.css";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";

export function Tables() {
  const [users, setUsers] = useState([]); 
  const [loading, setLoading] = useState(true); 

 
  const userRole = localStorage.getItem("userRole");


  const allowedRoles = ["Admin"]; 

 
  if (!allowedRoles.includes(userRole)) {
    return null; 
  }

 
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/user"); 
        const data = await response.json();
        setUsers(data); 
        setLoading(false); 
      } catch (error) {
        console.error("Error fetching users:", error);
        setLoading(false); 
      }
    };

    fetchUsers();
  }, []);


  const handleEdit = (userId) => {
    const userToEdit = users.find((user) => user._id === userId);

    if (!userToEdit) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not found.",
      });
      return;
    }

    Swal.fire({
      title: "แก้ไขข้อมูลผู้ใช้",
      html: `
        <div style="margin-left: 40px;">
          <label for="swal-input-firstname" class="swal2-label">ชื่อ</label>
          <input id="swal-input-firstname" class="swal2-input" placeholder="First Name" value="${userToEdit.first_name}">
        </div>
        <div>
          <label for="swal-input-lastname" class="swal2-label">นามสกุล</label>
          <input id="swal-input-lastname" class="swal2-input" placeholder="Last Name" value="${userToEdit.last_name}">
        </div>
        <div>
          <label for="swal-input-role" class="swal2-label" style="margin-left: -150px;">บทบาท</label>
          <select id="swal-input-role" class="swal2-input" style="margin-left: 70px;">
            <option value="Admin" ${userToEdit.role_name === "Admin" ? "selected" : ""}>Admin</option>
            <option value="Teacher" ${userToEdit.role_name === "Teacher" ? "selected" : ""}>Teacher</option>
            <option value="Student" ${userToEdit.role_name === "Student" ? "selected" : ""}>Student</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600",
        cancelButton: "custom-cancel-button",
      },
      preConfirm: () => {
        const firstName = document.getElementById("swal-input-firstname").value;
        const lastName = document.getElementById("swal-input-lastname").value;
        const roleName = document.getElementById("swal-input-role").value;

        if (!firstName || !lastName || !roleName) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        return { firstName, lastName, roleName };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { firstName, lastName, roleName } = result.value;

        fetch(`http://localhost:5000/user/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            role_name: roleName,
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((updatedUser) => {
            if (updatedUser.message === "User updated successfully") {
              setUsers((prevUsers) =>
                prevUsers.map((user) =>
                  user._id === userId
                    ? {
                        ...user,
                        first_name: firstName,
                        last_name: lastName,
                        role_name: roleName,
                      }
                    : user
                )
              );

              Swal.fire({
                title: "Success",
                text: "User updated successfully",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "custom-confirm-button",
                },
              });
            } else {
              Swal.fire("Error", updatedUser.message, "error");
            }
          })
          .catch((error) => {
            console.error("Error updating user:", error);
            Swal.fire("Error", "Failed to update user", "error");
          });
      }
    });
  };
  const handleDelete = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600",
        cancelButton: "bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/user/${userId}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            if (data.message === "User deleted successfully") {
              setUsers((prevUsers) =>
                prevUsers.filter((user) => user._id !== userId)
              );
  
              Swal.fire({
                title: "Deleted!",
                text: "The user has been deleted.",
                icon: "success",
                confirmButtonText: "OK",
                customClass: {
                  confirmButton: "custom-confirm-button",
                },
              });
            } else {
              Swal.fire("Error", data.message, "error");
            }
          })
          .catch((error) => {
            console.error("Error deleting user:", error);
            Swal.fire("Error", "Failed to delete user", "error");
          });
      }
    });
  };

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-4">
          <Typography variant="h3" color="white" className="font-thai">
            จัดการข้อมูลผู้ใช้
          </Typography>
        </CardHeader>
        <CardBody className="px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["ชื่อ-นามสกุล", "ชื่อผู้ใช้", "บทบาท"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[25px] font-bold uppercase text-blue-black-400 font-thai"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(({ _id, first_name, last_name, username, role_name }) => (
                <tr key={_id}>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold font-thai"
                    >
                      {first_name} {last_name}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold font-thai"
                    >
                      {username}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold font-thai"
                    >
                      {role_name}
                    </Typography>
                  </td>
                  <td className="py-3 px-5 border-b border-blue-gray-50">
                    <button
                      onClick={() => handleEdit(_id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(_id)}
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

export default Tables;