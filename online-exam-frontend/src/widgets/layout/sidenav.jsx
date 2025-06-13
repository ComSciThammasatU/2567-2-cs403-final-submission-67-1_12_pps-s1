import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

import {
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Retrieve user information from localStorage
  const userName = localStorage.getItem("userName") || "Guest"; // Default to "Guest" if not found
  const userRole = localStorage.getItem("userRole") || "Unknown Role"; // Default to "Unknown Role" if not found

  // Filter routes dynamically based on the user's role
  const filteredRoutes = routes.map((route) => ({
    ...route,
    pages: route.pages.filter((page) => page.roles.includes(userRole)), // Only include pages the user can access
  }));

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div className="relative">
        {/* Display User Name and Role */}
        <div className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="font-thai font-bold"
          >
            {userName}
          </Typography>
          <Typography
            variant="small"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="font-thai"
          >
            {userRole}
          </Typography>
        </div>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {filteredRoutes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                      }
                      className="flex items-center gap-4 px-4 capitalize"
                      fullWidth
                    >
                      {icon}
                      <Typography
                        color="inherit"
                        className="font-thai font-bold leading-none whitespace-nowrap text-lg"
                      >
                        {name}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <Button
          variant="gradient"
          color="red"
          className="flex items-center justify-center gap-2 px-8 py-2 capitalize text-center w-auto"
          onClick={() => {
            Swal.fire({
              title: "คุณแน่ใจหรือไม่?",
              text: "คุณต้องการออกจากระบบหรือไม่?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonColor: "#d33",
              cancelButtonColor: "#3085d6",
              confirmButtonText: "ใช่, ออกจากระบบ",
              cancelButtonText: "ยกเลิก",
            }).then((result) => {
              if (result.isConfirmed) {
                // Clear the auth token and navigate to the login page
                localStorage.removeItem("authToken");
                localStorage.removeItem("userName");
                localStorage.removeItem("userRole");
                window.location.href = "/sign-in"; // Redirect to the login page
              }
            });
          }}
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          <Typography
            color="inherit"
            className="font-thai font-bold leading-none whitespace-nowrap text-lg"
          >
            ออกจากระบบ
          </Typography>
        </Button>
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandName: "Online Exam System",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;