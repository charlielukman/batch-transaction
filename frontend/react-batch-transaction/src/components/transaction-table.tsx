import { useEffect, useState, useCallback } from "react";
import TransactionOperation from "./transaction-operation";
import { format } from 'date-fns';
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

type Transaction = {
    ID: string;
    TotalAmount: number;
    TotalRecord: number;
    FromAccount: string;
    Maker: string;
    TransferDate: string;
    TransactionStatus: string;
    CreatedAt: string;
  };

type TransactionTableProps = {
    onReload: () => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({onReload}) => {
    const auth = useAuth();
    const { role, token } = auth?.user || {};
    const [reload, setReload] = useState(false);
    
    const [data, setData] = useState<Transaction[] | null>(null);


    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const onTransactionUpdate = useCallback(() => {
        setReload(!reload);
        onReload();
      }, [reload, onReload]);
      
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                let url = `${API_URL}/api/transactions?page=${currentPage}&per_page=${itemsPerPage}`;
                
                url += role === 'Approver' ? '&status=waiting_approval' : '';         
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();

                const transactions = data.data.map((item: any) => ({
                    ID: item.id,
                    TotalAmount: item.total_amount,
                    TotalRecord: item.total_record,
                    FromAccount: item.from_account,
                    Maker: item.maker,
                    TransferDate: item.transfer_date,
                    TransactionStatus: item.transaction_status,
                    CreatedAt: item.created_at,
                }));

                setData(transactions);
                setTotalPages(data.pagination.total_pages);
            } catch (error) {
                console.error('There has been a problem with your fetch operation:', error);
            }
        };
        
        fetchTransactions();
    }, [role, token, reload, currentPage, itemsPerPage]);
    return (
        <>
        <div className="flex flex-col flex-grow overflow-hidden">
            <div className="overflow-auto flex-grow">
                <table className="w-full divide-y">
                    <thead>
                    <tr className="space-x-4 space-y-2">
                        <th className="tracking-wider">Reference No</th>
                        <th className="tracking-wider">Total Transfer Amount</th>
                        <th className="tracking-wider">Total Transfer Record</th>
                        <th className="tracking-wider">From Account No.</th>
                        <th className="tracking-wider">Maker</th>
                        <th className="tracking-wider">Transfer Date</th>
                        <th className="tracking-wider sticky-col">Operation</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data && data.map((item, index) => (
                            <tr key={index} onClick={(event) => {event.stopPropagation()}}>
                            <td className="border px-4 py-2 h-10 whitespace-nowrap">{item.ID}</td>
                            <td className="border px-4 py-2 h-10 whitespace-nowrap">{item.TotalAmount}</td>
                            <td className="border px-4 py-2 h-10 whitespace-nowrap">{item.TotalRecord}</td>
                            <td className="border px-4 py-2 h-10 whitespace-nowrap">{item.FromAccount}</td>
                            <td className="border px-4 py-2 h-10 whitespace-nowrap">{item.Maker}</td>
                            <td className="border px-4 py-2 h-10 whitespace-nowrap">{format(new Date(item.TransferDate), 'dd MMM yyyy')}</td>
                            <td className="flex border px-4 py-2 h-10 whitespace-nowrap sticky-col">
                                <TransactionOperation item={item} onTransactionUpdate={onTransactionUpdate} />
                            </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="flex justify-between">
            <div className="flex">
                <button
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className="mt-5 px-4 py-2 border rounded bg-yellow-500 text-white"
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button key={pageNumber} 
                        className={`mt-5 px-4 py-2 border rounded ${currentPage === pageNumber ? 'bg-yellow-500 text-white' : 'bg-white text-black'}`}
                        onClick={() => handlePageChange(pageNumber)}
                    >
                        {pageNumber}
                    </button>
                ))}
                <button
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className="mt-5 px-4 py-2 border rounded bg-yellow-500 text-white"
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>            
            </div>
            <div className="mt-5 py-2">
                <label htmlFor="itemsPerPage">Items per page:</label>
                <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border rounded px-2"
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                </select>
            </div>
        </div>
        </>
    )
}

export default TransactionTable;