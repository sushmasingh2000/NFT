import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { apiConnectorPost } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';
import CustomTable from '../../../Shared/CustomTable';
import CustomToPagination from '../../../Shared/Pagination';
import { useFormik } from 'formik';
import moment from 'moment';
import { TextField } from '@mui/material';

const NFTDelay = () => {
  const [page, setPage] = useState(1)
  const client = useQueryClient();
  const initialValues = {
    income_type: "",
    search: '',
    page: "",
    start_date: '',
    end_date: '',
  };

  const fk = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,

  })
  const { data, isLoading } = useQuery(
    ['get_nftdelay', fk.values.search, fk.values.start_date, fk.values.end_date, page],
    () =>
      apiConnectorPost(endpoint?.roi_income_api, {
        income_type: 'NFT_DELAY_COM_ROI',
        search: fk.values.search,
        start_date: fk.values.start_date,
        end_date: fk.values.end_date,
        page: page,
        wallet_type: "INCOME",
        count: 10,
      }),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError: (err) => console.error("Error fetching level data:", err),
    }
  );

  const allData = data?.data?.result || [];

  const tablehead = [
    <span>S.No.</span>,
    <span>Date</span>,
    <span>NFT Id</span>,
    <span>Amount ($)</span>,,
    <span>Description</span>,
  ];
  const tablerow = allData?.data?.map((row, index) => {
    return [
      <span> {(page - 1) * 10 + index + 1}</span>,
      <span>{moment(row.tr07_created_at)?.format("DD-MM-YYYY")}</span>,
      <span>{row?.m02_dist_id || "--"}</span>,
      <span> {Number(row.tr07_amount || 0)?.toFixed(4) || '$0.00'}</span>,
      <span>{row.tr07_description || '--'}</span>,
    ];
  });
  return (
    <div className="p-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200"> Delay Compensation</h2>
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700">
        <CustomTable
          tablehead={tablehead}
          tablerow={tablerow}
          isLoading={isLoading}
        />
        <CustomToPagination
          page={page}
          setPage={setPage}
          data={allData}
        />
      </div>
    </div>
  );
};

export default NFTDelay;
