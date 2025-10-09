import { Switch } from '@mui/material';
import { useFormik } from 'formik';
import moment from 'moment';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import Loader from '../../../../Shared/Loader';
import CustomToPagination from '../../../../Shared/Pagination';
import { apiConnectorPost } from '../../../../utils/APIConnector';
import { endpoint } from '../../../../utils/APIRoutes';
import CustomTable from '../../../Shared/CustomTable';

const TraderRejct = () => {
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const client = useQueryClient();
    const initialValues = {
        income_Type: "",
        search: '',
        count: 10,
        page: "",
        start_date: '',
        end_date: '',
        group_type: "Cent Group",
        
    };

    const fk = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,

    })
    const { data, isLoading } = useQuery(
        ['get_user_trader_reject', fk.values.search, fk.values.start_date, fk.values.end_date, page, fk.values.group_type],
        () =>
            apiConnectorPost(endpoint?.trader_list_details, {
                search: fk.values.search,
                start_date: fk.values.start_date,
                end_date: fk.values.end_date,
                page: page,
                count: 10,
                group_type: fk.values.group_type,
                status: "Reject",
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
;

    const tablehead = [
        <span>S.No.</span>,
        <span>Name</span>,
        <span>Amount</span>,
        <span>Server Name</span>,
        // <span>Currency</span>,
        <span>Broker Name</span>,
        <span>Group Type</span>,
        <span>Mt5</span>,
        <span>Password</span>,
        <span>Verification Status</span>,
        <span>Verification Date</span>,
        <span> Account Status</span>,

    ];

    const tablerow = allData?.data?.map((row, index) => {
        return [
           <span> {(page - 1) * 10 + index + 1}</span>,
            <span>{row.td_trad_name || "--"}</span>,
            <span>{Number(row.td_wallet_amount || 0)?.toFixed(2) || "--"}</span>,
            <span>{row.td_server_name || "--"}</span>,
            // <span>{row.td_base_currency || "--"}</span>,
            <span>{row.td_broker_name || "--"}</span>,
            <span>{row.td_group_type || "--"}</span>,
            <span>{row?.td_account_id || "--"}</span>,
            <span>{row?.td_password || "--"}</span>,
            <span className="border border-gray-300 rounded px-2 py-1 text-sm" >
                {   row?.td_verification_status}
                </span>,
            <span>{row.td_verification_date ? moment?.utc(row.td_verification_date).format("DD-MM-YYYY") : "--"}</span>,
            <span>
                <Switch
                    checked={row?.td_account_status === "Active"}
                    color="primary"
                />
            </span>,

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
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={fk.values.search}
                        onChange={fk.handleChange}
                        placeholder="User ID"
                        className="bg-white bg-opacity-50 border border-gray-600 rounded-full py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                    />
                    <select
                        className="bg-white bg-opacity-50 border border-gray-600 rounded py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                        id='group_type'
                        name='group_type'
                        value={fk.values.group_type}
                        onChange={fk.handleChange}
                    >
                        <option value={"Cent Group"}>Cent Group</option>
                        <option value={"USD Group"}>USD Group</option>
                        <option value={"Pamm Group"}>PAMM Group</option>
                    </select>

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

export default TraderRejct;
