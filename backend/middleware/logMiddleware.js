import { addLog } from "../controllers/shopController.js";
import UserModel from "../schema/userSchema.js";

export const logAction = (action, infoExtractor = null) => {
  return async (req, res, next) => {
    let logged = false;

    const doLog = async (payload) => {
      if (logged) return;
      logged = true;

      try {
        // Only log if success is true or missing
        if (payload?.success === false) return;

        const userId = req.body.userId || req.user?.id;
        const user = userId ? await UserModel.findById(userId) : null;

        await addLog(user?.shopId, {
          auth: user?.role || "unknown",
          id: user?._id || "n/a",
          name: user?.name || "Unknown User",
          action,
          info: infoExtractor ? infoExtractor(req) : {},
        });
      } catch (err) {
        console.error("Logging error:", err.message);
      }
    };

    // ---- WRAP res.json ----
    const oldJson = res.json.bind(res);
    res.json = function(data) {
      doLog(data).finally(() => oldJson(data));
      return res;
    };

    // ---- WRAP res.send ----
    const oldSend = res.send.bind(res);
    res.send = function(data) {
      let parsed = data;

      try {
        if (typeof data === "string") {
          parsed = JSON.parse(data);
        }
      } catch (e) {
        // If not JSON, skip logging
      }

      doLog(parsed).finally(() => oldSend(data));
      return res;
    };

    next();
  };
};