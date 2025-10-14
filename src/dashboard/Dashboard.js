import { useQuery, useQueryClient } from "react-query";
import moment from "moment";
import {
  FaChartLine,
  FaDollarSign,
  FaSitemap,
  FaUserFriends,
  FaUsers
} from "react-icons/fa";
import { apiConnectorGet, apiConnectorPost } from "../utils/APIConnector";
import { dollar, domain, endpoint, frontend } from "../utils/APIRoutes";
import { useState } from "react";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

const Dashboard = () => {

  const client = useQueryClient()
  const { data: profile } = useQuery(["get_profile_user"], () =>
    apiConnectorGet(endpoint?.member_profile_detail),{
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry :false
    }
    
  );
  const user_profile = profile?.data?.result?.[0] || {};

  const { data: usernft } = useQuery(["get_nft_by_user"], () =>
    apiConnectorGet(endpoint?.get_nft),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError: (err) => console.error("Error fetching level data:", err),
    }

  );
  const user_nft = usernft?.data?.result || [];


  const tradingfn = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to buy this NFT?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, buy it!",
    });

    if (confirm.isConfirmed) {
      try {
        const reqbody = {
          nft_id: id,
          trad_type: "BUY",
        };

        const res = await apiConnectorPost(endpoint?.trading, reqbody);

        Swal.fire({
          icon: res?.data?.success ? "success" : "error",
          title: res?.data?.success ? "Success" : "Error",
          text: res?.data?.message || "Something went wrong",
        });
        client.refetchQueries("get_nft_by_user");
      } catch (e) {
        console.error("Something went wrong", e);
        Swal.fire("Error", "Something went wrong", "error");
      }
    }
  };
  const functionTOCopy = (value) => {
    copy(value);
    toast.success("Copied to clipboard!", { id: 1 });
  };

  const { data: count_dashborad } = useQuery(["get_count_dashborad"], () =>
    apiConnectorGet(endpoint?.get_member_dashboard_api),{
       refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      retry :false
    }
  );
  const user_count_dashborad = count_dashborad?.data?.result?.[0] || [];


  return (
    <div className=" bg-black text-white p-6 ">
      <div className="flex flex-col lg:flex-row gap-8 my-[39px]">

        {/* Left Card */}
        <div className="w-full lg:w-1/2">
          <h2 className="hidden lg:block text-3xl text-black font-bold mb-4">Buy NFT</h2>
          <div className="bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01] ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">User Details</h3>
              {/* <button className="px-4 py-1 border border-white/20 rounded-md text-sm hover:bg-white/10">Upgrade</button> */}
            </div>

            <p className="text-center text-lg font-semibold mb-6">User ID: {user_profile?.lgn_cust_id || "N/A"}</p>

            {/* User Info Grid */}
            {/* User Profile Details */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-medium mb-4">
              <InfoItem label="Name" value={user_profile?.lgn_name || 'N/A'} />
              <InfoItem label="Email" value={user_profile?.lgn_email || 'N/A'} />
              <InfoItem label="Mobile" value={user_profile?.lgn_mobile || 'N/A'} />
              <InfoItem label="User Type" value={user_profile?.lgn_user_type || 'N/A'} />
              <InfoItem
                label="Wallet"
                value={`$ ${parseFloat(user_profile?.tr03_fund_wallet || 0).toFixed(2)}`}
              />
              <InfoItem
                label="Current Wallet"
                value={`$ ${parseFloat(user_profile?.tr03_inc_wallet || 0).toFixed(2)}`}
              />

              <InfoItem label="Registration Date" value={user_profile?.tr03_reg_date ? new Date(user_profile.tr03_reg_date).toLocaleDateString() : 'N/A'} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              {/* <button className="bg-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-500 transition">Wallet is Connected (0 USDT)</button> */}
              <button className="border border-white/20 px-4 py-2 rounded-md text-sm hover:bg-white/10"
                onClick={() => functionTOCopy(frontend + "/register?referral_id=" + user_profile?.lgn_cust_id)}>Refer</button>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl font-bold mb-4">Wallet Details</h2>
          <div className=" bg-custom-bg bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01]">
            <div className="text-center mb-6">
              <p className="text-sm">Total Income:</p>
              <p className="text-3xl font-extrabold text-green-400">
                {Number(user_profile?.tr03_total_income || 0).toFixed(4)} <span className="text-sm text-white">USDT</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <IncomeItem label="SUB Direct Income" value={user_count_dashborad?.DIRECT || 0} />
              <IncomeItem label="SUB Level Income" value={user_count_dashborad?.LEVEL || 0} />
              <IncomeItem label="MILESTONE Income" value={user_count_dashborad?.MILESTONE || 0} />
              <IncomeItem label="NFT Trading Income" value={user_count_dashborad?.NFT_TRAD || 0} />
              {/* <IncomeItem label="NFT Sell" value={user_count_dashborad?.NFT_SELL || 0} />
              <IncomeItem label="NFT Buy" value={user_count_dashborad?.NFT_BUY || 0} /> */}
              <IncomeItem label="NFT Level Income" value={user_count_dashborad?.NFT_LEVEL || 0} />
              <IncomeItem label=" Delay Compensation" value={user_count_dashborad?.NFT_DELAY_COM_ROI || 0} />
              {/* <IncomeItem label="Cashback" value={user_count_dashborad?.CASHBACK || 0} />
              <IncomeItem label="Paying" value={user_count_dashborad?.INCOME_IN || 0} />
              <IncomeItem label="Payout" value={user_count_dashborad?.INCOME_OUT || 0} /> */}
            </div>
          </div>
        </div>
      </div>
      {/* NFT List Section */}
      {user_nft?.length > 0 && (
        <div className="mt-10">
          <h2 className="text-3xl font-bold mb-4"> NFT Market Place</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {user_nft?.filter(nft => nft?.m02_is_reserved === 0)
              ?.map((nft) => (
                <div
                  key={nft.m02_id}
                  className="bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="rounded-lg overflow-hidden mb-4 border border-green-400">
                    <img
                      src={domain + nft.m01_image}
                      alt={nft.m01_name}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <p className="text-lg text-gray-300 mb-2">Buy NFT</p>
                  <div className="flex justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm text-gray-300">Current Bid</p>
                      <p className="text-lg font-bold mb-4 text-white">
                        {Number(nft.m02_curr_price).toFixed(4)} USDT
                      </p> </div>

                    <button
                      onClick={() => tradingfn(nft?.m02_id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold h-fit p-2 rounded transition w-fit"
                    >
                      Place Bid
                    </button></div>
                </div>

              ))}
          </div>

        </div>
      )}

    </div>
  );
};

// Reusable Info Component
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col break-words">
    <span className="text-[13px] text-white/80">{label}</span>
    <span className="text-[17px] text-white break-words whitespace-normal">{value}</span>
  </div>
);



// Reusable Income Component
const IncomeItem = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <FaChartLine className="text-green-400 mt-1" />
    <div>
      <p className="text-[10px] ">{label}</p>
      <p className="text-[14px] text-green-400 font-semibold">{Number(value).toFixed(2)} <span className="text-xs text-gray-300">USDT</span></p>
    </div>
  </div>
);

export default Dashboard;
