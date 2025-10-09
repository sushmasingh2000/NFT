import { useFormik } from "formik";
import moment from "moment";
import { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import CustomTable from "../../../Shared/CustomTable";
import CustomToPagination from "../../../Shared/Pagination";
import { apiConnectorPost } from "../../../utils/APIConnector";
import { endpoint } from "../../../utils/APIRoutes";

const FundTransfer = () => {
  const [page, setPage] = useState(1);
  const client = useQueryClient();

  const initialValues = {
    income_Type: "",
    search: "",
    page: "",
    count: 10,
    start_date: "",
    end_date: "",
  };

  const fk = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
  });

  const { data, isLoading } = useQuery(
    [
      "get_fund_request",
      fk.values.search,
      fk.values.start_date,
      fk.values.end_date,
      page,
    ],
    () =>
      apiConnectorPost(endpoint?.user_deposit_req, {
        search: fk.values.search,
        start_date: fk.values.start_date,
        end_date: fk.values.end_date,
        page: page,
        count: 10,
      }),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError: (err) => console.error("Error fetching direct data:", err),
    }
  );

  const allData = data?.data?.result || [];

  const tablehead = [
    <span>S.No.</span>,
    <span>Amount </span>,
    <span>Transaction ID </span>,
    <span>Status </span>,
    <span>Date / Time</span>,
  ];

  const tablerow = allData?.data?.map((row, index) => {
    return [
     <span> {(page - 1) * 10 + index + 1}</span>,
      <span>{ Number(row?.topup_real_amount || 0)?.toFixed(2) || "--"}</span>,
      <span>{row?.topup_trans_id || "--"}</span>,
      
      <span>
        {row?.topup_roi_status || "N/A"}
      </span>,
      <span>{row?.created_at ? moment(row?.created_at)?.format("DD-MM-YYYY HH:mm:ss") : "--"}</span>,
    ];
  });

  return (
    <div className="p-2 min-h-screen bg-gray-900">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
          Invester Amount
        </h2>
        <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
          <input
            type="date"
            name="start_date"
            id="start_date"
            value={fk.values.start_date}
            onChange={fk.handleChange}
            className="bg-gray-700 border border-gray-600  py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />
          <input
            type="date"
            name="end_date"
            id="end_date"
            value={fk.values.end_date}
            onChange={fk.handleChange}
            className="bg-gray-700 border border-gray-600  py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />
          <input
            type="text"
            name="search"
            id="search"
            value={fk.values.search}
            onChange={fk.handleChange}
            placeholder="User ID"
            className="bg-gray-700 border border-gray-600 rounded-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />
          <button
            onClick={() => {
              setPage(1);
              client.invalidateQueries(["get_direct"]);
            }}
            type="submit"
            className="bg-green-500 text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-green-600 transition-colors w-full sm:w-auto text-sm" // Adjusted class name for consistency
          >
            Search
          </button>
          <button
            onClick={() => {
              fk.handleReset();
              setPage(1);
            }}
            className="bg-gray-600 text-white font-bold py-2 px-4 rounded-full hover:bg-gray-700 transition-colors w-full sm:w-auto text-sm" // Adjusted class name for consistency
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700">
        <CustomTable
          tablehead={tablehead}
          tablerow={tablerow}
          isLoading={isLoading}
        />

        {/* Pagination */}
        <CustomToPagination page={page} setPage={setPage} data={allData} />
      </div>
    </div>
  );
};

export default FundTransfer;
