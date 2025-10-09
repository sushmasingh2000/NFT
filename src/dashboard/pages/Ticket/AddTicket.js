import { useFormik } from 'formik';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { apiConnectorPost } from '../../../utils/APIConnector';
import { endpoint } from '../../../utils/APIRoutes';
import Loader from '../../../Shared/Loader';
import { useNavigate } from 'react-router-dom';

const TicketRaise = () => {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const initialValues = {
        subject: '',
        message: ''
    };

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        onSubmit: (values) => {
            handleSubmit(values);
        }
    });

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('subject', values.subject);
            formData.append('message', values.message);
            if (file) {
                formData.append('file', file);
            }
            const res = await apiConnectorPost(endpoint?.create_ticket, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast(res?.data?.message);
            if (res?.data?.success) {
                formik.resetForm();
                navigate("/chat_ticket")
                setFile(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to create ticket.");
        }
        setLoading(false);
    };

    return (
        <div className="lg:py-8 bg-gray-900 text-gray-100 rounded-xl flex flex-col items-center justify-center">
            <Loader isLoading={loading} />
            <p className='text-2xl text-right pb-4 font-bold text-white'> Ticket Raise</p>
            <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formik.values.subject}
                            onChange={formik.handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="file" className="block text-sm font-medium text-gray-300 mb-1">
                            Attachment
                        </label>
                        <input
                            type="file"
                            id="file"
                            className="w-full text-gray-300 bg-gray-700 border p-2 rounded border-gray-500"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={formik.values.message}
                            onChange={formik.handleChange}
                            required
                        ></textarea>
                    </div>

                    <div className="flex justify-start space-x-4 pt-4">
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-md bg-green-500 text-gray-900 font-semibold hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Submit
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                formik.handleReset();
                                setFile(null);
                            }}
                            className="px-8 py-3 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketRaise;
