import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true
    },
    generatedToken: {
      token: {
        type: String,
        required: true,
        index: true
      },
      jti: {
        type: String,
        required: true
      }
    },
    refreshToken: {
      type: String,
      default: null
    },
    deviceInfo: {
      deviceUUID: {
        type: String,
        default: null
      },
      platform: {
        type: String,
        default: "web"
      },
      userAgent: {
        type: String,
        default: null
      },
      ipAddress: {
        type: String,
        default: null
      }
    },
    status: {
      type: String,
      enum: ["Active", "DeActive"],
      default: "Active",
      index: true
    },
    lastUsedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Session = mongoose.model("sessions", SessionSchema);
export default Session;
