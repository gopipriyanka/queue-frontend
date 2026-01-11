import API from "./api";

// Create a new ticket
export const createTicket = async (description) => {
  const res = await API.post("/tickets", { description });
  return res.data;
};

// Get student's own tickets
export const getMyTickets = async () => {
  const res = await API.get("/tickets/my");
  return res.data;
};

// Get pending tickets (for mentors)
export const getPendingTickets = async () => {
  const res = await API.get("/tickets/pending");
  return res.data;
};

// Get mentor's claimed/resolved tickets
export const getMyQueue = async () => {
  const res = await API.get("/tickets/my-queue");
  return res.data;
};
