import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useQuery, useQueryClient } from 'react-query';
import { apiConnectorGet, apiConnectorPost } from '../../utils/APIConnector';
import { endpoint } from '../../utils/APIRoutes';
import Loader from '../../Shared/Loader';

const Withdrawal = () => {
    const [amount, setAmount] = useState('');
    const [loding, setLoding] = useState(false);
    const client = useQueryClient();
    const { data: profile } = useQuery(
        ["get_profile"],
        () => apiConnectorGet(endpoint?.member_profile_detail),
        {
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
        }
    );
    const user_profile = profile?.data?.result?.[0] || 0;

    const initialValues = {
        with_amount: "",
    }
    const fk = useFormik({
        initialValues: initialValues,
        enableReinitialize: true,
        onSubmit: () => {
            const reqbody = {
                user_amount: amount,
            };
            Withdarwal(reqbody)
        }
    });
    async function Withdarwal(reqbody) {
        setLoding(true)
        try {
            const res = await apiConnectorPost(endpoint?.add_user_withdrawal, reqbody);
            toast(res?.data?.message);
            fk.handleReset();
            client.refetchQueries("get_withdrawal");
            client.refetchQueries("get_profile");

        } catch (e) {
            console.log(e);
        }
        setLoding(false);
    }
   
    return (
        <>
            <div className="lg:py-8 bg-gray-900 text-gray-100 rounded-xl flex items-center justify-center">
                <Loader isLoading={loding}/>
                <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                    <div className='mb-3'>
                        <label htmlFor="walletBalance" className="block text-sm font-medium text-gray-300 mb-1">
                            Wallet ($)
                        </label>
                        <input
                            type="text"
                            id="walletBalance"
                            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none cursor-not-allowed"
                            value={user_profile?.jnr_curr_wallet}
                            readOnly
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="enterAddress" className="block text-sm font-medium text-gray-300 mb-1">
                            Enter Address <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                            value={user_profile?.lgn_wallet_add}
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">
                            Amount($) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="amount"
                            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-start space-x-4 pt-4">
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-md bg-green-500 text-gray-900 font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={fk.handleSubmit} >
                            Submit
                        </button>
                        <button
                            type="button"
                            onClick={fk.handleReset}
                            className="px-8 py-3 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
           
        </>
    );
};

export default Withdrawal;