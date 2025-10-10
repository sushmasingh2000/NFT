import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DeleteForever, Edit } from "@mui/icons-material";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { domain, endpoint } from "../../utils/APIRoutes";
import Loader from "../../Shared/Loader";
import { useQuery, useQueryClient } from "react-query";
import { Switch } from "@mui/material";
import CustomTable from "../Shared/CustomTable";

const NFTTableManager = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [formData, setFormData] = useState({
        cat_id: "",
        price: "",
        nos: "",
    });
    const client = useQueryClient();
    // Fetch NFTs
    const { data, isLoading } = useQuery(
        ['get_nft'],
        () => apiConnectorGet(endpoint.get_nft),
        {
            refetchOnMount: true,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );
    const NFTs = data?.data?.result || [];

    const resetForm = () => {
        setFormData({
            cat_id: "",
            price: "",
            nos: "",
        });
        setSelectedNFT(null);
    };

    const handleSubmit = async () => {
        const { cat_id, price, nos } = formData;
        if (!cat_id || !price || !nos) {
            toast.error("All fields are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await apiConnectorPost(endpoint.create_nft, {
                cat_id,
                price,
                nos,
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                client.refetchQueries("get_nft")
                setModalOpen(false);
                resetForm();
            }

        } catch {
            toast.error("Creation failed.");
        } finally {
            setLoading(false);
        }
    };


    const { data: cat } = useQuery(
        ['get_nft_image'],
        () => apiConnectorGet(endpoint.get_nft_image),
        {
            refetchOnMount: true,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );
    const categories = cat?.data?.result || [];

    const handleStatusToggle = async (nftId) => {
        try {
            setLoading(true);
            const res = await apiConnectorGet(endpoint.update_status_nft, {
                m02_id: nftId,
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                client.refetchQueries("get_nft");
            } else {
                toast.error("Failed to update status.");
            }
        } catch (err) {
            toast.error("Error updating status.");
        } finally {
            setLoading(false);
        }
    };
    const tablehead = [
        <span>S.No.</span>,
        <span>Image</span>,
        <span>Category Name</span>,
        <span>Dist ID</span>,
        <span>Initial Price</span>,
        <span>Current Price</span>,
        <span>Status</span>,
    ];
    const tablerow = NFTs?.map((nft, index) => {
        return [
            <span>{index + 1}</span>,
            <span> <img
                src={domain + nft.m01_image}
                alt="NFT"
                className="w-16 h-auto rounded"
            /></span>,
            <span>{nft?.m01_name}</span>,
            <span>{nft?.m02_dist_id}</span>,
            <span>{nft?.m02_init_price}</span>,
            <span>₹{nft?.m02_curr_price}</span>,
            <span><Switch
                checked={nft.m02_curr_status === 1}
                onChange={() => handleStatusToggle(nft.m02_id)}
                color="primary"
            /></span>,
        ];
    });
    return (
        <div className="p-6">
            <Loader isLoading={loading} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">NFT </h1>
                <button
                    onClick={() => {
                        setModalOpen(true);
                        resetForm();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add Animal
                </button>
            </div>

            {/* Table */}
            <div className="shadow rounded-lg overflow-hidden mt-6">
                <CustomTable
                    tablehead={tablehead}
                    tablerow={tablerow}
                    isLoading={loading}
                />
            </div>


            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                        <h2 className="text-xl font-semibold">
                            {selectedNFT ? "Edit NFT" : "Add NFT"}
                        </h2>

                        <select
                            value={formData.cat_id}
                            onChange={(e) =>
                                setFormData({ ...formData, cat_id: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat) => (
                                <option key={cat.m01_id} value={cat.m01_id}>
                                    {cat.m01_name}
                                </option>
                            ))}
                        </select>


                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
                            onChange={(e) =>
                                setFormData({ ...formData, price: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />

                        <input
                            type="number"
                            placeholder="Number of NFTs"
                            value={formData.nos}
                            onChange={(e) =>
                                setFormData({ ...formData, nos: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => {
                                    setModalOpen(false);
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
                                    : selectedNFT
                                        ? "Update"
                                        : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NFTTableManager;
