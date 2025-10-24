import React, { useState } from 'react';
import { apiConnectorGet, apiConnectorPost } from '../../utils/APIConnector';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { endpoint } from '../../utils/APIRoutes';
import { useFormik } from 'formik';
import CustomTable from '../../Shared/CustomTable';
import moment from 'moment';
import CustomToPagination from '../../Shared/Pagination';
import { TextField } from '@mui/material';

const PayoutDetails = () => {
  const [page, setPage] = useState(1)
  const client = useQueryClient();
  const initialValues = {
    search: '',
    page: '',
    start_date: '',
    end_date: '',
  };

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,

  })
  const { data, isLoading } = useQuery(
    ['get_payout', formik.values.search, formik.values.start_date, formik.values.end_date, page],
    () =>
      apiConnectorPost(endpoint?.roi_income_api, {
        income_type: "OUT",
       wallet_type: "FUND",
        search: formik.values.search,
        start_date: formik.values.start_date,
        end_date: formik.values.end_date,
        pageNumber: page,
        pageSize: "10",
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
    <span>Date</span>,
    <span>Transaction ID</span>,
    <span>Amount ($)</span>,
    // <span>Wallet</span>,
    <span>Description</span>,
  ];

  const tablerow = allData?.data?.map((row, index) => {
    return [
      <span>{(page - 1) * 10 + index + 1}</span>,
      <span>{moment.utc(row.tr07_created_at).format("DD-MM-YYYY HH:mm:ss")}</span>,
      <span>{row.tr07_trans_id}</span>,
      <span>{Number(row.tr07_amount).toFixed(2)}</span>,
      // <span>{row.tr07_wallet || 'N/A'}</span>,
      <span>{row.tr07_description || 'N/A'}</span>,

    ];
  });
  return (
    <>

      <div className="p-2">
        <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Payout Report</h2>

          <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
            <TextField
              type="date"
              label="Start Date"
              name="start_date"
              id="start_date"
              value={formik.values.start_date}
              onChange={formik.handleChange}
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
              value={formik.values.end_date}
              onChange={formik.handleChange}
              InputLabelProps={{
                shrink: true,
                style: { color: '#fff' },
              }}
              inputProps={{
                style: { color: '#fff' },
              }}
              className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
            />

            <input
              type="text"
              name="search"
              id="search"
              value={formik.values.search}
              onChange={formik.handleChange}
              placeholder="User ID"
              className="bg-gray-700 border border-gray-600 rounded-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
            />
            <button
              onClick={() => {
                setPage(1);
                client.invalidateQueries(["get_withdrawal"]);
              }}
              type="submit"
              className="bg-gold-color text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-dark-color transition-colors w-full sm:w-auto text-sm"
            >
              Search
            </button>
            <button
              onClick={() => {
                formik.handleReset();
                setPage(1);
              }}
              className="bg-gray-color text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-sm"
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
          <CustomToPagination
            page={page}
            setPage={setPage}
            data={allData}
          />
        </div>
      </div>
    </>
  );
};

export default PayoutDetails;