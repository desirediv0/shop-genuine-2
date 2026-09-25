import express from "express";
import { verifyJWTToken } from "../middlewares/auth.middleware.js";
import {
  registerDeviceToken,
  unregisterDeviceToken,
  getMyDevices,
  sendTestPush,
} from "../controllers/notification.controller.js";

const router = express.Router();

// Every route here acts on the signed-in user's own devices.
router.use(verifyJWTToken);

router.post("/register-device", registerDeviceToken);
router.post("/unregister-device", unregisterDeviceToken);
router.get("/devices", getMyDevices);
router.post("/test", sendTestPush);

export default router;
