import React from "react";
import { useQuery } from "react-query";
import { apiConnectorGet } from "../../../utils/APIConnector";
import { dollar, endpoint } from "../../../utils/APIRoutes";

const Dashboard = () => {
  const { data } = useQuery(
    ["get_admin"],
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
    { label: "Active Member", value: dashboard?.active_member || 0 },
    { label: "Total Member", value: dashboard?.total_member || 0 },
    { label: "Total NFT", value: dashboard?.total_nft },
    { label: "Current Bought NFT", value: dashboard?.current_bought_nft },
    { label: "Current Sell NFT", value: dashboard?.current_sell_nft },
    { label: "Current Sold NFT", value: dashboard?.current_sold_nft },
    { label: "Direct Income", value: `${dollar} ${Number(dashboard?.DIRECT || 0).toFixed(5)}` },
    { label: "Level Income", value: `${dollar} ${Number(dashboard?.LEVEL || 0).toFixed(5)}` },
    { label: "Milestone Income", value: `${dollar} ${Number(dashboard?.MILESTONE || 0).toFixed(5)}` },
    { label: "NFT Trade Income", value: `${dollar} ${Number(dashboard?.NFT_TRAD || 0).toFixed(5)}` },
    { label: "NFT Delay ROI Income", value: `${dollar} ${Number(dashboard?.NFT_DELAY_COM_ROI || 0).toFixed(5)}` },
    { label: "NFT Level Income", value: `${dollar} ${Number(dashboard?.NFT_LEVEL || 0).toFixed(5)}` },
    { label: "NFT Buy", value: `${dollar} ${Number(dashboard?.NFT_BUY || 0).toFixed(2)}` },
    { label: "NFT Sell", value: `${dollar} ${Number(dashboard?.NFT_SELL || 0).toFixed(2)}` },
    { label: "Paying", value: `${dollar} ${Number(dashboard?.INCOME_IN || 0).toFixed(2)}` },
    { label: "Payout", value: `${dollar} ${Number(dashboard?.INCOME_OUT || 0).toFixed(2)}` },
    { label: "Cashback Income", value: `${dollar} ${Number(dashboard?.CASHBACK || 0).toFixed(5)}` },



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
