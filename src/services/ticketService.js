import api from "../api/axios";

export const getTickets = async () => {
  const res = await api.get("/tickets");

  return res.data;
};

export const updateTicketStatus = async (ticketId, status) => {
  const res = await api.put(`/tickets/${ticketId}/status`, {
    status,
  });

  return res.data;
};