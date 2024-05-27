import SideNav from "../components/sidenav";
import Logout from "../components/logout";
import { useAuth } from "../hooks/useAuth";
import { FormEvent, useEffect, useState } from "react";

export default function CreateTransactionPage() {
  const auth = useAuth();
  const { token, userId, accountNo, userName } = auth?.user || {};
  const [totalUploadAmount, setTotalUploadAmount] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [fileError, setFileError] = useState("");
  const [instructionTypeError, setInstructionTypeError] = useState("");
  const [recordError, setRecordError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [isValidationComplete, setIsValidationComplete] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);

  const [messageUploadResult, setMessageUploadResult] = useState("");

  const [formData, setFormData] = useState({
    filename: "",
    instructionType: "",
    totalTransferRecord: 0,
    transferAmount: 0,
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.type === "radio") {
      setFormData({
        ...formData,
        instructionType: event.target.value,
      });
      return;
    }
    setFormData({
      ...formData,
      [event.target.id]: event.target.value,
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();


    const target = event.target as HTMLInputElement;
    const file = target.files ? target.files[0] : null;

    const submitData = {
      file: file,
      total_amount: formData.transferAmount,
      total_record: formData.totalTransferRecord,
      from_account: accountNo,
      user_id: userId,
      maker: userName,
    };
    handleProcess(submitData);
  };

  const handleProcess = async (submitData: any) => {
    setIsModalVisible(false);
    try {
      const data = new FormData();
      data.append('file', submitData.file);
      data.append('total_amount', submitData.total_amount);
      data.append('total_record', submitData.total_record);
      data.append('from_account', submitData.from_account);
      data.append('user_id', submitData.user_id);
      data.append('maker', submitData.maker);
      console.log("data", data);
      const response = await fetch("http://localhost:1323/api/transactions/create", {
        method: "POST",
        headers: {          
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const res = await response.json();
      setMessageUploadResult(res.message);
      // reset all form state
      setFormData({
        filename: "",
        instructionType: "",
        totalTransferRecord: 0,
        transferAmount: 0,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setFormData((prevState) => ({ ...prevState, filename: file.name }));

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === 'string') {
          const lines = e.target.result.split("\n");
          const data = lines.slice(1).map((line) => {
            const value = line.split(",")[3];
            const cleanedValue = value.replace(/[^0-9]/g, ""); // remove non-digit characters
            return parseInt(cleanedValue, 10); // parse into integer
          });
          const sum = data.reduce((a, b) => a + b, 0);
          const count = data.length;
  
          setTotalUploadAmount(sum);
          setTotalRecord(count);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleConfirmUpload = () => {        
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    if (!fileError && !instructionTypeError && !recordError && !amountError && isValidationComplete) {
      handleConfirmUpload();
    }
  }, [fileError, instructionTypeError, recordError, amountError, isValidationComplete]);  

  function handleNext() {
    setFileError(!formData.filename ? "Please upload a file." : "");
    setInstructionTypeError(
      !formData.instructionType ? "Please select an instruction type." : "",
    );
    setRecordError(
      totalRecord !== Number(formData.totalTransferRecord)
        ? "The total record does not match the total transfer record."
        : "",
    );
    setAmountError(
      totalUploadAmount !== Number(formData.transferAmount)
        ? "The total upload amount does not match the total amount."
        : "",
    );
    
    setIsValidationComplete(true);
  }

  const renderModal = () => {
    if (!isModalVisible) {
      return null;
    }
    return (
      <div className="fixed z-10 inset-0 overflow-y-auto w-full h-full" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
          <div className="bg-gray-50 pr-6 pt-6 sm:flex sm:flex-row-reverse">
                <button type="button" className="mt-3 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" 
                  onClick={closeModal}
                >
                    Close
                </button>
          </div>
          <div className="flex bg-gray-50 rounded-md px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h1 className="mt-5 text-2xl">Create Transaction</h1>
          </div>
          <div className="flex justify-center pb-3 px-6">
            <div className="flex flex-col bg-gray-100 rounded-md p-5 w-full max-w-screen-xl">
              <h2>TotalTransfer Record: {formData.totalTransferRecord}</h2>
              <h2>TotalTransfer Amount: {formData.transferAmount}</h2>
            </div>
          </div>
          <div className="flex justify-center pb-3 px-6">
            <div className="flex flex-col bg-gray-100 rounded-md p-5 w-full max-w-screen-xl">
              <div>
                <h2>From Account No: {accountNo}</h2>
                <h2>Instruction Type: {formData.instructionType}</h2>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button 
              type="submit"
              id="submitButton"
              className="flex justify-center my-5 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              form="uploadTransaction">
                Confirm
            </button>
          </div>
        </div>
        </div>
      </div>
    );
  };

  return (
    <main className="flex h-full">
      <SideNav />
      <div className="flex flex-col w-full">
        <div className="flex flex-row justify-end bg-gray-50 text-sm">
          <div className="py-2 px-4">UserID: {userId}</div>
          <div className="bg-gray-50 text-blue-500 font-bold py-2 px-4">
            <Logout />
          </div>
        </div>
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
          <div className="bg-white shadow-md rounded-md w-full max-w-lg p-6">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Create Transaction
            </h2>
            {messageUploadResult && (
              <div className="border border-green-500 p-4 rounded-md mb-4 text-center">
                <div className="text-green-500 text-lg">{messageUploadResult}</div>
              </div>
            )}
            <form id="uploadTransaction" onSubmit={handleSubmit}>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Please enter transfer information
                </h3>
                <div className="border-dashed border-2 border-yellow-500 p-6 flex flex-col items-center relative">
                  <input
                    type="file"
                    accept=".csv"
                    className="opacity-0 w-full h-full absolute left-0 top-0 cursor-pointer"
                    onChange={handleFileUpload}
                  />
                  <span className="text-gray-600">Choose Your Template</span>
                  <span className="text-sm text-gray-500">
                    Only csv format is supported
                  </span>
                  {fileError && (
                    <div className="text-red-500 text-sm">{fileError}</div>
                  )}
                </div>
                <a
                  href="/csv_template/template.csv"
                  download
                  className="text-yellow-500 mt-2 inline-block"
                >
                  Download Template
                </a>
                <h1 className="text-yellow-500">FileUploaded: {formData.filename}</h1>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  * Instruction Type
                </label>
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="instructionType"
                      className="h-5 w-5 text-yellow-600"
                      value="Immediate"
                      checked={formData.instructionType === "Immediate"}
                      onChange={handleChange}
                    />
                    <span className="ml-2">Immediate</span>
                  </label>
                  <label className="inline-flex items-center ml-6">
                    <input
                      type="radio"
                      name="instructionType"
                      className="h-5 w-5 text-yellow-600"
                      value="Standing Instruction"
                      checked={formData.instructionType === "Standing Instruction"}
                      onChange={handleChange}
                    />
                    <span className="ml-2">Standing Instruction</span>
                  </label>
                  { instructionTypeError && (
                    <div className="text-red-500 text-sm">{instructionTypeError}</div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="totalTransferRecord"
                >
                  *Total Transfer Record
                </label>
                <input
                  type="number"
                  id="totalTransferRecord"
                  className="mt-1 block w-full border-gray-300 shadow-sm focus:border-yellow-500 focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
                  placeholder="Please Input"
                  value={formData.totalTransferRecord}
                  onChange={handleChange}
                />
                { recordError && (
                  <div className="text-red-500 text-sm">{recordError}</div>
                )}
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="transferAmount"
                >
                  *Transfer Amount
                </label>
              
                <input
                  type="number"
                  id="transferAmount"
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-yellow-500 focus:ring focus:ring-yellow-500 focus:ring-opacity-50"
                  placeholder="Please Input amount"
                  value={formData.transferAmount}
                  onChange={handleChange}
                />
                {
                  amountError && (
                    <div className="text-red-500 text-sm">{amountError}</div>
                  )
                }
                
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-yellow-500 hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  onClick={handleNext}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {renderModal()}
    </main>
  );
}
