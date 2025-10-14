import CloseIcon from "@mui/icons-material/Close";
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import moment from "moment";
import { useState } from "react";
import { useQuery } from "react-query";
import { apiConnectorGet } from "../../utils/APIConnector";
import { endpoint } from "../../utils/APIRoutes";
import CustomTable from "../Shared/CustomTable";
import AdminTicketChat from "./TicketChat";


const AdminTicketList = () => {
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [from_date, setFrom_date] = useState("");
    const [to_date, setTo_date] = useState("");

    const { data: tickets, isLoading, refetch } = useQuery("all_tickets", async () => {
        const res = await apiConnectorGet(endpoint.get_all_ticket);
        return res?.data?.result;
    });

    // Filter tickets
    const filteredTickets = tickets?.filter((ticket) => {
        if (!from_date || !to_date) return true;
        const created = moment(ticket.created_at);
        return created.isBetween(from_date, to_date, undefined, "[]");
    });

    const tablehead = [
        <span>S.No.</span>,
        <span>Ticket ID</span>,
        <span>User ID</span>,
        <span>Subject</span>,
        <span>Status</span>,
        <span>Created At</span>,
        <span>Action</span>,
    ];

    const tablerow = filteredTickets?.map((ticket, index) => [
        <span>{index + 1}</span>,
        <span>{ticket?.id}</span>,
        <span>{ticket?.user_id}</span>,
        <span>{ticket?.subject}</span>,
        <span
            className={`capitalize font-bold ${ticket?.status === "closed"
                    ? "text-red-500"
                    : ticket?.status === "pending"
                        ? "text-yellow-500"
                        : "text-green-500"
                }`}
        >
            {ticket?.status}
        </span>,
        <span>{moment(ticket.created_at).format("YYYY-MM-DD HH:mm")}</span>,
        <Button
            onClick={() => setSelectedTicket(ticket)}
            size="small"
            variant="contained"
        >
            View
        </Button>,
    ]);

    return (
        <div className=" p-4">
            <CustomTable tablehead={tablehead} tablerow={tablerow} isLoading={isLoading} />

            {/* Ticket Chat Modal/Panel */}
            {selectedTicket && (
                <Dialog
                    open={Boolean(selectedTicket)}
                    onClose={() => setSelectedTicket(null)}
                    fullWidth
                    maxWidth="md"
                >
                    <DialogTitle className="flex justify-between items-center">
                        Ticket ID - TK000{selectedTicket?.id}
                        <IconButton onClick={() => setSelectedTicket(null)} size="small">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent dividers>
                        <AdminTicketChat
                            ticket={selectedTicket}
                            onClose={() => setSelectedTicket(null)}
                            refetchTickets={refetch}
                        />
                    </DialogContent>
                </Dialog>

            )}
        </div>
    );
};

export default AdminTicketList;
