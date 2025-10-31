import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { apiConnectorPost } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";
import CustomTable from "../../Shared/CustomTable";
import CustomToPagination from "../../Shared/Pagination";
import { useFormik } from "formik";
import moment from "moment";
import { TextField } from "@mui/material";
import { Refresh } from "@mui/icons-material";

const NFTPurchase = () => {
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const fk = useFormik({
    initialValues: {
      search: "",
      start_date: "",
      end_date: "",
      trade_type: "ALL", // default
    },
    enableReinitialize: true,
  });

  const { data, isLoading, refetch } = useQuery(
    [
      "get_nft_details",
      fk.values.search,
      fk.values.start_date,
      fk.values.end_date,
      fk.values.trade_type,
      page,
    ],
    () =>
      apiConnectorPost(endpoint?.get_nft_details, {
        search: fk.values.search,
        start_date: fk.values.start_date,
        end_date: fk.values.end_date,
        trade_type: fk.values.trade_type,
        page: page,
        count: "10",
      }),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      onError: (err) => console.error("Error fetching NFT data:", err),
    }
  );

  const allData = data?.data?.result || [];

  const tablehead = [
    <span>S.No.</span>,
    <span>Date/Time</span>,
    <span>NFT ID</span>,
    <span>Transaction ID</span>,
    <span>Hash</span>,
    <span>NFT Name</span>,
    <span>Amount ($)</span>,
    <span> Status</span>,
  ];

  const tablerow = allData?.data?.map((row, index) => {
    return [
      <span>{(page - 1) * 10 + index + 1}</span>,
      <span>{moment(row.tr10_buy_date).format("DD-MM-YYYY HH:mm:ss")}</span>,
      <span>{row.m02_dist_id}</span>,
      <span>{row.tr10_trans_id}</span>,
      <span
        onClick={() =>
          (document.location.href = `https://opbnbscan.com/tx/${row.tr08_trans_hash}`)
        }
        className="!text-blue-500 cursor-pointer"
      >
        View in opBNB
      </span>,
      <span>{row.m01_name}</span>,
      <span>{parseFloat(row.tr10_buy_price).toFixed(2)}</span>,
      <span
        className={`${!row.tr10_sell_req
          ? "text-rose-500" // HOLD = red
          : row.tr10_sell_req === "Pending"
            ? "text-green-400" // SELL = green
            : "text-yellow-400" // SOLD = yellow
          }`}
      // className={`${row.tr10_sell_req === "Pending" ? "text-green-400" : "text-rose-500"  }`}
      >
        {!row.tr10_sell_req
          ? "HOLD"
          : row.tr10_sell_req === "Pending"
            ? "SELL"
            : "SOLD"}
      </span>,
    ];
  });
  return (
    <div className="p-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">History  <Refresh className="!cursor-pointer" onClick={refetch}/></h2>

        {/* <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">

          <TextField
            type="date"
            label="Start Date"
            name="start_date"
            id="start_date"
            value={fk.values.start_date}
            onChange={fk.handleChange}
            InputLabelProps={{
              shrink: true,
              style: { color: '#fff' },
            }}
            inputProps={{
              style: { color: '#fff' },
            }}
            className="bg-gray-700 border border-gray-600 rounded-md  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />

          <TextField
            label="End Date"
            type="date"
            name="end_date"
            id="end_date"
            value={fk.values.end_date}
            onChange={fk.handleChange}
             InputLabelProps={{
              shrink: true,
              style: { color: '#fff' },
            }}
            inputProps={{
              style: { color: '#fff' },
            }}
            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />

          <button
            onClick={() => {
              setPage(1);
              client.invalidateQueries(["get_actiavtion"]);
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
          </button>
        </div> */}
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

export default NFTPurchase;
