import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { apiConnectorPost } from "../../../utils/APIConnector";
import { endpoint } from "../../../utils/APIRoutes";
import CustomTable from "../../../Shared/CustomTable";
import CustomToPagination from "../../../Shared/Pagination";
import { useFormik } from "formik";
import moment from "moment";

const Downline = () => {
  const [page, setPage] = useState(1);
  const initialValues = {
    level_id: "1",
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
      "data-downline",
      fk.values.search,
      fk.values.start_date,
      fk.values.end_date,
      fk.values.level_id,
      page,
    ],
    () =>
      apiConnectorPost(endpoint.get_downline_api, {
        search: fk.values.search,
        level_id: fk.values.level_id,
        start_date: fk.values.start_date,
        end_date: fk.values.end_date,
        page: page,
        count: 10,
      }),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false,
    }
  );

  const allData = data?.data?.result || [];
  // const checked = allData?.data?.filter((i) => i?.Level_id !== 0 && allData)

  const tablehead = [
    <span>S.No.</span>,
    <span>Cust ID</span>,
    <span>User Name</span>,
    <span>Topup Wallet</span>,
    <span>Total Income</span>,
    <span> Level</span>,
    <span>Registration Date</span>,
    <span>Topup Date</span>,
  ];

  const tablerow = allData?.data?.map((row, index) => {
    return [
      <span>{(page - 1) * 10 + index + 1}</span>,
      <span>{row.lgn_cust_id}</span>,
      <span>{row.lgn_name || "--"}</span>,
      <span>{Number(row.tr03_topup_wallet || 0).toFixed(2)}</span>,
      <span>{Number(row.tr03_total_income || 0).toFixed(2)}</span>,
      <span>Level {row.level_id}</span>,
      <span>
        {row.tr03_reg_date
          ? moment(row.tr03_reg_date).format("DD-MM-YYYY")
          : "--"}
      </span>,
      <span>
        {row.tr03_topup_date
          ? moment(row.tr03_topup_date).format("DD-MM-YYYY")
          : "--"}
      </span>,
    ];
  });

  return (
    <div className="p-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Level View</h2>

        <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
          <div className="flex flex-wrap gap-2 bg-gray-800 p-3 rounded-lg">
            {Array.from({ length: 20 }, (_, i) => (
              <button
                key={i + 1}
                type="button"
                // onClick={() => handleSelect(i + 1)}
                onClick={() => fk.setFieldValue("level_id", i + 1)}
                className={`px-4 py-2 rounded-md text-sm transition-all
            ${
              Number(fk.values.level_id) === i + 1
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
              >
                Level {i + 1}
              </button>
            ))}
          </div>

          {/* <button
                        onClick={() => {
                            setPage(1);
                            client.invalidateQueries(["get_direct"]);
                        }}
                        type="submit"
                        className="bg-gold-color text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-dark-color transition-colors w-full sm:w-auto text-sm"
                    >
                        Search
                    </button>
                    <button
                        onClick={() => {
                            fk.handleReset();
                            setPage(1);
                        }}
                        className="bg-gray-color text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-sm"
                    >
                        Clear
                    </button> */}
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700">
        <CustomTable
          tablehead={tablehead}
          tablerow={tablerow}
          isLoading={isLoading}
        />
        <CustomToPagination page={page} setPage={setPage} data={allData} />
      </div>
    </div>
  );
};

export default Downline;
