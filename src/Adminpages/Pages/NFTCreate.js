import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DeleteForever, Edit } from "@mui/icons-material";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { domain, endpoint } from "../../utils/APIRoutes";
import Loader from "../../Shared/Loader";
import { useQuery, useQueryClient } from "react-query";
import { Switch } from "@mui/material";
import CustomTable from "../Shared/CustomTable";
import { useFormik } from "formik";
import CustomToPagination from "../../Shared/Pagination";

const NFTTableManager = () => {
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedNFT, setSelectedNFT] = useState(null);
    const [page, setPage] = useState(1)

    const [formData, setFormData] = useState({
        cat_id: "",
        price: "",
        nos: "",
    });
    const client = useQueryClient();

    const initialValues = {
        income_Type: "",
        search: '',
        count: 10,
        page: "",
        start_date: '',
        end_date: '',
    };

    const fk = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,

    })
    const { data } = useQuery(
        ['get_nft_admin', fk.values.search, fk.values.start_date, fk.values.end_date, page],
        () =>
            apiConnectorPost(endpoint?.get_nft_Admin, {
                search: fk.values.search,
                start_date: fk.values.start_date,
                end_date: fk.values.end_date,
                page: page,
                count: 10,
            }),
        {
            keepPreviousData: true,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            onError: (err) => console.error("Error fetching level data:", err),
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
        const {  price, nos } = formData;
        if ( !price || !nos) {
            toast.error("All fields are required.");
            return;
        }
        setLoading(true);
        try {
            const res = await apiConnectorPost(endpoint.create_nft, {
                cat_id : 1,
                price,
                nos,
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                client.refetchQueries("get_nft_admin")
                setModalOpen(false);
                resetForm();
            }

        } catch {
            toast.error("Creation failed.");
        } finally {
            setLoading(false);
        }
    };


    // const { data: cat } = useQuery(
    //     ['get_nft_image'],
    //     () => apiConnectorGet(endpoint.get_nft_image),
    //     {
    //         refetchOnMount: true,
    //         refetchOnReconnect: false,
    //         refetchOnWindowFocus: false,
    //     }
    // );
    // const categories = cat?.data?.result || [];

    const handleStatusToggle = async (nftId) => {
        try {
            setLoading(true);
            const res = await apiConnectorGet(endpoint.update_status_nft, {
                m02_id: nftId,
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                client.refetchQueries("get_nft_admin");
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
        <span>NFT ID</span>,
        <span>Initial Price</span>,
        <span>Current Price</span>,
        <span>Status</span>,
    ];
    const tablerow = NFTs?.data?.map((nft, index) => {
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
            <span>${nft?.m02_curr_price}</span>,
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
                    + Add NFT
                </button>
            </div>
            <div className="flex flex-col sm:flex-wrap md:flex-row items-center gap-3 sm:gap-4 w-full text-sm sm:text-base">
                <input
                    type="date"
                    name="start_date"
                    id="start_date"
                    value={fk.values.start_date}
                    onChange={fk.handleChange}
                    className="bg-white bg-opacity-50 border border-black rounded-md py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                />
                <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    value={fk.values.end_date}
                    onChange={fk.handleChange}
                    className="bg-white bg-opacity-50 border border-black rounded-md py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                />
                <input
                    type="text"
                    name="search"
                    id="search"
                    value={fk.values.search}
                    onChange={fk.handleChange}
                    placeholder="User ID"
                    className="bg-white bg-opacity-50 border border-black rounded-full py-2 px-3 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-sm"
                />
                <button
                    onClick={() => {
                        setPage(1);
                        client.invalidateQueries(["get_nft_admin"]);
                    }}
                    type="submit"
                    className="bg-blue-500 text-gray-900 font-bold py-2 px-4 rounded-full hover:bg-dark-color transition-colors w-full sm:w-auto text-sm"
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

                        {/* <select
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
                        </select> */}


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
            <CustomToPagination data={NFTs} page={page} setPage={setPage} />
        </div>
    );
};

export default NFTTableManager;
