import { useFormik } from 'formik';
import moment from 'moment';
import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import CustomTable from '../../../Shared/CustomTable';
import CustomToPagination from '../../../Shared/Pagination';
import { apiConnectorPost } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';

const Level = () => {
  const [page, setPage] = useState(1)
  const client = useQueryClient();
  const initialValues = {
    income_type: "",
    search: '',
    page: "",
    start_date: '',
    end_date: '',
    level_id : "2"
  };

  const fk = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,

  })
  const { data, isLoading } = useQuery(
    ['get_level', fk.values.search, fk.values.start_date, fk.values.end_date, page , fk.values.level_id],
    () =>
      apiConnectorPost(endpoint?.roi_income_api, {
        income_type: 'LEVEL',
        search: fk.values.search,
        start_date: fk.values.start_date,
        end_date: fk.values.end_date,
        page: page,
        wallet_type: "INCOME",
        count: 10,
        level: fk.values.level_id,
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
    <span>User Id</span>,
    <span>User Name</span>,
    <span>Amount ($)</span>,
    // <span>TopUp Wallet</span>,
    // <span>Description</span>,
  ];
  const tablerow = allData?.data?.map((row, index) => {
    return [
      <span> {(page - 1) * 10 + index + 1}</span>,
      <span>{moment(row.tr07_created_at)?.format("DD-MM-YYYY")}</span>,
      <span>{row?.from_cust_id || "--"}</span>,
      <span>{row.from_name}</span>,
      <span> {Number(row.tr07_amount || 0)?.toFixed(4) || '$0.00'}</span>,
      // <span>{Number(row.jnr_topup_wallet)?.toFixed(2) || '--'}</span>,
      // <span>{row.ledger_des || '--'}</span>,
    ];
  });
  return (
    <div className="p-2">
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-200">Package Level Income</h2>

        <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
          {/* <TextField
            type="date"
            label="Start Date"
            name="start_date"
            id="start_date"
            value={fk.values.start_date}
            onChange={fk.handleChange}
            InputLabelProps={{
              shrink: true,
              style: { color: '#fff' },
            }}
            inputProps={{
              style: { color: '#fff' },
            }}
            className="bg-gray-700 border border-gray-600 rounded-md  text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />

          <TextField
            label="End Date"
            type="date"
            name="end_date"
            id="end_date"
            value={fk.values.end_date}
            onChange={fk.handleChange}
             InputLabelProps={{
              shrink: true,
              style: { color: '#fff' },
            }}
            inputProps={{
              style: { color: '#fff' },
            }}
            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          /> */}
       

          <input
            type="text"
            name="search"
            id="search"
            value={fk.values.search}
            onChange={fk.handleChange}
            placeholder="Search By User"
            className="bg-gray-700 border border-gray-600 rounded-full py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
          />
          <button
            onClick={() => {
              setPage(1);
              client.invalidateQueries(["get_level"]);
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
         <div className="grid grid-cols-4 lg:grid-cols-8  gap-3 mt-5">
            {[ 2, 3, 4 , 5 , 6 ,7,8,9,10,11,12,13,14,,15,16,17,18,19,20].map((lvl) => (
              <button
                key={lvl}
                onClick={() => fk.setFieldValue("level_id", lvl)}
                className={`py-2 px-4 rounded ${fk.values.level_id == lvl
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300"
                  } hover:bg-blue-500`}
              >
                Level {lvl}
              </button>
            ))}
          </div>
      </div>


      {/* Main Table Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-3 text-white border border-gray-700">
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
    </div>
  );
};

export default Level;
