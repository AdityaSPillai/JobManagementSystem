import { addLog } from "../controllers/shopController.js";
import UserModel from "../schema/userSchema.js";

export const logAction = (action, infoExtractor = null) => {
  return async (req, res, next) => {
    let logged = false;

    const oldJson = res.json.bind(res);
    res.json = function (data) {
      doLog(data).finally(() => oldJson(data));
      return res;
    };

    const oldSend = res.send.bind(res);
    res.send = function (data) {
      let parsed = data;
      try {
        if (typeof data === "string") parsed = JSON.parse(data);
      } catch { }
      doLog(parsed).finally(() => oldSend(data));
      return res;
    };

    const doLog = async (payload) => {
      if (logged) return;
      logged = true;

      try {
        if (payload?.success === false) return;

        const userId =
          req.params.userId ||
          req.body.userId ||
          req.user?.id;

        if (!userId) {
          console.error("Logging error: Missing userId");
          return;
        }

        const user = await UserModel.findById(userId);

        if (!user) {
          console.error("Logging error: User not found");
          return;
        }

        await addLog(user.shopId, {
          auth: user.role,
          id: user._id,
          name: user.name,
          action,
          info: infoExtractor ? infoExtractor(req) : {},
        });
      } catch (err) {
        console.error("Logging error:", err.message);
      }
    };

    next();
  };
};