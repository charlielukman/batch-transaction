import {
  HomeIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from 'react';


export default function NavLinks() {
  const location = useLocation();

  const [links, setLinks] = useState([
    {
      name: "Home",
      href: "/admin",
      icon: HomeIcon,
    },
    {
      name: "Create Transaction",
      href: "/admin/create-transaction",
      icon: DocumentCheckIcon,
    },
    {
      name: "Transaction List",
      href: "/admin/transactions",
      icon: DocumentTextIcon,
    },
  ]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      if (parsedUser.role === "Approver") {
        setLinks([
          {
            name: "Home",
            href: "/admin",
            icon: HomeIcon,
          },
          {
            name: "Transaction List",
            href: "/admin/transactions",
            icon: DocumentTextIcon,
          },
        ]);
      }
    }
  }, []);

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        const isActive = location.pathname === link.href;
        return (
          <Link
            key={link.name}
            to={link.href}
            className={
              `flex grow items-center justify-center text-gray-50 p-5 text-sm font-medium hover:bg-gray-50 hover:text-yellow-500 md:flex-none md:justify-start md:p-3 md:px-5 
              ${isActive ? 'bg-yellow-500' : ''}`
            }
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
