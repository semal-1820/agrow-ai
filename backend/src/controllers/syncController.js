const SyncQueue = require("../models/SyncQueue");

// POST /api/sync/queue - client pushes an offline change
exports.pushToQueue = async (req, res) => {
  try {
    const { entityType, entityId, operation, payload, clientTimestamp } = req.body;

    if (!entityType || !operation) {
      return res.status(400).json({
        message: "entityType and operation are required.",
      });
    }

    if (!["create", "update", "delete"].includes(operation)) {
      return res.status(400).json({
        message: "operation must be create, update, or delete.",
      });
    }

    const entry = await SyncQueue.create({
      user: req.user.id,
      entityType,
      entityId: entityId || null,
      operation,
      payload: payload || {},
      clientTimestamp: clientTimestamp || new Date(),
      status: "pending",
    });

    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/sync/queue - offline changes for the logged-in user
exports.getQueue = async (req, res) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.status) filter.status = req.query.status;

    const entries = await SyncQueue.find(filter).sort({ createdAt: 1 });

    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/sync/conflict/:id/resolve - resolve a conflicted entry
// resolution: "client" (client version wins, mark synced) or
// "server" (discard the queued client change).
exports.resolveConflict = async (req, res) => {
  try {
    const { resolution } = req.body;

    if (!["client", "server"].includes(resolution)) {
      return res.status(400).json({
        message: "resolution must be 'client' or 'server'.",
      });
    }

    const entry = await SyncQueue.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) {
      return res.status(404).json({ message: "Sync queue entry not found." });
    }

    if (entry.status !== "conflict") {
      return res.status(400).json({
        message: "Only entries with status 'conflict' can be resolved.",
      });
    }

    entry.status = resolution === "client" ? "synced" : "failed";
    entry.conflictReason =
      resolution === "server" ? "Discarded in favor of server version." : null;
    await entry.save();

    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/sync/retry/:id - retry a failed sync entry
exports.retryFailed = async (req, res) => {
  try {
    const entry = await SyncQueue.findOne({ _id: req.params.id, user: req.user.id });
    if (!entry) {
      return res.status(404).json({ message: "Sync queue entry not found." });
    }

    if (entry.status !== "failed") {
      return res.status(400).json({
        message: "Only entries with status 'failed' can be retried.",
      });
    }

    entry.status = "pending";
    entry.retryCount += 1;
    await entry.save();

    res.status(200).json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
