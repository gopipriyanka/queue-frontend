import { useEffect, useState, useContext } from "react";
import { useSocket } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import { getPendingTickets, getMyQueue } from "../../api/ticketApi";
import { useNavigate } from "react-router-dom";
import './MentorDashboard.css';

export default function MentorDashboard() {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useSocket();
  const [pendingTickets, setPendingTickets] = useState([]);
  const [myQueue, setMyQueue] = useState([]);
  const navigate = useNavigate();

  // Fetch initial tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const pending = await getPendingTickets();
        setPendingTickets(pending);

        const queue = await getMyQueue();
        setMyQueue(queue);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    };
    fetchTickets();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewTicket = (ticket) => {
      setPendingTickets((prev) => [ticket, ...prev]);
    };

    const handleTicketClaimed = (ticket) => {
      setPendingTickets((prev) => prev.filter((t) => t._id !== ticket._id));

      if (ticket.mentor._id === user._id) {
        setMyQueue((prev) => [ticket, ...prev]);
      }
    };

    const handleTicketResolved = (ticket) => {
      setMyQueue((prev) =>
        prev.map((t) =>
          t._id === ticket._id ? { ...t, status: "resolved" } : t
        )
      );
    };

    socket.on("new_ticket", handleNewTicket);
    socket.on("ticket_claimed", handleTicketClaimed);
    socket.on("ticket_resolved", handleTicketResolved);

    return () => {
      socket.off("new_ticket", handleNewTicket);
      socket.off("ticket_claimed", handleTicketClaimed);
      socket.off("ticket_resolved", handleTicketResolved);
    };
  }, [socket, user]);

  // Claim a ticket
  const claimTicket = (ticketId) => {
    if (socket) socket.emit("claim_ticket", { ticketId });
  };

  // Resolve a ticket
  const resolveTicket = (ticketId) => {
    if (socket) socket.emit("resolve_ticket", { ticketId });
  };

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="mentor-dashboard">

      {/* HEADER */}
      <div className="mentor-header">
        <h1>Mentor Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* PENDING TICKETS */}
      <h2 className="section-title">Pending Tickets</h2>
      {pendingTickets.length === 0 && (
        <p className="empty-text">No pending tickets</p>
      )}

      <ul className="ticket-list">
        {pendingTickets.map((t) => (
          <li className="ticket-card" key={t._id}>
            <div className="ticket-info">
              <strong>{t.description}</strong>
              <span>Status: {t.status} | Student: {t.student.name}</span>
            </div>

            <div className="ticket-actions">
              <button className="claim-btn" onClick={() => claimTicket(t._id)}>
                Claim
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* MY QUEUE */}
      <h2 className="section-title">My Queue</h2>
      {myQueue.length === 0 && (
        <p className="empty-text">No tickets in your queue</p>
      )}

      <ul className="ticket-list">
        {myQueue.map((t) => (
          <li className="ticket-card" key={t._id}>
            <div className="ticket-info">
              <strong>{t.description}</strong>
              <span>Status: {t.status} | Student: {t.student.name}</span>
            </div>

            <div className="ticket-actions">
              {t.status === "claimed" && (
                <button
                  className="resolve-btn"
                  onClick={() => resolveTicket(t._id)}
                >
                  Resolve
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
