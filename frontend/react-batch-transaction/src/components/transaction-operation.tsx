
import {
    CheckCircleIcon,
    EyeIcon,
    XCircleIcon,
  } from "@heroicons/react/24/outline";
import { useAuth } from "../hooks/useAuth";
import { useState, useCallback } from 'react';
import React from "react";
import { format } from "date-fns";


type Transaction = {
    ID: string;
    TotalAmount: number;
    TotalRecord: number;
    FromAccount: string;
    Maker: string;
    TransferDate: string;
    BankDest: string;
    AccountIDDest: string;
    AccountNameDest: string;
    Amount: number;
    TransactionStatus: string;
    CreatedAt: string;
};

type TransactionOperationProps = {
    item: Transaction;
    onTransactionUpdate: () => void;
}


type TransactionDetail = {
    id: string;
    transaction_id: string;
    bank_dest: string;
    account_id_dest: string;
    account_name_dest: string;
    amount: number;
    description: string | null;
    transfer_date: string;
  };

const TransactionOperation: React.FC<TransactionOperationProps> = React.memo(({item, onTransactionUpdate}) => {
    const auth = useAuth();
    const {role, token} = auth?.user || {role: '', token: ''};
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [transactionDetail, setTransactionDetail] = useState<TransactionDetail[]>([]);

    const handleApprove = useCallback(async () => {
        const confirmed = window.confirm('Are you sure you want to approve this transaction?');
        if (confirmed) {
          try {
            const response = await fetch(`http://localhost:1323/api/transactions/${referenceNo}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: 'approved' }),
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            onTransactionUpdate();
          } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
          }
        }
    }, [token, onTransactionUpdate]);

    const handleReject = useCallback(async () => {
        const confirmed = window.confirm('Are you sure you want to reject this transaction?');
        if (confirmed) {
          try {
            const response = await fetch(`http://localhost:1323/api/transactions/${referenceNo}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status: 'rejected' }),
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            onTransactionUpdate();
          } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
          }
        }
    }, [token, onTransactionUpdate]);
    
  
    const fetchDetails = useCallback(async (referenceNo: string) => {
        try {
            const response = await fetch(`http://localhost:1323/api/transactions/${referenceNo}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    },[token]);

    const handleDetail = useCallback(async () => {        
        setIsModalVisible(true);
        const data = await fetchDetails(item.ID);
        const details = Array.isArray(data.data) ? data.data : [];
        setTransactionDetail(details);
    }, [item, fetchDetails]);

    const closeModal = useCallback(() => {
        setIsModalVisible(false);
    }, []);

    const renderModal = () => {
        if (!isModalVisible) {
          return null;
        }
        return (
          <div className="fixed z-10 inset-0 overflow-y-auto w-full h-full" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl w-full">
              <div className="bg-gray-50 sm:flex sm:flex-row-reverse">
                    <button type="button" className="mt-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={closeModal}>
                        Close
                    </button>
                </div>
              <div className="flex bg-gray-50 rounded-md px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex-grow font-medium">
                    <p>From Account: {item.FromAccount}</p>
                    <p>Submit Date and Time: {format(new Date(item.CreatedAt), 'dd MMM yyyy hh:mm:ss')}</p>
                    <p>Transfer Date: {format(new Date(item.TransferDate), 'dd MMM yyyy')}</p>
                    <p>Instruction Type: Immediate</p>
                </div>
                <div className="flex-grow font-medium">
                    <p>Maker: {item.Maker}</p>
                    <p>Reference No: {item.ID}</p>
                    <p>Transfer Type: Online</p>
                </div>
              </div>
              <div className="flex-grow bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <p>Total Transfer Record: {item.TotalRecord}</p>
                <p>Total Amount: {item.TotalAmount}</p>
                <p>Estimated Service Fee: 0</p>
              </div>
              <div className="flex-grow bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <table>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>To Account No</th>
                            <th>To Account Name</th>
                            <th>To Account Bank</th>
                            <th>Transfer Amount</th>
                            <th>Description</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                    {transactionDetail && transactionDetail.map((detail, index) => (
                        <tr key={detail.id}>
                        <td>{index + 1}</td>
                        <td>{detail.account_id_dest}</td>
                        <td>{detail.account_name_dest}</td>
                        <td>{detail.bank_dest}</td>
                        <td>{detail.amount}</td>
                        <td>{detail.description || 'N/A'}</td>
                        <td>{item.TransactionStatus}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
              </div>
              </div>
            </div>
          </div>
        );
      };
    return (
        <>
            {role === 'Approver' && (
                <>
                    <button className="flex items-center text-yellow-400 py-2 w-24"
                        onClick={handleApprove}
                    >
                        <CheckCircleIcon className="h-5 w-5 text-yellow-400" />
                        <span>Approve</span>
                    </button>
                    <button className="flex items-center text-yellow-400 py-2 w-24"
                        onClick={handleReject}
                    >
                        <XCircleIcon className="h-5 w-5 text-yellow-400" />
                        <span>Reject</span>
                    </button>
                </>
            )}
            <button 
                className="flex items-center text-yellow-400 py-2 w-24"
                onClick={handleDetail}
            >
                <EyeIcon className="h-5 w-5 text-yellow-400" />
                <span>Detail</span>
            </button>
            {renderModal()}
        </>
    )
});

export default TransactionOperation;