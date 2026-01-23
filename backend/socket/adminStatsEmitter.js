import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

const startAdminStatsEmitter = (io) => {
  setInterval(async () => {
    try {
      const waitAgg = await Ticket.aggregate([
        { $match: { claimedAt: { $ne: null } } },
        {
          $project: {
            waitMs: { $subtract: ["$claimedAt", "$createdAt"] },
          },
        },
        { $group: { _id: null, avgWaitMs: { $avg: "$waitMs" } } },
      ]);

      const resolveAgg = await Ticket.aggregate([
        {
          $match: {
            resolvedAt: { $ne: null },
            claimedAt: { $ne: null },
          },
        },
        {
          $project: {
            resolveMs: { $subtract: ["$resolvedAt", "$claimedAt"] },
          },
        },
        { $group: { _id: null, avgResolveMs: { $avg: "$resolveMs" } } },
      ]);

      const leaderboardAgg = await Ticket.aggregate([
        { $match: { status: "resolved", mentor: { $ne: null } } },
        { $group: { _id: "$mentor", resolvedCount: { $sum: 1 } } },
        { $sort: { resolvedCount: -1 } },
        { $limit: 10 },
      ]);

      const mentorIds = leaderboardAgg.map((e) => e._id);
      const mentors = await User.find({ _id: { $in: mentorIds } }).select(
        "name"
      );

      const leaderboard = leaderboardAgg.map((entry) => ({
        mentorId: entry._id,
        mentorName:
          mentors.find((m) => m._id.toString() === entry._id.toString())
            ?.name || "Unknown",
        resolvedCount: entry.resolvedCount,
      }));

      io.to("admins").emit("queue_stats_update", {
        generatedAt: new Date(),
        avgWaitMs: waitAgg[0]?.avgWaitMs || null,
        avgResolveMs: resolveAgg[0]?.avgResolveMs || null,
        mentorLeaderboard: leaderboard,
      });
    } catch (err) {
      console.error("queue stats emitter error:", err.message);
    }
  }, 60000);
};

export default startAdminStatsEmitter;
