import { useFormik } from "formik";
import moment from "moment";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { getRemainingTime } from "../../../Shared/CustomeTimer";
import { apiConnectorGet } from "../../../utils/APIConnector";
import { endpoint } from "../../../utils/APIRoutes";

const Salryfn = () => {
  // const [page, setPage] = useState(1);
  // const client = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(getRemainingTime());

  const initialValues = {
    income_type: "",
    search: "",
    page: "",
    start_date: "",
    end_date: "",
  };

  const fk = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
  });
  // const { data, isLoading } = useQuery(
  //   [
  //     "get_milestone",
  //     fk.values.search,
  //     fk.values.start_date,
  //     fk.values.end_date,
  //     page,
  //   ],
  //   () =>
  //     apiConnectorPost(endpoint?.roi_income_api, {
  //       income_type: "MILESTONE",
  //       search: fk.values.search,
  //       start_date: fk.values.start_date,
  //       end_date: fk.values.end_date,
  //       page: page,
  //       wallet_type: "INCOME",

  //       count: 10,
  //     }),
  //   {
  //     keepPreviousData: true,
  //     refetchOnMount: false,
  //     refetchOnReconnect: false,
  //     refetchOnWindowFocus: false,
  //     onError: (err) => console.error("Error fetching direct data:", err),
  //   }
  // );

  // const allData = data?.data?.result || [];

  const { data: profile } = useQuery(
    ["get_profile_user"],
    () => apiConnectorGet(endpoint?.member_profile_detail),
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: true,
      retry: true,
    }
  );
  const user_profile = profile?.data?.result?.[0] || {};

  const rankDate = moment(user_profile?.tr03_rank_date);
  const today = moment();

  // difference in days from rank date to today
  const diffDays = today.diff(rankDate, "days");

  // decide which date to show
  const displayDate =
    diffDays <= 15 ? rankDate.add(15, "days") : rankDate.add(30, "days");

  useEffect(() => {
    const endDate = displayDate;
    const interval = setInterval(() => {
      const updated = getRemainingTime(endDate);
      setTimeLeft(updated);
      if (updated.totalSec <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className=" p-3">
        <h2 className="text-xl font-extrabold mb-4 text-black">
          MileStone Reward
        </h2>
      </div>
      <div className="bg-custom-bg p-4 rounded-lg shadow-md text-white space-y-3 w-full max-w-lg">
        <h3 className="text-lg font-bold text-yellow-400">
          🎉 Milestone Achieved
        </h3>
        <div className="flex justify-between items-center gap-10 ">
          <div className="flex flex-col justify-start  gap-2">
            <p>
              <strong>Achieve Date:</strong>{" "}
            </p>
            <p>
              <strong>Release Date:</strong>{" "}
            </p>
            <p>
              <strong>Amount:</strong>
            </p>
            <p>
              <strong>Rank:</strong>
            </p>
          </div>
          <div className="flex flex-col justify-start  gap-2">
            <p>
              {user_profile?.tr03_rank_date
                ? moment(user_profile.tr03_rank_date)?.format("DD-MM-YYYY")
                : "--"}
            </p>
            <p>
              {" "}
              {user_profile?.tr03_rank_date
                ? displayDate.format("DD-MM-YYYY")
                : "--"}
            </p>
            <p> ${Number(user_profile.m06_income || 0)?.toFixed(2)}</p>
            <p>{user_profile.m06_name || "--"}</p>
          </div>
        </div>

        {user_profile?.tr03_rank_date && (
          <div className="text-rose-500 font-mono text-lg">
            ⏰ {timeLeft.hrs}H:{timeLeft.mins}M:{timeLeft.secs}S
          </div>
        )}
      </div>
    </div>
  );
};

export default Salryfn;
