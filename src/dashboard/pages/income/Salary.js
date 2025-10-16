import { TextField } from "@mui/material";
import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { getRemainingTime } from "../../../Shared/CustomeTimer";
import CustomTable from "../../../Shared/CustomTable";
import { apiConnectorGet } from "../../../utils/APIConnector";
import { endpoint } from "../../../utils/APIRoutes";

const Salryfn = () => {
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());

  const initialValues = {
    income_type: "",
    search: "",
    page: "",
    start_date: "",
    end_date: "",
  };

  const fk = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
  });
  // const { data, isLoading } = useQuery(
  //   [
  //     "get_milestone",
  //     fk.values.search,
  //     fk.values.start_date,
  //     fk.values.end_date,
  //     page,
  //   ],
  //   () =>
  //     apiConnectorPost(endpoint?.roi_income_api, {
  //       income_type: "MILESTONE",
  //       search: fk.values.search,
  //       start_date: fk.values.start_date,
  //       end_date: fk.values.end_date,
  //       page: page,
  //       wallet_type: "INCOME",

  //       count: 10,
  //     }),
  //   {
  //     keepPreviousData: true,
  //     refetchOnMount: false,
  //     refetchOnReconnect: false,
  //     refetchOnWindowFocus: false,
  //     onError: (err) => console.error("Error fetching direct data:", err),
  //   }
  // );

  // const allData = data?.data?.result || [];

  const { data: profile } = useQuery(
    ["get_profile_user"],
    () => apiConnectorGet(endpoint?.member_profile_detail),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: true,
      retry: true,
    }
  );
  const user_profile = profile?.data?.result?.[0] || {};

  const tablehead = [
    <span>S.No.</span>,
    <span>Achieve Date</span>,
    <span>Release Date</span>,
    // <span>User Id</span>,
    // <span>User Name</span>,
    // <span>TopUp Wallet</span>,
    <span>Amount ($)</span>,
    // <span>Mobile</span>,
    <span>Rank</span>,
    <span>Left Time</span>,
  ];
  const rankDate = moment(user_profile?.tr03_rank_date);
  const today = moment();

  // difference in days from rank date to today
  const diffDays = today.diff(rankDate, "days");

  // decide which date to show
  const displayDate =
    diffDays <= 15 ? rankDate.add(15, "days") : rankDate.add(30, "days");

  useEffect(() => {
    const endDate = displayDate;
    const interval = setInterval(() => {
      const updated = getRemainingTime(endDate);
      setTimeLeft(updated);
      if (updated.totalSec <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tablerow =user_profile.tr03_rank_date?  [
    [
      <span> {1}</span>,
      <span>{moment(user_profile.tr03_rank_date)?.format("DD-MM-YYYY")}</span>,

      <span>{displayDate.format("DD-MM-YYYY")}</span>,
      // <span>{row?.from_cust_id || "--"}</span>,
      // <span>{row.from_name}</span>,
      <span>
        {" "}
        {Number(user_profile.m06_income || 0)?.toFixed(2) || "$0.00"}
      </span>,
      // <span>{Number(row.jnr_topup_wallet)?.toFixed(2) || "--"}</span>,
      // <span>{row.lgn_mobile || '--'}</span>,
      <span>{user_profile.m06_name || "--"}</span>,
      // <span className="flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-md border border-green-500 animate-pulse text-base sm:text-lg">

      <span className="font-mono text-lg sm:text-xl !text-rose-500">
        ⏰ {timeLeft.hrs}H:{timeLeft.mins}M:{timeLeft.secs}S
      </span>,
      // </span>,
    ],
  ]:[];

  return (
    <div className="p-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">
          MileStone Reward
        </h2>

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
              style: { color: "#fff" },
            }}
            inputProps={{
              style: { color: "#fff" },
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
              style: { color: "#fff" },
            }}
            inputProps={{
              style: { color: "#fff" },
            }}
            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />

      
          <button
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
          </button>
        </div> */}
      </div>

      {/* Main Table Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700">
        <CustomTable
          tablehead={tablehead}
          tablerow={tablerow}
          isLoading={false}
        />

        {/* Pagination */}
        {/* <CustomToPagination page={page} setPage={setPage} data={allData} /> */}
      </div>
    </div>
  );
};

export default Salryfn;
