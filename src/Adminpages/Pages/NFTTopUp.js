import { Button, CircularProgress, TextareaAutosize, TextField } from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";

const NFTPTopUp = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState("");

  const initialValues = {
    user_id: "",
    req_amount: "",
    u_description: "", 
  };

  const fk = useFormik({
    initialValues,
    enableReinitialize: true,
    onSubmit: () => {
      const reqbody = {
        req_amount: fk.values.amount, 
        user_id: fk.values.user_id,
        u_description: fk.values.u_description,
      };
      TopUpFn(reqbody);
    },
  });

  async function TopUpFn(reqbody) {
    try {
      setLoading(true);
      const res = await apiConnectorPost(endpoint?.member_topup_nft_wallet_admin, reqbody);
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


  return (
    <div className="flex justify-center items-center w-full">
      <div className="p-5 lg:w-1/2 md:w-3/4 w-full bg-white bg-opacity-90 rounded-lg shadow-md">
        <p className="text-center font-bold py-4 text-lg">Add NFT TopUp</p>

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

            <div>
              <p className="my-2 font-bold">Amount</p>
              <TextField
                fullWidth
                name="amount"
                id="amount"
                placeholder="Enter Amount"
                value={fk.values.amount}
                onChange={fk.handleChange}
              />
            </div>
             <div>
              <p className="my-2 font-bold">Description</p>
              <TextareaAutosize
              minRows={3}
              style={{width:500}}
                fullWidth
                className="py-1"
                name="u_description"
                id="u_description"
                placeholder="Enter Description"
                value={fk.values.u_description}
                onChange={fk.handleChange}
              />
            </div>
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

export default NFTPTopUp;
