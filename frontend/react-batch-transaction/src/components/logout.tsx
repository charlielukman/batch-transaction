import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();
    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
      };
    return (
        <button onClick={handleLogout}>Logout</button>
    );
}