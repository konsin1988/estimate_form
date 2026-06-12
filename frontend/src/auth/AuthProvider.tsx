import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useParams } from "react-router-dom";
import api from "../api/axios";
import { buildFrcList } from "../scripts/buildFrcList";

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

        if (res_frc.data[0].frc === "admin") {
          const frc_all = await api.get(`/frc/list/`);
          console.log(frc_all)
          if (
            frc_all.status !== 200 ||
            frc_all.data.length === 0
          ) {
            setIsAuthorized(false);
            return;
          }
          const { revenueFrc, costFrc, isDup } = buildFrcList(frc_all.data);
          setRevenueFrc(revenueFrc);
          setCostsFrc(costFrc);
          setIsDup(true);
          setIsAdmin(true);
        } else {
          const { revenueFrc, costFrc, isDup }= buildFrcList(res_frc.data);
          setRevenueFrc(revenueFrc);
          setCostsFrc(costFrc);
          setIsDup(isDup);
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
