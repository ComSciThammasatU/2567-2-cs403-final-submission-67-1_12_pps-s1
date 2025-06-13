import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import Logout from "@/pages/dashboard/logout";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { AddCategory } from "@/pages/dashboard/add_category";
import { AddTag } from "@/pages/dashboard/add_tag";
import AddExam from "./pages/dashboard/add_exam";
import DoExam from "@/pages/dashboard/doExam";
import ExamResults from "@/pages/dashboard/examResults";
import AddQuestion from "@/pages/dashboard/add_question";
import DoQuestion from "@/pages/dashboard/doQuestion";
const userRole = localStorage.getItem("userRole");
import TeacherResults from "@/pages/dashboard/TeacherResults"; 
import AddQuestionsFromBank from "@/pages/dashboard/AddQuestionsFromBank";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      
      {
        icon: <RectangleStackIcon {...icon} />, 
        name: "ทำข้อสอบ", 
        path: "/doExam",
        element: <DoExam />,
        roles: ["Student"], 
        
      },

      

      {
        icon: <TableCellsIcon {...icon} />,
        name: "ผลการสอบ", 
        path: "/exam-results",
        element: <ExamResults />,
        roles: ["Student"], 
      },

      {
        icon: <RectangleStackIcon {...icon} />,
        name: "จัดการชุดข้อสอบ", 
        path: "/add_exam",
        element: <AddExam />, 
        roles: ["Teacher"],
      },

      {
        icon: <TableCellsIcon {...icon} />,
        name: "เพิ่มคำถาม",
        path: "/add_question/:examId", 
        element: <AddQuestion />,
        roles: ["Teacher"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "ดูสถิติ", 
        path: "/teacher-results", 
        element: <TeacherResults />, 
        roles: ["Teacher"], 
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "จัดการข้อมูลผู้ใช้",
        path: "/tables",
        element: <Tables />,
        roles: ["Admin"],
      },

      {
        icon: <TableCellsIcon {...icon} />,
        name: "เพิ่มคำถามจากคลัง", 
        path: "/add-questions-from-bank", 
        element: <AddQuestionsFromBank />, 
        roles: ["Admin"], 
      },
    ],
  },
  
];

export default routes;
