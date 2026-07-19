const mongoose = require("mongoose");

const syncQueueSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which collection this change applies to, e.g. "FinancialRecord",
    // "Enterprise". Kept as a free string rather than a hard enum so new
    // entity types don't require a schema migration.
    entityType: {
      type: String,
      required: true,
    },

    // The record's ID if it already exists server-side (update/delete), or
    // a client-generated temporary ID (create) that the client uses to
    // reconcile once the server assigns a real ID.
    entityId: {
      type: String,
      default: null,
    },

    operation: {
      type: String,
      enum: ["create", "update", "delete"],
      required: true,
    },

    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    status: {
      type: String,
      enum: ["pending", "synced", "failed", "conflict"],
      default: "pending",
    },

    conflictReason: {
      type: String,
      default: null,
    },

    retryCount: {
      type: Number,
      default: 0,
    },

    // When the change was made on the client, while offline.
    clientTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SyncQueue", syncQueueSchema);
