import { useFormik } from 'formik';
import moment from 'moment';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Loader from '../../../Shared/Loader';
import CustomToPagination from '../../../Shared/Pagination';
import { apiConnectorPost } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';
import CustomTable from '../../Shared/CustomTable';

const TraderList = () => {
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const client = useQueryClient();
    const fk = useFormik({
        initialValues: {
            search: '',
            start_date: '',
            end_date: '',
            old_st: "",
            curr_st: "",
        },
        enableReinitialize: true,
    });

    const { data, isLoading } = useQuery(
        ['get_nft_details', fk.values.search, fk.values.start_date, fk.values.end_date, fk.values.curr_st, fk.values.old_st, page],
        () =>
            apiConnectorPost(endpoint?.get_nft_details, {
                search: fk.values.search,
                start_date: fk.values.start_date,
                end_date: fk.values.end_date,
                page: page,
                count: 50,
                trade_type: fk.values.curr_st || fk.values.old_st,
                filter_type: fk.values.old_st ? "OLD" : "CURRENT"
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
        <span>User ID</span>,
        <span>NFT ID</span>,
        <span>Name</span>,
        // <span>Email</span>,
        // <span>Mobile</span>,
        <span>NFT Name</span>,
        <span>Buy Price ($)</span>,
        <span>Sell Price ($)</span>,
        <span>Appr. </span>,
        <span>ROI </span>,
        <span>Transaction ID</span>,
        // <span>Hash</span>,
        <span>Old Status</span>,
        <span>Bought At </span>,
        <span>Current Status</span>,
        <span>Updated At</span>,
    ];


    const tablerow = allData?.data?.map((row, index) => {
        return [
            <span> {(page - 1) * 50 + index + 1}</span>,
            <span>{row.lgn_cust_id}</span>,
            <span>{row.m02_dist_id}</span>,
            <span>{row.lgn_name}</span>,
            // <span>{row.lgn_email}</span>,
            // <span>{row.lgn_mobile}</span>,
            <span>{row.m01_name}</span>,
            <span>{parseFloat(row.tr10_buy_price).toFixed(2)}</span>,
            <span>{parseFloat(row.tr10_sell_price).toFixed(2)}</span>,
            <span>{parseFloat(row.tr10_appri_profit).toFixed(2)}</span>,
            <span>{parseFloat(row.tr10_roi_profit).toFixed(2)}</span>,
            <span>{row.tr10_trans_id}</span>,
            // <span
            //     onClick={() =>
            //         (document.location.href = `https://opbnbscan.com/tx/${row.tr08_trans_hash}`)
            //     }
            //     className="!text-blue-500 cursor-pointer"
            // >
            //     View in opBNB
            // </span>,
            <span >
                {row.tr10_buy_status === 1
                    ? "Bought"
                    : "--"}
            </span>,
            <span>{moment(row.tr10_buy_date).format("DD-MM-YYYY HH:mm:ss")}</span>,
            <span
                className={`${!row.tr10_sell_req
                    ? "text-rose-400" // HOLD = red
                    : row.tr10_sell_req === "Pending"
                        ? "text-green-800" // SELL = green
                        : "text-yellow-600" // SOLD = yellow
                    }`}
            >
                {!row.tr10_sell_req
                    ? "HOLD"
                    : row.tr10_sell_req === "Pending"
                        ? "SELL"
                        : "SOLD"}
            </span>,
            <span>{moment(row.tr10_updated_at).format("DD-MM-YYYY HH:mm:ss")}</span>,
        ];
    });


    return (
        <div className="p-2">
            <Loader isLoading={isLoading || loading} />
            <div className="bg-white bg-opacity-50 rounded-lg shadow-lg p-3 text-white mb-6">
                <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
                    <input
                        type="date"
                        name="start_date"
                        id="start_date"
                        value={fk.values.start_date}
                        onChange={fk.handleChange}
                        className="bg-white bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    />
                    <input
                        type="date"
                        name="end_date"
                        id="end_date"
                        value={fk.values.end_date}
                        onChange={fk.handleChange}
                        className="bg-white bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    />
                    <select
                        name="curr_st"
                        id="curr_st"
                        value={fk.values.curr_st}
                        onChange={fk.handleChange}
                        className="bg-white bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    >
                        <option value={""}>Current Status</option>
                        <option value={"BUY"}>HOLD</option>
                        <option value={"SELL"}>SELL</option>
                        <option value={"SOLD"}>SOLD</option>
                    </select>
                    <select
                        name="old_st"
                        id="old_st"
                        value={fk.values.old_st}
                        onChange={fk.handleChange}
                        className="bg-white bg-opacity-50 border border-gray-600 rounded-md py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    >
                        <option value={""}>OLD Status</option>
                        <option value={"BUY"}>HOLD</option>
                    </select>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={fk.values.search}
                        onChange={fk.handleChange}
                        placeholder="User ID"
                        className="bg-white bg-opacity-50 border border-gray-600 rounded-full py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    />
                    <button
                        onClick={() => {
                            setPage(1);
                            client.invalidateQueries(["get_user_trader"]);
                        }}
                        type="submit"
                        className="bg-blue-500 text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-dark-color transition-colors w-full sm:w-auto text-sm"
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
    );
};

export default TraderList;
