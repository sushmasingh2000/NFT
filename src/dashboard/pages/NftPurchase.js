import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { apiConnectorPost } from '../../utils/APIConnector';
import { endpoint } from '../../utils/APIRoutes';
import CustomTable from '../../Shared/CustomTable';
import CustomToPagination from '../../Shared/Pagination';
import { useFormik } from 'formik';
import moment from 'moment';

const NFTPurchase = () => {
    const [page, setPage] = useState(1)
    const client = useQueryClient();
    const fk = useFormik({
        initialValues: {
            search: '',
            start_date: '',
            end_date: '',
            trade_type: 'BUY', // default
        },
        enableReinitialize: true,
    });

    const { data, isLoading } = useQuery(
        ['get_nft_details', fk.values.search, fk.values.start_date, fk.values.end_date, fk.values.trade_type, page],
        () =>
            apiConnectorPost(endpoint?.get_nft_details, {
                search: fk.values.search,
                start_date: fk.values.start_date,
                end_date: fk.values.end_date,
                trade_type: fk.values.trade_type,
                page: page,
                count: '10',
            }),
        {
            keepPreviousData: true,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            onError: (err) => console.error("Error fetching NFT data:", err),
        }
    );

    const allData = data?.data?.result || [];

    const tablehead = [
        <span>S.No.</span>,
        <span>Date/Time</span>,
        <span>NFT ID</span>,
        <span>Transaction ID</span>,
        <span>NFT Name</span>,
        <span>Amount ($)</span>,
        <span> Status</span>,
    ];

    const tablerow = allData?.data?.map((row, index) => {
        const isSell = fk.values.trade_type === 'SELL' || fk.values.trade_type === 'SOLD';
        return [
            <span>{(page - 1) * 10 + index + 1}</span>,
            <span>{moment(row.tr10_buy_date).format("DD-MM-YYYY HH:mm:ss")}</span>,
            <span>{row.m02_dist_id}</span>,
            <span>{row.tr10_trans_id}</span>,
            <span>{row.m01_name}</span>,
            <span>{parseFloat(row.tr10_buy_price).toFixed(2)}</span>,
            <span className={`${isSell ? (row.tr10_sell_status ? "text-green-400" : "text-yellow-300") : "text-blue-300"}`}>
                {isSell ? (row.tr10_sell_status ? "SOLD" : "Pending") : "BUY"}
            </span>,
        ];
    });
    return (
        <div className="p-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">History</h2>

                <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
                    <input
                        type="date"
                        name="start_date"
                        id="start_date"
                        value={fk.values.start_date}
                        onChange={fk.handleChange}
                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    />
                    <input
                        type="date"
                        name="end_date"
                        id="end_date"
                        value={fk.values.end_date}
                        onChange={fk.handleChange}
                        className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    />
                    {/* <input
                        type="text"
                        name="search"
                        id="search"
                        value={fk.values.search}
                        onChange={fk.handleChange}
                        placeholder="User ID"
                        className="bg-gray-700 border border-gray-600 rounded-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    /> */}

                    <select
                        name="trade_type"
                        value={fk.values.trade_type}
                        onChange={(e) => {
                            fk.handleChange(e);
                            setPage(1);
                        }}
                        className="bg-gray-700 border border-gray-600 rounded-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"

                    >
                        <option value="BUY">Buy</option>
                        <option value="SELL">Sell</option>
                        <option value="SOLD">Sold</option>
                    </select>
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
    );
};

export default NFTPurchase;
