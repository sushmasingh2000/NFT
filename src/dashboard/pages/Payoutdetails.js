import React, { useState } from 'react';
import { apiConnectorGet, apiConnectorPost } from '../../utils/APIConnector';
import { useQuery, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { endpoint } from '../../utils/APIRoutes';
import { useFormik } from 'formik';
import CustomTable from '../../Shared/CustomTable';
import moment from 'moment';
import CustomToPagination from '../../Shared/Pagination';

const PayoutDetails = () => {
    const client = useQueryClient();
    const [page, setPage] = useState(1)
    const initialValuesssss = {
        search: '',
        page : "",
        count: 10,
        start_date: '',
        end_date: '',
    };

    const formik = useFormik({
        initialValues: initialValuesssss,
        enableReinitialize: true,

    })
    const { data, isLoading } = useQuery(
        ['get_withdrawal', formik.values.search, formik.values.start_date, formik.values.end_date, page],
        () =>
            apiConnectorPost(endpoint?.withdrawal_list, {
                search: formik.values.search,
                start_date: formik.values.start_date,
                end_date: formik.values.end_date,
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
        <span>Date</span>,
        <span>Transaction Id</span>,
        <span>Amount ($)</span>,
        <span>Wallet Address</span>,
        <span>Status</span>


    ];
    const tablerow = allData?.data?.map((row, index) => {
        return [
           <span> {(page - 1) * 10 + index + 1}</span>,
            <span>{row?.wdrl_created_at ? moment?.utc(row?.wdrl_created_at)?.format("DD-MM-YYYY HH:mm:ss") : "--"}</span>,
            <span>{row?.wdrl_transacton_id}</span>,
            <span> {Number(row?.wdrl_amont || 0)?.toFixed(2)|| 0}</span>,
            <span>{row?.wdrl_to}</span>,
            <span>{row?.wdrl_status || 'N/A'}</span>,

        ];
    })
    return (
        <>
          
            <div className="p-2">
                <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-200">Withdrawal History</h2>

                    <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
                        <input
                            type="date"
                            name="start_date"
                            id="start_date"
                            value={formik.values.start_date}
                            onChange={formik.handleChange}
                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                        />
                        <input
                            type="date"
                            name="end_date"
                            id="end_date"
                            value={formik.values.end_date}
                            onChange={formik.handleChange}
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