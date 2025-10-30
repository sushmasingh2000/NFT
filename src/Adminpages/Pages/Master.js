import { Button, Switch, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';
import { apiConnectorGet, apiConnectorPost } from '../../utils/APIConnector';
import { endpoint } from '../../utils/APIRoutes';
import Loader from '../../Shared/Loader';
import moment from 'moment';
import { getRemainingTime } from '../../Shared/CustomeTimer';

const Master = () => {
    const [configData, setConfigData] = useState([]);
    const [loading, setloading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(getRemainingTime());

    const client = useQueryClient("master_data")

    const { data, isLoading } = useQuery(
        ['master_data'],
        () => apiConnectorGet(endpoint.master_data),
        {
            refetchOnMount: true,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );
    const fetchedData = data?.data?.result || [];

    useEffect(() => {
        setConfigData(fetchedData);
    }, [fetchedData])


    useEffect(() => {
        if (!configData?.[0]?.m00_updated_at) return;
        const startMoment = moment.utc(configData[0].m00_updated_at);
        const targetMoment = startMoment.clone().add(48, "hours");
        let interval;
        const updateTimer = () => {
            const now = new Date();
            const totalSec = Math.max(
                Math.floor((targetMoment.toDate() - now) / 1000),
                0
            );
            const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
            const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
            const secs = String(totalSec % 60).padStart(2, "0");
            setTimeLeft({ hrs, mins, secs, totalSec });
            if (totalSec <= 0 && interval) {
                clearInterval(interval);
            }
        };
        updateTimer();
        interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [configData?.[0]?.m00_updated_at]);


    const handleValueUpdate = async (index) => {
        const config = configData[index];
        let status_type = "";

        if (config.config_title === "IS_REAL_LAUNCHING") {
            status_type = "launching";
        }

        const formData = new FormData();
        formData.append("u_id", config.m00_id);
        formData.append("status_type", "launching");
        try {
            setloading(true)
            const response = await apiConnectorPost(endpoint.change_general_status, formData);
            setloading(false)
            if (response?.data?.success) {
                toast(response?.data?.message, { id: 1 });
            }
            client.refetchQueries("master_data")
        } catch (error) {
            console.error("Error:", error);
            toast("Something went wrong.", { id: 1 });
        }
        setloading(false)
    };




    return (
        <div className="p-4">
            <Loader isLoading={isLoading || loading} />
            <h2 className="text-xl font-bold mb-4">Master Configurations</h2>
            <div className='flex justify-end mb-5' >
                <span className="flex items-center gap-2 text-white px-4 py-2 rounded-full shadow-md border border-green-500 animate-pulse text-base sm:text-lg">
                    🕔
                    <span className="font-mono text-lg sm:text-xl">
                        {timeLeft.hrs}:{timeLeft.mins}:{timeLeft.secs}
                    </span>
                </span>
            </div>
            <table className="w-full table-auto text-center border border-gray-300">
                <thead>
                    <tr className="bg-gray-100 text-black">
                        <th className="border px-4 py-2">S.No.</th>
                        <th className="border px-4 py-2">Title</th>
                        {/* <th className="border px-4 py-2">Status / Value</th> */}
                        <th className="border px-4 py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {configData.map((config, index) => {
                        const title = config.m00_title;

                        return (
                            <tr key={config.config_id}>
                                <td className="border px-4 py-2">{index + 1}</td>
                                <td className="border px-4 py-2">
                                    {
                                        title === 'IS_REAL_LAUNCHING' ? "Real Launching " :
                                            title === 'LEVEL_CLOSING' ? "Level Closing" :
                                                title === 'WITHDRAWAL' ? "Payout" :
                                                    title === 'TOTAL_PROFIT' ? "Total Profit" :
                                                        title === 'POPUP_IMAGE' ? "PopUp Image" :
                                                            title === 'POPUP_IMAGE_STATUS' ? "PopUp Image Status" :
                                                                title === 'GROUP_TYPE' ? "Group" :
                                                                    title === 'NEWS_UPDATEs' ? "News Updates" :  // 👈 Add this
                                                                        title
                                    }
                                </td>
                                {/* 
                                <td className="border px-4 py-2">
                                    {title === "LEVEL_PERCENTAGE" || title === "TOTAL_PROFIT" ? (
                                        <TextField
                                            type="number"
                                            value={config.config_value || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            size="small"
                                            style={{ width: 100 }}
                                        />
                                    ) : title === "POPUP_IMAGE" ? (
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleInputChange(index, e.target.files[0], true)}
                                        />
                                    ) : title === "GROUP_TYPE" ? (
                                        <select
                                            value={config.config_value || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            className="border border-gray-300 px-2 py-1 rounded text-sm"
                                        >
                                            <option value="">Select Group</option>
                                            <option value="Cent Group">Cent Group</option>
                                            <option value="USD Group">USD Group</option>
                                            <option value="Pamm Group">Pamm Group</option>
                                        </select>
                                    ) : title === "NEWS_UPDATEs" ? (
                                        <TextField
                                            value={config.config_value || ""}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            size="small"
                                            style={{ width: 200 }}
                                            placeholder="Enter news update"
                                        />
                                    ) : (
                                        config.config_status
                                    )}
                                </td> */}

                                <td className="border px-4 py-2">
                                    <Switch
                                        checked={config.m00_status === 1}
                                        onChange={() =>
                                            handleValueUpdate(
                                                index,
                                                config.m00_title === "IS_REAL_LAUNCHING"
                                            )
                                        }
                                        color="primary"
                                    />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Master;
