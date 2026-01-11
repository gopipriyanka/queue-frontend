import { useEffect, useState, useContext } from "react";
import { SocketContext } from "../../context/SocketContext";

export default function AdminDashboard() {
  const socket = useContext(SocketContext);
  const [stats, setStats] = useState({ avgWait: 0, avgResolve: 0 });

  useEffect(() => {
    socket.on("queue_stats_update", (data) => {
      setStats(data);
    });
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <div className="stats">
        <p>Avg Wait Time: {stats.avgWait} mins</p>
        <p>Avg Resolve Time: {stats.avgResolve} mins</p>
      </div>
    </div>
  );
}
