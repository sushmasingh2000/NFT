import React, { useState } from "react";
import { useQuery, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { domain, endpoint } from "../../utils/APIRoutes";
import { apiConnectorGet, apiConnectorPost } from "../../utils/APIConnector";
import Loader from "../../Shared/Loader";

const AdminTicketChat = ({ ticket }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const queryClient = useQueryClient();

  const { data: replies, refetch } = useQuery(
    ["ticket_replies", ticket.id],
    async () => {
      const res = await apiConnectorGet(`${endpoint.get_ticket_replies}/${ticket.id}/replies`);
      return res?.data?.result;
    }
  );

  const sendReply = async () => {
    if (!message ) {
      toast.error("Please write a message.");
      return;
    }

    const formData = new FormData();
    formData.append("ticket_id", ticket.id);
    formData.append("message", message);
    if (file) formData.append("file", file);

    try {
      await apiConnectorPost(endpoint.send_ticket_reply, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Reply sent");
      setMessage("");
      setFile(null);
      refetch();
    } catch (err) {
      toast.error("Failed to send reply");
    }
  };

  const closeTicket = async () => {
  try {
    const res = await apiConnectorPost(`${endpoint.close_tickets}`, { status: "resolved", ticket_id: ticket.id });
    toast(res?.data?.message || "Ticket closed"); // note: use 'message' instead of 'mes' (check your backend response key)
    ticket.status = "resolved";
    queryClient.invalidateQueries("all_tickets");
  } catch (err) {
    toast.error("Failed to close ticket");
  }
};

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-700 bg-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-bold">{ticket.subject}</h3>
        {ticket.status !== "resolved" && (
          <button
            className="bg-red-600 text-white px-3 py-1 rounded"
            onClick={closeTicket}
          >
            Close Ticket
          </button>
        )}
      </div>

      {/* Chat Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-200">
        <p className="mb-2">{ticket.message}</p>
        {ticket.attachment && (
          <div className="mb-2">
            <strong>Attachment:</strong>
            <br />
            <img
              src={ticket.attachment.startsWith("http") ? ticket.attachment : `${domain}${ticket.attachment}`}
              alt="Ticket Attachment"
              className="max-w-full h-28 rounded mt-1"
            />
          </div>
        )}

        {!replies ? (
          <Loader isLoading />
        ) : replies?.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          replies.map((reply) => (
            <div
              key={reply.id}
              className={`flex ${reply.sender_type === "admin" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  reply.sender_type === "admin"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700"
                }`}
              >
                <p>{reply.message}</p>
                {reply.attachment && (
                  <img src={domain + reply?.attachment} alt="" className="h-28"/>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      {ticket.status !== "closed" && (
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex space-x-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 px-4 py-2 rounded bg-gray-700 text-white focus:outline-none"
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-white"
          />
          <button
            onClick={sendReply}
            className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-400"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminTicketChat;
