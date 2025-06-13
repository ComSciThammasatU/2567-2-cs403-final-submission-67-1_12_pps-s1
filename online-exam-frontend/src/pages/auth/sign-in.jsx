import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import "./sign-in.css";




export function SignIn() {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
  event.preventDefault();

  const username = event.target.username.value;
  const password = event.target.password.value;

  if (!username || !password) {
    Swal.fire({
      icon: "error",
      title: "ข้อมูลไม่ครบถ้วน",
      text: "กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน", 
      confirmButtonText: "ตกลง", 
      customClass: {
        confirmButton: "custom-confirm-button",
      },
      buttonsStyling: false,
    });
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบล้มเหลว", 
        text: data.message || "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง", 
        confirmButtonText: "ตกลง", 
        customClass: {
          confirmButton: "custom-confirm-button",
        },
        buttonsStyling: false,
      });
    } else {
      
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userRole", data.role); 
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userId", data.user._id); 
    
      
      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ!", 
        html: `<p>ยินดีต้อนรับสู่ระบบ</p><p>บทบาทของคุณคือ: <strong>${data.role}</strong></p>`, 
        confirmButtonText: "ตกลง", 
        customClass: {
          confirmButton: "custom-confirm-button",
        },
        buttonsStyling: false,
      }).then(() => {
       
        window.location.href = "/dashboard";
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด", 
      text: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์", 
      confirmButtonText: "ตกลง", 
      customClass: {
        confirmButton: "custom-confirm-button",
      },
      buttonsStyling: false,
    });
  }
};
  return (
    <section
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#302c4c" }}
    >
      <div className="w-full lg:w-3/5 mt-24">
        <div className="border border-gray-300 rounded-lg p-8 shadow-lg bg-white mx-auto w-80 max-w-screen-lg lg:w-1/2">
          <div className="text-center">
            <Typography variant="h2" className="font-bold text-[#302c4c] text-2xl font-thai">
              เข้าสู่ระบบ
            </Typography>
          </div>

          <form className="mt-5 mb-2" onSubmit={handleSubmit}>
            <div className="mb-1 flex flex-col gap-6">
              <Typography
                variant="small"
                color="blue-gray"
                className="-mb-3 text-xl font-bold font-thai"
              >
                รหัสผู้ใช้งาน
              </Typography>
              <Input
                name="username"
                size="lg"
                placeholder="รหัสผู้ใช้งาน"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <Typography
                variant="small"
                color="blue-gray"
                className="-mb-3 text-xl font-bold font-thai"
              >
                รหัสผ่าน
              </Typography>
              <Input
                name="password"
                type="password"
                size="lg"
                placeholder="********"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>

            <Button
              className="mt-6 bg-[#302c4c] hover:bg-[#1f1a33] text-xl text-white font-thai"
              fullWidth
              type="submit"
            >
              เข้าสู่ระบบ
            </Button>

            {errorMessage && (
              <Typography
                variant="small"
                className="text-red-500 text-center mt-4 font-thai"
              >
                {errorMessage}
              </Typography>
            )}

            <div className="flex items-center justify-center gap-2 mt-4">
              <Typography
                variant="small"
                className="font-medium text-gray-900 font-thai"
              >
                <Link to="/auth/sign-up">สมัครสมาชิก</Link>
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;