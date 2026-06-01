import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function HashEntryPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const pathname = window.location.pathname;

    if (pathname.startsWith("/user")) {
      return;
    }

    const encodedHash = pathname.slice(1);

    try {
      const hash = decodeURIComponent(encodedHash);

      // save temporarily
      sessionStorage.setItem("hash", hash);

      navigate("/user/revenues", {
        replace: true,
      });
    } catch {
      navigate("/access-denied", {
        replace: true,
      });
    }
  }, []);

  return <div>Loading...</div>;
}
