import { useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import Loader from "../../../Shared/Loader";
import { apiConnectorGet, apiConnectorPost } from "../../../utils/APIConnector";
import { domain, endpoint } from "../../../utils/APIRoutes";

const UserSupportChat = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  const openImageModal = (src) => {
    setModalImageSrc(src);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setModalImageSrc(null);
    setShowImageModal(false);
  };

  // Get all tickets of logged-in user
  const { data: ticketsData, isLoading: ticketLoading } = useQuery(
    "my_tickets",
    async () => {
      const res = await apiConnectorGet(endpoint.my_tickets);
      return res?.data?.result;
    }
  );

  // Get replies for selected ticket
  const {
    data: repliesData,
    refetch: refetchReplies,
    isFetching,
  } = useQuery(
    ["ticket_replies", selectedTicket?.id],
    async () => {
      if (!selectedTicket?.id) return [];
      const res = await apiConnectorGet(
        `${endpoint.get_ticket_replies}/${selectedTicket?.id}/replies`
      );
      return res?.data?.result;
    },
    { enabled: !!selectedTicket?.id }
  );

  const sendMessage = async () => {
    if (!message && !file) {
      toast.error("Message or file is required.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ticket_id", selectedTicket?.id);
      formData.append("message", message);
      if (file) formData.append("file", file);

      await apiConnectorPost(endpoint.send_ticket_reply, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("");
      setFile(null);
      refetchReplies();
      toast.success("Message sent");
    } catch (error) {
      toast.error("Failed to send message");
      console.log(error);
    }
  };
  const navigate = useNavigate();

  return (
    <div className="">
      <div className="flex justify-end bg-gray-800 p-5 mb-5  text-white rounded">
        <p
          className="p-2 cursor-pointer rounded bg-white text-black"
          onClick={() => navigate("/add_ticket")}
        >
          {" "}
          + Ticket Generate
        </p>
      </div>

      <div className="flex flex-col md:flex-row bg-gray-900 text-white h-auto md:h-[85vh] rounded-lg overflow-hidden">
        {/* Ticket List */}
        <div className="w-full md:w-1/4 border-r border-gray-700 overflow-y-auto p-4 bg-gray-800">
          <h2 className="text-lg font-semibold mb-4">My Tickets</h2>
          {ticketLoading ? (
            <Loader isLoading />
          ) : ticketsData?.length === 0 ? (
            <p>No tickets found.</p>
          ) : (
            ticketsData?.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`cursor-pointer p-3 mb-2 rounded-lg ${
                  selectedTicket?.id === ticket.id
                    ? "bg-[#64b1b8] text-black"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <div className="font-semibold">
                  Ticket Id : TK000{ticket.id}
                </div>
                <div className="font-semibold">{ticket.subject}</div>
                <div className="text-sm text-white truncate">
                  {ticket?.attachment && (
                    <img
                      src={domain + ticket.attachment}
                      className="h-10 w-10"
                    />
                  )}
                </div>
                <div className="text-sm text-white truncate">
                  {ticket.message}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-full md:w-3/4 flex flex-col">
          {!selectedTicket ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Select a ticket to view chat
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-700 bg-gray-800">
                <h3 className="text-lg font-bold">{selectedTicket.subject}</h3>
                <p
                  className={`text-sm font-semibold mt-1 ${
                    selectedTicket.status === "closed"
                      ? "text-red-500"
                      : selectedTicket.status === "pending"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
                >
                  Status: {selectedTicket.status}
                </p>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
                <div className="text-sm text-gray-300">
                  <p>
                    <span className="font-semibold">Message:</span>{" "}
                    {selectedTicket.message}
                  </p>
                  {selectedTicket.attachment && (
                    <div className="mt-2">
                      <span className="font-semibold">Attachment:</span>
                      <img
                        src={domain + selectedTicket.attachment}
                        alt="attachment"
                        className="mt-1 h-20 rounded"
                        onClick={() =>
                          openImageModal(domain + selectedTicket.attachment)
                        }
                      />
                    </div>
                  )}
                </div>
                {isFetching ? (
                  <Loader isLoading />
                ) : repliesData?.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  repliesData?.map((reply) => (
                    <div
                      key={reply.id}
                      className={`flex ${
                        reply.sender_type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          reply.sender_type === "user"
                            ? "bg-[#64b1b8] text-black"
                            : "bg-gray-700"
                        }`}
                      >
                        <p>{reply.message}</p>
                        {reply.attachment && (
                          <img src={domain + reply?.attachment} alt="" />
                        )}
                        {/* <p className="text-xs text-gray-300 mt-1">{new Date(reply.created_at).toLocaleString()}</p> */}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedTicket?.status !== "resolved" && (
                <div className="p-4 border-t border-gray-700 bg-gray-800 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
                  />

                  {/* Custom Attachment Button */}
                  <div className="w-full sm:w-auto">
                    <input
                      type="file"
                      id="file-upload"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="hidden"
                    />

                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 block text-center"
                    >
                      Attachment
                    </label>
                  </div>

                  <button
                    onClick={sendMessage}
                    className="px-4 py-2 bg-[#64b1b8] text-black rounded hover:bg-[#64b1b8] w-full sm:w-auto"
                  >
                    Send
                  </button>
                </div>
              )}

              {/* Send Message Box */}
            </>
          )}
        </div>
      </div>
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            <button
              className="absolute top-2 right-2 text-white text-2xl font-bold"
              onClick={closeImageModal}
            >
              ×
            </button>
            <img
              src={modalImageSrc}
              alt="Modal"
              className="max-w-full max-h-[90vh] rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSupportChat;
