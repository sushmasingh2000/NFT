// import React, { useState } from 'react';
// import { useQuery, useQueryClient } from 'react-query';
// import { apiConnectorPost } from '../../../utils/APIConnector';
// import { endpoint } from '../../../utils/APIRoutes';
// import CustomTable from '../../../Shared/CustomTable';
// import CustomToPagination from '../../../Shared/Pagination';
// import { useFormik } from 'formik';
// import moment from 'moment';

// const REWARD = () => {
//   const [page, setPage] = useState(1)
//   const client = useQueryClient();
//   const initialValues = {
//     income_type: "",
//     search: '',
//     page: "",
//     start_date: '',
//     end_date: '',
//   };

//   const fk = useFormik({
//     initialValues: initialValues,
//     enableReinitialize: true,

//   })
//   const { data, isLoading } = useQuery(
//     ['get_REWARD', fk.values.search, fk.values.start_date, fk.values.end_date, page],
//     () =>
//       apiConnectorPost(endpoint?.roi_income_api, {
//         income_type: 'REWARD',
//         search: fk.values.search,
//         start_date: fk.values.start_date,
//         end_date: fk.values.end_date,
//         page: page,
//         count: 10,
//       }),
//     {
//       keepPreviousData: true,
//       refetchOnMount: false,
//       refetchOnReconnect: false,
//       refetchOnWindowFocus: false,
//       onError: (err) => console.error("Error fetching ROI data:", err),
//     }
//   );

//   const allData = data?.data?.result || [];

//  const tablehead = [
//     <span>S.No.</span>,
//     <span>Date</span>,
//     // <span>Customer Id</span>,
//     <span>Amount ($)</span>,
//     <span>TopUp Wallet</span>,
//     // <span>User Name</span>,
//     // <span>Mobile</span>,
//     <span>Description</span>,
//   ];
//   const tablerow = allData?.data?.map((row, index) => {
//     return [
//      <span> {(page - 1) * 10 + index + 1}</span>,
//       <span>{moment(row.ledger_created_at)?.format("DD-MM-YYYY")}</span>,
//       // <span>{row.lgn_cust_id || "--"}</span>,
//       <span> {Number(row.ledger_amount || 0)?.toFixed(2) || '$0.00'}</span>,
//       <span>{Number(row.jnr_topup_wallet)?.toFixed(2) || '--'}</span>,
//       // <span>{row.jnr_name}</span>,
//       // <span>{row.lgn_mobile || '--'}</span>,
//       <span>{row.ledger_des || '--'}</span>,


//     ];
//   });
//   return (
//     <div className="p-2">
//       <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
//         <h2 className="text-xl font-semibold mb-4 text-gray-200">Reward Income</h2>

//         <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
//           <input
//             type="date"
//             name="start_date"
//             id="start_date"
//             value={fk.values.start_date}
//             onChange={fk.handleChange}
//             className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
//           />
//           <input
//             type="date"
//             name="end_date"
//             id="end_date"
//             value={fk.values.end_date}
//             onChange={fk.handleChange}
//             className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
//           />
//           <input
//             type="text"
//             name="search"
//             id="search"
//             value={fk.values.search}
//             onChange={fk.handleChange}
//             placeholder="User ID"
//             className="bg-gray-700 border border-gray-600 rounded-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
//           />
//           <button
//             onClick={() => {
//               setPage(1);
//               client.invalidateQueries(["get_roi"]);
//             }}
//             type="submit"
//             className="bg-gold-color text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-dark-color transition-colors w-full sm:w-auto text-sm"
//           >
//             Search
//           </button>
//           <button
//             onClick={() => {
//               fk.handleReset();
//               setPage(1);
//             }}
//             className="bg-gray-color text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-black hover:text-white transition-colors w-full sm:w-auto text-sm"
//           >
//             Clear
//           </button>
//         </div>
//       </div>


//       {/* Main Table Section */}
//       <div className="bg-gray-800 rounded-lg  example shadow-lg p-3 text-white border border-gray-700">
//         <CustomTable
//           tablehead={tablehead}
//           tablerow={tablerow}
//           isLoading={isLoading}
//         />


//         {/* Pagination */}
//         <CustomToPagination
//           page={page}
//           setPage={setPage}
//           data={allData}
//         />
//       </div>
//     </div>
//   );
// };

// export default REWARD;

import React, { useState } from 'react';
import CustomTable from '../../../Shared/CustomTable'; // Assuming you have a custom table component
import { apiConnectorGet } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';
import { useQuery } from 'react-query';

const REWARD = () => {
 
     const { data: profile, refetch: refetchProfile } = useQuery( // Added refetch
          ["get_profile"],
          () => apiConnectorGet(endpoint?.member_profile_detail),
          {
              refetchOnMount: false,
              refetchOnReconnect: false,
              refetchOnWindowFocus: false,
          }
      );
      const user_profile = profile?.data?.result?.[0] || {};
      const jnr_rank = Number(user_profile?.jnr_curr_rank) || 0;

  const tablerow = [
    ["Bronze", 50, "$50", "Pending"],
    ["Silver", 100, "$100", "Pending"],
    ["Gold", 250, "$250", "Pending"],
    ["Platinum", 500, "$500", "Pending"],
    ["Diamond", 1000, "$1000", "Pending"],
    ["Sapphire", 2500, "$2500", "Pending"],
    ["Ruby", 5000, "$5000", "Pending"],
    ["Emerald", 10000, "$10000", "Pending"],
    ["Crown Diamond", 15000, "$15000", "Pending"],
    ["Royal Ambassador", 25000, "$25000", "Pending"],
    ["Grand Crown", 50000, "$50000", "Pending"],
    ["Infinite", 100000, "$100000", "Pending"],
  ];

  // Table header
 const tablehead = [
  <div className="text-center w-full">S.No</div>,
  <div className="text-center w-full">Rank</div>,
  <div className="text-center w-full">Team (40:60)</div>,
  <div className="text-center w-full">Reward</div>,
  <div className="text-center w-full">Status</div>,
];


  // Mapping the table rows to display data
const updatedTablerow = tablerow.map((row, index) => {
  const isAchieved = index < jnr_rank; // Check if this row is achieved
  return [
    <span>{index + 1}</span>,  // S.No
    <span>{row[0]}</span>,     // Rank
    <span>{row[1]}</span>,     // Team Points
    <span>{row[2]}</span>,     // Reward
    <span className={`font-semibold ${isAchieved ? 'text-green-400' : 'text-yellow-400'}`}>
      {isAchieved ? 'Success' : 'Pending'}
    </span>,
  ];
});

  return (
    <div className="p-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Reward Income</h2>

        {/* Static Table with Rank, Points, Reward, and Status */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border text-center border-gray-700">
          <CustomTable
            tablehead={tablehead}
            tablerow={updatedTablerow}
            isLoading={false}  // No loading since we are using static data
          />
        </div>
      </div>
    </div>
  );
};

export default REWARD;

