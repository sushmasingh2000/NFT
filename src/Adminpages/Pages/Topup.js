import { Button, CircularProgress, TextField } from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";

const TopUp = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");

  const initialValues = {
    user_id: "",
    pkg_id: "",
    amount: "", // added to formik
  };

  const fk = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: () => {
      const reqbody = {
        pkg_amount: fk.values.amount, // use formik value here
        user_id: fk.values.user_id,
        pkg_id: fk.values.pkg_id,
      };
      TopUpFn(reqbody);
    },
  });

  async function TopUpFn(reqbody) {
    try {
      setLoading(true);
      const res = await apiConnectorPost(endpoint?.member_topup_admin, reqbody);
      toast(res?.data?.message);
      if (res?.data?.success) {
        fk.handleReset();
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  }

  const Customerfunction = async () => {
    const reqbody = { customer_id: fk.values.user_id };
    try {
      const res = await apiConnectorPost(endpoint?.customer_api, reqbody);
      setData(res?.data?.result?.[0]);
    } catch (e) {
      console.log("Something went wrong");
    }
  };

  useEffect(() => {
    Customerfunction();
  }, [fk.values.user_id]);

  const { data: pck } = useQuery(
    ['get_package'],
    () => apiConnectorGet(endpoint.get_package),
    {
      refetchOnMount: true,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );

  const fetchedData = pck?.data?.result || [];


  return (
    <div className="flex justify-center items-center w-full">
      <div className="p-5 lg:w-1/2 md:w-3/4 w-full bg-white bg-opacity-90 rounded-lg shadow-md">
        <p className="text-center font-bold py-4 text-lg">Add TopUp</p>

        <div className="grid grid-cols-1 gap-y-6">
          {/* User ID Input */}
          <div>
            <p>User ID</p>
            <TextField
              fullWidth
              id="user_id"
              name="user_id"
              placeholder="Enter User ID"
              value={fk.values.user_id}
              onChange={fk.handleChange}
            />
            <span className="text-sm text-gray-600 px-2">{data?.lgn_name}</span>
          </div>

          {/* Package Selection */}
          <div>
            <p>Select Package</p>
            <select
              name="pkg_id"
              value={fk.values.pkg_id}
              onChange={(e) => {
                const pkg_id = e.target.value;
                fk.setFieldValue("pkg_id", pkg_id);

                const selectedPkg = fetchedData.find(
                  (pkg) => String(pkg.m03_pkg_id) === String(pkg_id)
                );

                if (selectedPkg) {
                  const amount = Number(selectedPkg.m03_pkg_amount);
                  fk.setFieldValue("amount", amount); 
                } else {
                  fk.setFieldValue("amount", "");
                }
              }}
              className="w-full p-2 py-5 text-sm rounded-md bg-gray-100 border border-gray-300 text-black focus:ring focus:ring-blue-400 outline-none"
            >
              <option value="">-- Select Package --</option>
              {fetchedData.map((pkg) => (
                <option key={pkg.m03_pkg_id} value={pkg.m03_pkg_id}>
                  ${parseFloat(pkg.m03_pkg_amount)}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-filled Amount */}
          {fk.values.amount && (
            <div>
              <p className="my-2 font-bold">Amount</p>
              <TextField
                fullWidth
                value={fk.values.amount}
                disabled
              />
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => fk.handleReset()} variant="contained" className="!bg-[#E74C3C]">
            Clear
          </Button>
          <Button onClick={() => fk.handleSubmit()} variant="contained" className="!bg-[rgb(97,106,228)]">
          {loading ? "Submit..." : "Submit"}  
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopUp;
