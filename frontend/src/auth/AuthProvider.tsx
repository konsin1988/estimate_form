import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";
import api from "../services/api";

type AuthContextType = {
  loading: boolean;
  isAuthorized: boolean;
  user: string | null;
  login: string | null;
  revenueFrc: string[];
  costsFrc: string[];
  isDup: boolean;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({
  loading: true,
  isAuthorized: false,
  user: null,
  login: null,
  revenueFrc: [],
  costsFrc: [],
  isDup: false,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hash = sessionStorage.getItem("hash");

  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [user, setUser] = useState<string | null>(null);
  const [login, setLogin] = useState<string | null>(null);

  const [revenueFrc, setRevenueFrc] = useState<string[]>([]);
  const [costsFrc, setCostsFrc] = useState<string[]>([]);
  const [isDup, setIsDup] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!hash) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res_frc = await api.get(
          `/frc/by_user?user=${encodeURIComponent(hash)}`
        );

        if (
          res_frc.status !== 200 ||
          res_frc.data.length === 0
        ) {
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);

        setUser(res_frc.data[0].user);
        setLogin(res_frc.data[0].login);

        const res_list = await api.get(`/frc/list/`);

        if (res_list.status === 200) {
          if (res_frc.data[0].frc === "admin") {
            setIsAdmin(true);
            setRevenueFrc(res_list.data);
            setCostsFrc(res_list.data);
            setIsDup(true);
          } else {
            const revenue_frc_list = res_frc.data
              .filter(
                (item: any) =>
                  item.is_revenue === 1 &&
                  res_list.data.includes(item.frc)
              )
              .map((item: any) => item.frc);
            setRevenueFrc(revenue_frc_list);

            const cost_frc_list = res_frc.data
              .filter(
                (item: any) =>
                  item.is_cost === 1 &&
                  res_list.data.includes(item.frc)
              )
              .map((item: any) => item.frc);
            setCostsFrc(cost_frc_list);
            setIsDup(res_frc.data[0].is_dup === 1);
          }
        }
      } catch (e) {
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [hash]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        isAuthorized,
        user,
        login,
        revenueFrc,
        costsFrc,
        isDup,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
