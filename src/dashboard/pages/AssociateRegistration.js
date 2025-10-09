import { useFormik } from "formik";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQuery, useQueryClient } from "react-query";
import Loader from "../../Shared/Loader";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";
import moment from "moment";
import axios from "axios";


const AssociateRegistration = () => {
    const [loding, setLoading] = useState(false);
    const [data, setData] = useState("");

    const { data: profile } = useQuery(["get_profile"], () =>
        apiConnectorGet(endpoint?.member_profile_detail)
    );

    const user_profile = profile?.data?.result?.[0] || {};


    const initialValue = {
        username: "",
        full_name: "",
        email: "",
        mobile: "",
        password: "",
        referral_id: user_profile?.lgn_cust_id || "",
    };
    const fk = useFormik({
        initialValues: initialValue,
        enableReinitialize: true,

        onSubmit: () => {
            const reqbody = {
                username: fk.values.email,
                full_name: fk.values.full_name,
                email: fk.values.email,
                mobile: String(fk.values.mobile),
                password: fk.values.password,
                referral_id: fk.values.referral_id,
            };
            RegistrationFn(reqbody);
        },
    });
    const RegistrationFn = async (reqbody) => {
        setLoading(true);
        try {
            const response = await axios.post(endpoint?.registration_api, reqbody, {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
            toast(response?.data?.message);
            setLoading(false);
            if (response?.data?.success) {
                fk.handleReset()
            }
        } catch (e) {
            console.log(e);
            setLoading(false);
        }
    };
    const Customerfunction = async () => {
        const reqbody = {
            customer_id: fk.values.referral_id,
        };
        try {
            const res = await apiConnectorPost(endpoint?.customer_api, reqbody);
            setData(res?.data?.result?.[0]);
        } catch (e) {
            console.log("something went wrong");
        }
    };

    useEffect(() => {
        Customerfunction();
    }, [fk.values.referral_id]);


    return (
        <>
            <Loader isLoading={loding} />
            <div className=" flex items-center justify-center px-4 py-5">
                <div className="w-full  bg-gray-800  shadow-xl p-8">
                    <h2 className="text-2xl font-bold mb-10 text-center text-white">Associate Registration</h2>

                    <form className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                        {[

                            { id: "full_name", label: "Full Name" },
                            { id: "email", label: "Email", type: "email" },
                            { id: "mobile", label: "Mobile", },
                            { id: "password", label: "Password" },
                            { id: "referral_id", label: "Refferral" },
                        ].map(({ id, label, type = "text" }) => (
                            <div key={id}>
                                <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
                                    {label}
                                </label>
                                <input
                                    type={type}
                                    id={id}
                                    name={id}
                                    placeholder={label}
                                    value={fk.values[id]}
                                    onChange={fk.handleChange}
                                    className="w-full px-4 py-2 border focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                    required
                                />

                                {id === "referral_id" && (
                                    <span className="text-white !px-2"><span className="text-white !px-2">
                                        {data
                                            ? (data.jnr_name ? "Active" : "")
                                            : "Invalid Referral Id"}
                                    </span> </span>
                                )}

                            </div>
                        ))}
                    </form>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className=" p-2 px-10 lg:mt-10 mt-5 bg-gold-color text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300"
                            onClick={fk.handleSubmit} >
                            {loding ? "Processing..." : "Submit"}
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
};

export default AssociateRegistration;
