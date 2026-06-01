import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function Navigation() {
    const { revenueFrc, costsFrc, isDup } = useAuth();
    const navClass = ({ isActive }) =>
      `
      min-w-[140px]
      h-9
      rounded-lg
      flex
      items-center
      justify-center
      text-[#ba9477]
      transition-colors
      ${isActive
          ? "bg-[#ba9477] text-white font-bold hover:bg-[#a18775] active:bg-white"
          : "bg-[#717178] hover:bg-[#8a8a92] active:bg-white"
      }
    `;

    return (
        <nav className="flex gap-4 bg-tranparant shadow">
          { (revenueFrc?.length > 0) && <NavLink 
              to={`/user/revenues`}
              className={navClass}
            >
              Выручка 
            </NavLink> }

            { (costsFrc?.length) > 0 && <NavLink 
              to={`/user/costs`} 
              className={navClass}
            >
              Затраты 
            </NavLink> } 

            {isDup && <NavLink 
              to={`/user/dup`} 
              className={navClass}
            >
              ДУП 
            </NavLink>} 

            <a
                href="https://skid.rtt.digital"
                rel="noopener noreferrer"
                className={`min-w-[140px] h-9 rounded-lg flex items-center 
                          justify-center text-[#ba9477] transition-colors 
                          bg-[#717178] hover:bg-[#8a8a92]`}
            >
               Выйти 
            </a>

        </nav>
    );
}
