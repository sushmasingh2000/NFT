import React from "react";
import { useQuery } from "react-query";
import { apiConnectorGet } from "../../../utils/APIConnector";
import { dollar, endpoint } from "../../../utils/APIRoutes";

const Dashboard = () => {
  const { data } = useQuery(
    ['get_admin'],
    () => apiConnectorGet(endpoint?.admin_dashboard),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onError: (err) => console.error("Error fetching dashboard data:", err),
    }
  );

  const dashboard = data?.data?.result?.[0] || {};

  const stats = [
    { label: "Total Customer", value: dashboard?.total_customer || 0 },
    // { label: "Current Topup Amount", value: `${dollar} ${dashboard?.curr_topup || 0}` },
    { label: "Total Invester Amount", value: `${dollar} ${dashboard?.total_trader_amount || 0}` },
    { label: "Verified Invester Account", value: dashboard?.verified_trader || 0} ,
    { label: "Payout Wallet ", value: dashboard?.payout_wallet || 0} ,
    { label: "Success Payout Amount", value: `${dollar} ${Number(dashboard?.success_payout)?.toFixed(2) || 0}`},
    { label: "Pending Payout Amount", value: `${dollar} ${Number(dashboard?.pending_payout)?.toFixed(2) || 0}`},
    { label: "Pending Invester Account", value: dashboard?.pending_trader || 0 },
    { label: "Rejected Invester Account", value: dashboard?.rejected_trader || 0 },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-white/80 rounded-lg shadow-md p-4 border border-gray-300 backdrop-blur-sm"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <h3 className="text-lg font-bold text-blue-900">{item.value}</h3>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
