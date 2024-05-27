import { Link } from "react-router-dom";
import NavLinks from "../components/nav-links";

export default function SideNav() {
  return (
    <div className="flex h-screen flex-col w-1/4 bg-black">
      <Link className="flex h-20 items-center justify-center" to="/">
        <img
          className="w-24 h-18"
          src="/logo_bnc_dark.png"
          alt="logo"
        />
      </Link>
      <div className="flex flex-grow justify-start flex-col">
        <NavLinks />
      </div>
    </div>
  );
}
