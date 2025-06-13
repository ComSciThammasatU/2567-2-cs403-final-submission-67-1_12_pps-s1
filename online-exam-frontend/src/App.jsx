import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import SignIn from "@/pages/auth/sign-in"; // Default import
import SignUp from "@/pages/auth/sign-up"; // Import SignUp page
import DoExam from "@/pages/dashboard/doExam";
import DoQuestion from "@/pages/dashboard/doQuestion";
// Function to check if the user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("authToken");
  console.log("Auth Token:", token); // Debugging: Check if the token exists
  return !!token;
};

function App() {
  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated() ? <Dashboard /> : <Navigate to="/auth/sign-in" replace />
        }
      />
      <Route path="/auth/sign-in" element={<SignIn />} />
      <Route path="/auth/sign-up" element={<SignUp />} />
      <Route path="/doExam" element={<DoExam />} />
      <Route path="/do-question" element={<DoQuestion />} />
      <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
    </Routes>
  );
}

export default App;