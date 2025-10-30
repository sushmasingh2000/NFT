import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import { apiConnectorGet, apiConnectorPost } from "../../../utils/APIConnector";
import { endpoint, frontend } from "../../../utils/APIRoutes";
import CustomToPagination from "../../../Shared/Pagination";
import { useFormik } from "formik";
import CustomTable from "../../Shared/CustomTable";
import moment from "moment";
import toast from "react-hot-toast";
import { Switch } from "@mui/material";
import Loader from "../../../Shared/Loader";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  saveToken,
  saveUid,
  saveUserCP,
  saveUsername,
  saveWalletAddress,
} from "../../../Shared/redux/slices/counterSlice";
import { CopyAll } from "@mui/icons-material";
import copy from "copy-to-clipboard";
const UserDetail = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const client = useQueryClient();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const getimage = localStorage.getItem("background_url")

  const [editUserData, setEditUserData] = useState({
    customer_id: "",
    email: "",
    password: "",
    name: "",
    mobile: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const openEditModal = (user) => {
    setEditUserData({
      customer_id: user?.lgn_cust_id || "",
      email: user?.lgn_email || "",
      password: "", // leave blank or mask
      name: user?.lgn_name || "",
      mobile: user?.lgn_mobile || "",
    });
    setEditModalOpen(true);
  };

  const initialValues = {
    income_Type: "",
    search: "",
    count: 50,
    page: "",
    start_date: "",
    end_date: "",
  };

  const fk = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
  });
  const { data, isLoading } = useQuery(
    [
      "get_user_admin",
      fk.values.search,
      fk.values.start_date,
      fk.values.end_date,
      page,
    ],
    () =>
      apiConnectorPost(endpoint?.member_detail, {
        search: fk.values.search,
        start_date: fk.values.start_date,
        end_date: fk.values.end_date,
        page: page,
        count: 50,
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


  const { data: count_dashboard, isLoading: countLoading } = useQuery(
    ["get_member_dashboard_view", selectedUser?.tr03_reg_id],
    () =>
      apiConnectorGet(
        `${endpoint?.get_member_dashboard_view}?user_id=${selectedUser?.tr03_reg_id}`
      ),
    {
      enabled: !!selectedUser?.tr03_reg_id,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
  const handleWalletClick = async (user) => {
    setSelectedUser(user);
    setWalletModalOpen(true);
  };

  const changestatus = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change the account status?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change it!",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const response = await apiConnectorPost(endpoint?.change_general_status, {
        u_id: id,
        status_type: "login",
      });
      setLoading(false);
      toast(response?.data?.message);
      if (response?.data?.success) {
        client.invalidateQueries(["get_user_admin"]);
      }
    } catch (error) {
      console.error("Error updating account status:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const submitEdit = async () => {
    const { customer_id, email, password, name, mobile } = editUserData;

    if (!customer_id || !email || !name || !mobile) {
      toast.error("All fields except password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await apiConnectorPost(endpoint?.admin_update_user_profile, {
        customer_id,
        email,
        password,
        name,
        mobile,
      });
      toast(res?.data?.message);
      if (res?.data?.success) {
        setEditModalOpen(false);
        client.invalidateQueries(["get_user_admin"]);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const navigateToUserPanel = async (reqBody) => {
    setLoading(true);
    const reqBodyy = {
      mobile: String("N/A"),
      email: String("N/A"),
      wallet_address: String(reqBody)?.toLocaleLowerCase(),
      type: "user",
      password: String("N/A"),
    };
    // const reqBodyy = {
    //   mobile: String("9876543210"),
    //   email: String("9876543210"),
    //   full_name: String(datatele?.username||"N/A"),
    //   referral_id: String("9876543210"),
    //   username: String("9876543210"),
    //   password: String("9876543210"),
    // };

    try {
      const response = await axios.post(endpoint?.login_api, reqBodyy, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      // toast(response?.data?.message);
      setLoading(false);
      if (response?.data?.message === "Credential not found in our record") {
        // setOpenDialogBox(true);
        return;
      }
      const resultData = response?.data?.result;
      const istopup = resultData?.is_topup;
      const is_real_launching = resultData?.is_real_launching;
      if (response?.data?.success) {
        dispatch(saveUid(reqBodyy?.mobile));
        dispatch(saveToken(response?.data?.result?.token));
        dispatch(saveUsername(reqBodyy?.username));
        dispatch(saveUserCP(response?.data?.result?.isCP));
        dispatch(saveWalletAddress(reqBody));
        localStorage.setItem("logindataen", response?.data?.result?.token);
        localStorage.setItem("uid", reqBodyy?.mobile);
        localStorage.setItem("username", reqBodyy?.username);
        localStorage.setItem("isCP", response?.data?.result?.isCP);
        localStorage.setItem("walletAddress", reqBody);

        Swal.fire({
          title: "🎉 Congratulations!",
          html: `
              <p style="font-size:14px; margin-bottom:8px;">${response?.data?.message}</p>
              <p style="font-weight:bold; color:#f39c12; margin:0;">Subscriber Wallet Address</p>
              <p style="font-size:13px; word-break:break-all; color:#16a085; margin-top:4px;">
                ${reqBody}
              </p>
            `,
          icon: "success",
          confirmButtonColor: "#75edf2",
        }).then((result) => {
          if (result.isConfirmed) {
            if (is_real_launching === 0) {
              if (!istopup) {
                navigate("/topup_without");
              } else {
                navigate("/dashboard");
              }
            } else {
              navigate("/dashboard");
            }
            window.location.reload();
          }
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: response?.data?.message,
          icon: "error",
          confirmButtonColor: "#75edf2",
        });
        // toast(response?.data?.message);
      }
    } catch (error) {
      // toast.error("Error during login.");
      Swal.fire({
        title: "Error!",
        text: "Error during login.",
        icon: "error",
        confirmButtonColor: "#75edf2",
      });
      setLoading(false);
    }
  };

  const functionTOCopy = (value) => {
      copy(value);
      toast.success("Copied to clipboard!", { id: 1 });
    };
  const IncomeItem = ({ label, value }) => (
    <div className="flex flex-col items-center justify-center bg-white hover:bg-white/20 transition rounded-xl p-3 backdrop-blur-sm border border-white/10 shadow-md">
      <p className="text-xs text-black">{label}</p>
      <p className="text-blue-400 font-semibold text-sm sm:text-base mt-1">
        {Number(value || 0).toFixed(4)}
      </p>
    </div>
  );


  const tablehead = [
    <span>S.No.</span>,
    <span>User ID</span>,
    <span>Spon ID</span>,
    <span>User Name</span>,
    // <span>Email</span>,
    // <span>Mobile No</span>,
    <span>Topup Wallet ($)</span>,
    <span>Current Package ($)</span>,
    <span>Wallet Address</span>,
    // <span>Password</span>,
    <span> Status</span>,
    <span>Join. Date</span>,
    <span>Action</span>,
  ];

  const tablerow = allData?.data?.map((row, index) => {
    return [
      <span> {(page - 1) * 50 + index + 1}</span>,
      <span className="!text-blue-600">
        <span  onClick={() => navigateToUserPanel(row.lgn_wallet_add)}> {row.lgn_cust_id || "--"}</span>
       &nbsp; <CopyAll className="!text-green-600" onClick={() => functionTOCopy(row.lgn_cust_id) }/>
      </span>,
      <span>{row.spon_id || "--"}</span>,
      <span  className="!text-blue-600"
        onClick={() => navigate(`/user_tree/${row.tr03_reg_id}`)}>{row.lgn_name || "--"}</span>,
      // <span>{row.lgn_email || "--"}</span>,
      // // <span>{row.lgn_mobile}</span>,
      // <span>{row?.lgn_mobile || "--"}</span>,
      <span>{row.tr03_topup_wallet || "--"}</span>,
      <span>{Number(row.m03_pkg_amount || 0)?.toFixed(2) || "--"}</span>,
      <span
        className="underline text-blue-500 cursor-pointer"
        onClick={() => handleWalletClick(row)}>
        {row.lgn_wallet_add || "--"}</span>,
      // <span>{row?.lgn_pass}</span>,
      <span>
        <Switch
          checked={row?.lgn_is_blocked === "No"}
          onChange={() => changestatus(row?.tr03_lgn_id)}
          color="primary"
        />
      </span>,
      <span>
        {row.tr03_reg_date
          ? moment?.utc(row.tr03_reg_date).format("DD-MM-YYYY")
          : "--"}
      </span>,
      <span>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
          onClick={() => openEditModal(row)}
        >
          Edit
        </button>
      </span>,
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
      <CustomToPagination page={page} setPage={setPage} data={allData} />
      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit User Profile</h2>
            <div className="grid gap-3">
              <input
                type="text"
                placeholder="Customer ID"
                value={editUserData.customer_id}
                onChange={(e) =>
                  setEditUserData({
                    ...editUserData,
                    customer_id: e.target.value,
                  })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Name"
                value={editUserData.name}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, name: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={editUserData.email}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, email: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Mobile"
                value={editUserData.mobile}
                onChange={(e) =>
                  setEditUserData({ ...editUserData, mobile: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              {/* <input
                  type="password"
                  placeholder="Password"
                  value={editUserData.password}
                  onChange={(e) => setEditUserData({ ...editUserData, password: e.target.value })}
                  className="border rounded px-3 py-2"
        /> */}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setEditModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {walletModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">

          <div className="relative w-full max-w-2xl  rounded-2xl border border-white/20   text-white "
            style={{
              backgroundImage: `url(${getimage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}>
            <div className=" rounded-2xl   !bg-white !bg-opacity-50 p-6 shadow-2xl">
              <button
                onClick={() => setWalletModalOpen(false)}
                className="absolute top-3 right-4 text-black hover:text-white text-2xl font-bold"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-5 text-center bg-black  bg-clip-text text-transparent">
                Member Detail
              </h2>
              <div className="text-sm sm:text-base mb-5 space-y-1 text-center">
                <p><span className="text-black">Name:</span> {selectedUser?.lgn_name}</p>
                <p><span className="text-black">Wallet Address:</span> {selectedUser?.lgn_wallet_add}</p>
              </div>

              <div className="border-t border-white/10 my-4"></div>
              <div className="text-center mb-6">
                <p className="text-sm text-black">Total Income</p>
                <p className="text-4xl font-extrabold text-black drop-shadow-md">
                  {Number(count_dashboard?.data?.result?.[0]?.total_income || 0).toFixed(4)}{" "}
                  <span className="text-sm text-white">USDT</span>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <IncomeItem
                  label="Today Income"
                  value={count_dashboard?.data?.result?.[0]?.today_income}
                />
                <IncomeItem
                  label="Cashback"
                  value={count_dashboard?.data?.result?.[0]?.CASHBACK}
                />
                <IncomeItem
                  label="SUB Direct Income"
                  value={count_dashboard?.data?.result?.[0]?.DIRECT}
                />
                <IncomeItem
                  label="SUB Level Income"
                  value={count_dashboard?.data?.result?.[0]?.LEVEL}
                />
                <IncomeItem
                  label="MILESTONE Income"
                  value={count_dashboard?.data?.result?.[0]?.MILESTONE}
                />
                <IncomeItem
                  label="NFT BUY"
                  value={count_dashboard?.data?.result?.[0]?.NFT_BUY}
                />
                <IncomeItem
                  label="NFT SELL"
                  value={count_dashboard?.data?.result?.[0]?.NFT_SELL}
                />
                <IncomeItem
                  label="NFT Trading Income"
                  value={count_dashboard?.data?.result?.[0]?.NFT_TRAD}
                />
                <IncomeItem
                  label="NFT Level Income"
                  value={count_dashboard?.data?.result?.[0]?.NFT_LEVEL}
                />
                <IncomeItem
                  label="Delay Compensation"
                  value={count_dashboard?.data?.result?.[0]?.NFT_DELAY_COM_ROI}
                />
                <IncomeItem
                  label="Paying"
                  value={count_dashboard?.data?.result?.[0]?.INCOME_IN}
                />
                <IncomeItem
                  label="Payout"
                  value={count_dashboard?.data?.result?.[0]?.INCOME_OUT}
                />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
