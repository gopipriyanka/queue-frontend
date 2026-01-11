import SubmitTicket from "./SubmitTicket";
import { useEffect, useState, useContext } from "react";
import { useSocket } from "../../context/SocketContext";
import { AuthContext } from "../../context/AuthContext";
import { getMyTickets } from "../../api/ticketApi";
import { useNavigate } from "react-router-dom";
import './StudentDashboard.css';

export default function StudentDashboard() {
  const { user, logout } = useContext(AuthContext); // use logout instead of setUser
  const { socket } = useSocket();
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  // Load existing tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const data = await getMyTickets();
        setTickets(data);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      }
    };
    fetchTickets();
  }, []);

  // Listen for ticket updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      setTickets((prev) =>
        prev.map((t) =>
          t._id === data.ticketId
            ? { ...t, status: data.status, mentor: data.mentor }
            : t
        )
      );
    };

    socket.on("ticket_status_update", handleStatusUpdate);

    return () => {
      socket.off("ticket_status_update", handleStatusUpdate);
    };
  }, [socket]);

  // Logout function
  const handleLogout = () => {
    logout();           // calls AuthContext's logout
    navigate("/login"); // redirect to login
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Main content */}
      <div className="dashboard-content">
        {/* Submit Ticket panel */}
        <div className="submit-ticket-container">
          <h2>Submit a Ticket</h2>
          <SubmitTicket
            onTicketCreated={(newTicket) =>
              setTickets((prev) => [newTicket, ...prev])
            }
          />
        </div>

        {/* Tickets list panel */}
        <div className="tickets-container">
          <h2>My Tickets</h2>
          <ul>
            {tickets.map((t) => (
              <li key={t._id}>
                <div>
                  <strong>{t.description}</strong> - <em>{t.status}</em>
                  {t.mentor && <span> (Mentor: {t.mentor.name})</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
