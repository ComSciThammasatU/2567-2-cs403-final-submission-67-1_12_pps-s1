import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";

export function SignUp() {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    const first_name = event.target.first_name.value;
    const last_name = event.target.last_name.value;
    const username = event.target.username.value;
    const password = event.target.password.value;
    const confirm_password = event.target.confirm_password.value;
  
   
    if (!first_name || !last_name || !username || !password || !confirm_password) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด", 
        text: "กรุณากรอกข้อมูลให้ครบถ้วน", 
        customClass: {
          confirmButton: "custom-confirm-button", 
        },
      });
      return;
    }
  
    if (password !== confirm_password) {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด", 
        text: "รหัสผ่านไม่ตรงกัน", 
        customClass: {
          confirmButton: "custom-confirm-button", 
        },
      });
      return;
    }
  
    try {
    
      const checkResponse = await fetch(`http://localhost:5000/user/check-username?username=${username}`);
      const checkData = await checkResponse.json();
  
      if (checkResponse.ok && checkData.exists) {
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด", 
          text: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว", 
          customClass: {
            confirmButton: "custom-confirm-button", 
          },
        });
        return;
      }
  
      
      const response = await fetch("http://localhost:5000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          username,
          password,
          confirm_password,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
      
        Swal.fire({
          icon: "error",
          title: "ข้อผิดพลาด", 
          text: data.message || "เกิดข้อผิดพลาด", 
          customClass: {
            confirmButton: "custom-confirm-button", 
          },
        });
      } else {
    
        Swal.fire({
          icon: "success",
          title: "สำเร็จ", 
          text: "สมัครสมาชิกสำเร็จ!", 
          customClass: {
            confirmButton: "custom-confirm-button", 
          },
        });
      }
    } catch (error) {
      
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด", 
        text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์", 
        customClass: {
          confirmButton: "custom-confirm-button", 
        },
      });
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#302c4c]">
      <div className="w-full lg:w-2/5 flex flex-col items-center justify-center">
        <form
          className="mt-2 mb-2 mx-auto w-full max-w-md bg-white p-8 rounded-lg shadow-lg"
          onSubmit={handleSubmit}
        >
          
          <div className="text-center mb-6">
            <Typography
              variant="h2"
              className="font-bold text-[#302c4c] text-2xl font-thai"
            >
              สมัครสมาชิก
            </Typography>
          </div>
          <div className="mb-1 flex flex-col gap-6">
          <Input
              name="username"
              size="lg"
              placeholder="รหัสผู้ใช้งาน"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 font-thai"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            
            <Input
              name="first_name"
              size="lg"
              placeholder="ชื่อ"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 font-thai"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Input
              name="last_name"
              size="lg"
              placeholder="นามสกุล"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 font-thai"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            
            <Input
              name="password"
              size="lg"
              type="password"
              placeholder="รหัสผ่าน"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 font-thai"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Input
              name="confirm_password"
              size="lg"
              type="password"
              placeholder="ยืนยันรหัสผ่าน"
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 font-thai"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>

          <Button
            className="mt-6 bg-[#302c4c] hover:bg-[#1f1a33] text-white text-lg py-3 font-thai"
            fullWidth
            type="submit"
          >
            สมัครสมาชิก
          </Button>

          
          {successMessage && (
            <Typography
              variant="small"
              className="text-green-500 text-center mt-4 font-thai"
            >
              {successMessage}
            </Typography>
          )}

          
          <div className="mt-4 text-center">
            <Typography
              variant="small"
              className="text-blue-gray-600 font-thai"
            >
              มีบัญชีอยู่แล้ว?{" "}
              <Link
                to="/auth/sign-in"
                className="text-[#302c4c] font-medium hover:underline"
              >
                เข้าสู่ระบบ
              </Link>
            </Typography>
          </div>
        </form>
      </div>
    </section>
  );
}

export default SignUp;