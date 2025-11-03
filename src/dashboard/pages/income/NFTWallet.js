import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { apiConnectorPost } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';
import CustomTable from '../../../Shared/CustomTable';
import CustomToPagination from '../../../Shared/Pagination';
import { useFormik } from 'formik';
import moment from 'moment';

const NFTWalletHistory = () => {
    const [page, setPage] = useState(1)
    const client = useQueryClient();
    const initialValues = {
        income_type: "NFT_WALLET",
        search: '',
        page: "",
        start_date: '',
        end_date: '',
        level_id: ""
    };

    const fk = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,

    })
    const { data, isLoading } = useQuery(
        ['get_nftwallet', fk.values.search, fk.values.start_date, fk.values.end_date, page, fk.values.level_id],
        () =>
            apiConnectorPost(endpoint?.roi_income_api, {
                income_type: 'NFT_WALLET',
                search: fk.values.search,
                start_date: fk.values.start_date,
                end_date: fk.values.end_date,
                page: page,
                wallet_type: "NFT",
                count: 10,
                level: "",
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
        <span>Transaction Id</span>,
        <span>Amount ($)</span>,
        <span>  Type </span>,
        <span>Hash </span>,
        <span>Description</span>,
    ];

    const tablerow = allData?.data?.map((row, index) => {
        const isMemberPayout = row?.tr07_description?.trim()?.startsWith("Member Payout");

        return [
            <span className={isMemberPayout ? "bg-red-400/30 p-3" : ""}>
                {(page - 1) * 10 + index + 1}
            </span>,
            <span className={isMemberPayout ? "bg-red-400/30 p-3" : ""}>
                {moment(row.tr07_created_at)?.format("DD-MM-YYYY")}
            </span>,
            <span className={isMemberPayout ? "bg-red-400/30 p-3" : ""}>
                {row?.tr07_trans_id || "--"}
            </span>,
            <span className={isMemberPayout ? "bg-red-400/30 p-3" : ""}>
                {Number(row.tr07_amount || 0)?.toFixed(4) || "$0.00"}
            </span>,
            <span
                className={`${row?.tr07_credit === 1 ? "text-green-500" : "text-red-500"} ${isMemberPayout ? "bg-red-400/30 p-3" : ""
                    }`}
            >
                {row?.tr07_credit === 1 ? "CR" : "DR"}
            </span>,
            <span
                className={isMemberPayout ? "bg-red-400/30 p-3" : ""}
            >
                {row.block_hash ? (
                    <span
                        className="text-green-500 cursor-pointer"
                        onClick={() =>
                            (document.location.href = `https://opbnbscan.com/tx/${row.block_hash}`)
                        }
                    >
                        View in opBNB
                    </span>
                ) : (
                    "--"
                )}
            </span>,
            <span
                className={isMemberPayout ? "bg-red-400/30 p-3" : ""}
            >
                {row.tr07_description || "--"}
            </span>,
        ];
    });


    return (
        <div className="p-2">
            <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-200">NFT Wallet History</h2>
                <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
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
                            client.invalidateQueries(["get_nftwallet"]);
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

export default NFTWalletHistory;
