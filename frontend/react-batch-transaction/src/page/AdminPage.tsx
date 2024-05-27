import {useState, useEffect} from "react";
import SideNav from "../components/sidenav";
import Logout from "../components/logout";
import TransactionTable from "../components/transaction-table";
import { useAuth } from "../hooks/useAuth";
import { format } from "date-fns";

type Summary = {
  total_waiting_approval: number;
  total_approved: number;
  total_rejected: number;
};


export default function AdminPage() {
  const auth = useAuth();
  const {userId, lastLoginAt, token } = auth?.user || {};
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reloadSummary, setReloadSummary] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/transactions/summary', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setSummary(data);
      } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
      }
    };
  
    fetchSummary();
  }, [token, reloadSummary]);

  return (
    <main className="flex h-full">
      <SideNav />
      <div className="flex flex-col h-screen">
        <div className="flex justify-end bg-gray-50 text-sm">
          <div className="py-2 px-4">UserID: {userId}</div>
          <div className="bg-gray-50 text-blue-500 font-bold py-2 px-4">
            <Logout />
          </div>
        </div>
        <div className="flex h-1/10 p-4 mx-4 items-center rounded-md bg-white text-sm">
          <div>Last Login Time: {format(new Date(lastLoginAt ?? ''), 'dd MMM yyyy hh:mm:ss')}</div>
        </div>
        <div className="flex h-screen flex-col flex-grow m-4 text-sm">
          <h1 className="mx-1 text-1xl">Transaction Overview</h1>
          <div className="flex flex-row justify-between my-4">
            <div className="border border-gray-200 bg-gray-50 p-5 w-1/3 mx-1 rounded-md shadow-lg">
              <h2 className="text-gray-300">Awaiting Approval</h2>
              <span className="text-6xl text-yellow-300">{summary?.total_waiting_approval}</span>
            </div>
            <div className="border border-gray-200 bg-gray-50 p-5 w-1/3 mx-1 rounded-md shadow-lg">
              <h2 className="text-gray-300">Successfully</h2>
              <span className="text-6xl text-green-300">{summary?.total_approved}</span>
            </div>
            <div className="border border-gray-200 bg-gray-50 p-5 w-1/3 mx-1 rounded-md shadow-lg">
              <h2 className="text-gray-300">Rejected</h2>
              <span className="text-6xl text-red-300">{summary?.total_rejected}</span>
            </div>
          </div>

          {/* table */}
          <TransactionTable onReload={() => setReloadSummary(!reloadSummary)}/>
        </div>
      </div>
    </main>
  );
}
