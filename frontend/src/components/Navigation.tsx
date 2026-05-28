import { NavLink, useParams } from "react-router-dom";

export default function Navigation() {
    const { hash } = useParams();
    const navClass = ({ isActive }) =>
      `
      min-w-[140px]
      h-9
      rounded
      flex
      items-center
      justify-center
      text-[#ba9477]
      transition-colors
      ${isActive
          ? "bg-[#ba9477] text-white font-bold"
          : "bg-[#717178] hover:bg-[#8a8a92] active:bg-white"
      }
    `;

    return (
        <nav className="flex gap-4 bg-tranparant shadow">
            <NavLink 
              to={`/${hash}/revenues`}
              className={navClass}
            >
              Выручка 
            </NavLink>

            <NavLink 
              to={`/${hash}/costs`} 
              className={navClass}
            >
              Затраты 
            </NavLink> 

            <NavLink 
              to={`/${hash}/dup`} 
              className={navClass}
            >
              ДУП 
            </NavLink> 

            <a
                href="https://skid.rtt.digital"
                rel="noopener noreferrer"
                className={`min-w-[140px] h-9 rounded flex items-center 
                          justify-center text-[#ba9477] transition-colors 
                          bg-[#717178] hover:bg-[#8a8a92]`}
            >
               Выйти 
            </a>

        </nav>
    );
}
