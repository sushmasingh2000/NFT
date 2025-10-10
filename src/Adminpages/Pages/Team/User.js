import React, { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { apiConnectorGet, apiConnectorPost } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';
import CustomToPagination from '../../../Shared/Pagination';
import { useFormik } from 'formik';
import CustomTable from '../../Shared/CustomTable';
import moment from 'moment';
import toast from 'react-hot-toast';
import { Switch } from '@mui/material';
import Loader from '../../../Shared/Loader';
import Swal from 'sweetalert2';
const UserDetail = () => {
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
    };

    const fk = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,

    })
    const { data, isLoading } = useQuery(
        ['get_user_admin', fk.values.search, fk.values.start_date, fk.values.end_date, page],
        () =>
            apiConnectorPost(endpoint?.member_detail, {
                search: fk.values.search,
                start_date: fk.values.start_date,
                end_date: fk.values.end_date,
                page: page,
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

  const changestatus = async (id) => {
    const confirm = await Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to change the account status?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, change it!',
    });

    if (!confirm.isConfirmed) return;

    try {
        setLoading(true);
        const response = await apiConnectorPost(endpoint?.change_general_status, {
            u_id: id,
            status_type: "login",
        });
        setLoading(false);

        if (response?.data?.success) {
            toast.success("Account status updated successfully.");
            client.invalidateQueries(["get_user_admin"]);
        } else {
            toast.error("Failed to update account status.");
        }
    } catch (error) {
        console.error("Error updating account status:", error);
        toast.error("Something went wrong.");
    } finally {
        setLoading(false);
    }
};


    const tablehead = [
        <span>S.No.</span>,
        <span>User ID</span>,
        <span>User Name</span>,
        <span>Email</span>,
        <span>Mobile No</span>,
        <span>Fund Wallet ($)</span>,
        // <span>Income Wallet ($)</span>,
        <span>Wallet Address</span>,
        // <span>Password</span>,
        <span> Status</span>,
        <span>Join. Date</span>,

    ];

    const tablerow = allData?.data?.map((row, index) => {
        return [
           <span> {(page - 1) * 10 + index + 1}</span>,
            <span>{row.lgn_cust_id || "--"}</span>,
            <span>{row.lgn_name || "--"}</span>,
            <span>{row.lgn_email || "--"}</span>,
            // <span>{row.lgn_mobile}</span>,
            <span>{row?.lgn_mobile || "--"}</span>,
            <span>{row.tr03_fund_wallet || "--"}</span>,
            <span>{row.lgn_wallet_add || "--"}</span>,
            // <span>{row?.lgn_pass}</span>,
            <span>
                <Switch
                    checked={row?.lgn_is_blocked === "No"}
                    onChange={() => changestatus(row?.tr03_lgn_id)}
                    color="primary"
                />
            </span>,
            <span>{row.tr03_reg_date ? moment?.utc(row.tr03_reg_date).format("DD-MM-YYYY") : "--"}</span>,
        ];
    });
    return (
        <div className="p-2">
            <Loader isLoading={loading || isLoading} />
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
                    <button
                        onClick={() => {
                            setPage(1);
                            client.invalidateQueries(["get_user_admin"]);
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


            {/* Main Table Section */}

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
    );
};

export default UserDetail;
