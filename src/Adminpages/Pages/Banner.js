import React, { useEffect, useState } from "react";
import { domain, endpoint } from "../../utils/APIRoutes";
import toast from "react-hot-toast";
import { DeleteForever, Edit } from "@mui/icons-material";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { Switch } from "@mui/material";
import Loader from "../../Shared/Loader";
import { useQuery, useQueryClient } from "react-query";

const NFTIAMGE = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const client = useQueryClient();
    const [formData, setFormData] = useState({
        m01_id: "",
        m01_name: "",
        file: null,
    });

    const { data, isLoading } = useQuery(
        ['get_nft_image'],
        () => apiConnectorGet(endpoint.get_nft_image),
        {
            refetchOnMount: true,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );
    const categories = data?.data?.result || [];


    const resetForm = () => {
        setFormData({ m01_id: "", m01_name: "", file: null });
        setSelectedNFT(null);
    };

    const handleSubmit = async () => {
        const { m01_name, file, m01_id } = formData;
        if (!m01_name || !file) {
            toast.error("Name and image are required.");
            return;
        }
        setLoading(true);
        const formPayload = new FormData();
        formPayload.append("m01_name", m01_name);
        formPayload.append("file", file);
        if (selectedNFT) {
            formPayload.append("m01_id", m01_id);
        }
        const apiUrl = selectedNFT ? endpoint.update_nft_image : endpoint.create_nft_image;
        try {
            const res = await apiConnectorPost(apiUrl, formPayload, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                client.refetchQueries("get_nft_image")
                setModalOpen(false);
                resetForm();
            }
        } catch {
            toast.error("Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setSelectedNFT(cat);
        setFormData({
            m01_id: cat.m01_id,
            m01_name: cat.m01_name,
            file: null, 
        });
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            const res = await apiConnectorPost(endpoint.delete_nft_image, {
                m01_id: id,
            });
            toast(res?.data?.message);
            client.refetchQueries("get_nft_image")
        } catch {
            toast.error("Delete failed.");
        }
    };

    return (
        <div className="p-6">
            <Loader isLoading={loading} />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">NFT Gallery</h1>
                <button
                    onClick={() => {
                        setModalOpen(true);
                        resetForm();
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Add Gallery
                </button>
            </div>

            <div className="shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50 text-black">
                        <tr>
                            <th className="px-4 py-3 text-left">S.No</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Image</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((cat, index) => (
                            <tr key={cat.m01_id} className="border-t">
                                <td className="px-4 py-2">{index + 1}</td>
                                <td className="px-4 py-2">{cat.m01_name}</td>
                                <td className="px-4 py-2">
                                    <img
                                        src={domain + cat.m01_image}
                                        alt="NFT"
                                        className="w-16 h-auto rounded"
                                    />
                                </td>
                                <td className="px-4 py-2 space-x-2">
                                    <button
                                        onClick={() => handleEdit(cat)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        <Edit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(cat.m01_id)}
                                        className="text-red-600 hover:underline"
                                    >
                                        <DeleteForever />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-gray-500">
                                    No categories found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                        <h2 className="text-xl font-semibold">
                            {selectedNFT ? "Edit NFT Image" : "Add NFT Image"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Enter NFT Image name"
                            value={formData.m01_name}
                            onChange={(e) =>
                                setFormData({ ...formData, m01_name: e.target.value })
                            }
                            className="w-full border p-2 rounded"
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setFormData({ ...formData, file: e.target.files[0] })
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

export default NFTIAMGE;
