import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";
import Loader from "../../Shared/Loader";
import { useQuery, useQueryClient } from "react-query";

const NFTAssign = () => {
    const [loading, setLoading] = useState(false);
    const client = useQueryClient();
    const [data, setData] = useState("");

    const [formData, setFormData] = useState({
        cust_id: "",
        nft_id: "",
    });
    const resetForm = () => {
        setFormData({
            cust_id: "",
            nft_id: "",
        });
    };

    const handleSubmit = async () => {
        const { cust_id, nft_id } = formData;
        if (!cust_id || !nft_id) {
            toast.error("All fields are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await apiConnectorPost(endpoint.assign_nft_by_admin, {
                cust_id,
                nft_id
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                client.refetchQueries("get_nft_details")
                client.refetchQueries("get_nft_dropdown")
                resetForm();
            }
        } catch {
            toast.error("Creation failed.");
        } finally {
            setLoading(false);
        }
    };

    const Customerfunction = async () => {
        const reqbody = { customer_id: formData.cust_id };
        try {
            const res = await apiConnectorPost(endpoint?.customer_api, reqbody);
            setData(res?.data?.result?.[0]);
        } catch (e) {
            console.log("Something went wrong");
        }
    };

    useEffect(() => {
        Customerfunction();
    }, [formData.cust_id]);

    const { data: cat } = useQuery(
        ['get_nft_dropdown'],
        () => apiConnectorGet(endpoint.get_nft_dropdown),
        {
            refetchOnMount: true,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );
    const categories = cat?.data?.result || [];

    return (
        <div className="p-6">
            <Loader isLoading={loading} />

            <div className=" flex items-center justify-center p-4 z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                    <h2 className="text-xl font-semibold text-center mb-4">
                        Assign NFT
                    </h2>
                    <input
                        placeholder="UserID"
                        value={formData.cust_id}
                        onChange={(e) =>
                            setFormData({ ...formData, cust_id: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                    />
                    <span className="text-sm text-gray-600 px-2">{data?.lgn_name}</span>

                    <select
                        value={formData.nft_id}
                        onChange={(e) =>
                            setFormData({ ...formData, nft_id: e.target.value })
                        }
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Select NFT</option>
                        {categories.map((cat) => (
                            <option key={cat.m02_id} value={cat.m02_id}>
                                <span className="!text-green-400">{cat.m02_dist_id}</span>
                                &nbsp;  {cat.m01_name} {cat.m02_curr_nft_id}
                            </option>
                        ))}
                    </select>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                resetForm();
                            }}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading
                                ? "Saving..."
                                : "Save"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default NFTAssign;
