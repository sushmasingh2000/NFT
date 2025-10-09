import { useQuery } from "react-query";
import moment from "moment";
import {
  FaChartLine,
  FaDollarSign,
  FaSitemap,
  FaUserFriends,
  FaUsers
} from "react-icons/fa";
import { apiConnectorGet } from "../utils/APIConnector";
import { endpoint } from "../utils/APIRoutes";
import { useState } from "react";
import copy from "copy-to-clipboard";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [showPopup, setShowPopup] = useState(true);

  const { data } = useQuery(["get_dashboard"], () =>
    apiConnectorGet(endpoint?.dashboard_data)
  );
  const dashboard = data?.data?.result?.[0];

  const { data: profile } = useQuery(["get_profile"], () =>
    apiConnectorGet(endpoint?.member_profile_detail)
  );
  const user_profile = profile?.data?.result?.[0] || {};

  const copyToClipboard = (value) => {
    copy(value);
    toast.success("Copied to clipboard!", { id: 1 });
  };

  return (
    <div className=" bg-black text-white p-6 ">
      <div className="flex flex-col lg:flex-row gap-8 my-[39px]">

        {/* Left Card */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl font-bold mb-4">Buy NFT</h2>
          <div className="bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#141e30] bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01] shadow-teal-300/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold">User Details</h3>
              <button className="px-4 py-1 border border-white/20 rounded-md text-sm hover:bg-white/10">Upgrade</button>
            </div>

            <p className="text-center text-lg font-semibold mb-6">User ID: 5601</p>

            {/* User Info Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm font-medium">
              <InfoItem label="Current Subscription" value={dashboard?.subscription || 'Basic'} />
              <InfoItem label="Total Limit" value={dashboard?.total_limit || 500} />
              <InfoItem label="Total Limit Utilised" value={dashboard?.utilised_limit || 250} />
              <InfoItem label="Limit Open Time" value={dashboard?.limit_open_time || 'N/A'} />
              <InfoItem label="Today's Income" value={dashboard?.todays_income || '3.2899'} />
              <InfoItem label="My Team" value={dashboard?.team_count || 10} />
              <InfoItem label="My Direct Team" value={dashboard?.direct_team_count || 5} />
              <InfoItem label="Time Remaining" value={dashboard?.time_remaining || '6H 34M 0S'} />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button className="bg-blue-600 px-4 py-2 rounded-md text-sm hover:bg-blue-500 transition">Wallet is Connected (0 USDT)</button>
              <button className="border border-white/20 px-4 py-2 rounded-md text-sm hover:bg-white/10">Refer</button>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="w-full lg:w-1/2">
          <h2 className="text-3xl font-bold mb-4">Wallet Details</h2>
           <div className="bg-gradient-to-br from-[#141e30] via-[#243b55] to-[#141e30] bg-opacity-60 backdrop-blur-md border border-white/10 shadow-xl rounded-xl p-6 transition duration-500 ease-in-out hover:scale-[1.01] shadow-red-300/50">
            <div className="text-center mb-6">
              <p className="text-sm">Total Income:</p>
              <p className="text-3xl font-extrabold text-green-400">
                {Number(dashboard?.total_income || 230.1406).toFixed(4)} <span className="text-sm text-white">USDT</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <IncomeItem label="SUB Direct Income" value={dashboard?.sub_direct_income || 12} />
              <IncomeItem label="SUB Level Income" value={dashboard?.sub_level_income || 2.6} />
              <IncomeItem label="NFT Trading Income" value={dashboard?.nft_trading_income || 199.5804} />
              <IncomeItem label="NFT Level Income" value={dashboard?.nft_level_income || 15.9602} />
              <IncomeItem label="NFT Return Principal" value={dashboard?.nft_return_principal || 6652.6796} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Info Component
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col">
    <p className="text-[13px] text-white/80">{label}</p>
    <p className="text-[17px] text-white font-semibold">{value}</p>
  </div>
);

// Reusable Income Component
const IncomeItem = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <FaChartLine className="text-green-400 mt-1" />
    <div>
      <p className="text-[14px]">{label}</p>
      <p className="text-[18px] text-green-400 font-semibold">{Number(value).toFixed(2)} <span className="text-xs text-gray-300">USDT</span></p>
    </div>
  </div>
);

export default Dashboard;
