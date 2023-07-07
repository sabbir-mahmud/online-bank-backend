import dotenv from "dotenv";
import express from "express";
import {
  checkIp,
  getAllPayInRecode,
  getAllPayOutRecode,
  getAllRecode,
  getNoOfRecode,
  getPayIn,
  getPayOut,
  payIn,
  payIns,
  payInStatusChange,
  payInSummery,
  payOut,
  payOutStatusChange,
  payOutSummery,
  statement,
  transferWallet,
} from "../controllers/payinControllers.js";
import {
  changePass,
  findUser,
  forgotPass,
  login,
  refreshToken,
  register,
  resetPassword,
  resetPasswordChange,
  updateUser,
  user,
  users,
} from "../controllers/userControllers.js";
import {
  DECRYPTION,
  DECRYPTION_ID,
  ENCRYPTION,
} from "../controllers/userData.js";
import {
  checkAuthUser,
  checkSuperAdmin,
  checkUser,
} from "../middleware/authMiddleware.js";
dotenv.config();

const router = express.Router();
router.post("/register", register);

// router.use('/login', checkUserIp)
router.post("/login", login);

router.use("/admin/login", checkUser);
router.post("/admin/login", login);
router.post("/refresh", refreshToken);

router.use("/payIn", checkAuthUser);
router.post("/payIn", payIn);

router.use("/payOut", checkAuthUser);
router.post("/payOut", payOut);

router.get("/payIn", getPayIn);
router.get("/payOut", getPayOut);

router.use("/statement", checkAuthUser);
router.get("/statement", statement);

router.use("/allStatement", checkSuperAdmin);
router.get("/allStatement", getAllRecode);

router.use("/enc", checkAuthUser);
router.post("/enc", ENCRYPTION);
router.use("/dec", checkAuthUser);
router.get("/dec", DECRYPTION);
router.get("/dec/:id", checkAuthUser);
router.get("/dec/:id", DECRYPTION_ID);

router.use("/reset_password", checkAuthUser);
router.put("/reset_password/:id", changePass);

router.use("/change_pass/admin/:id", checkSuperAdmin);
router.put("/change_pass/admin/:id", changePass);

router.put("/reset_user_password/user/:id", checkAuthUser);
router.put("/reset_user_password/user/:id", changePass);

router.use("/findUser", checkAuthUser);
router.get("/findUser", findUser);

router.use("/findAdmin", checkSuperAdmin);
router.get("/findAdmin", findUser);

router.use("/all/users", checkSuperAdmin);
router.get("/all/users", users);

router.get("/user/:id", user);
router.put("/user/:id", updateUser);

router.use("/findPayIn", checkSuperAdmin);
router.get("/findPayIn", getAllPayInRecode);

router.use("/findPayOut", checkSuperAdmin);
router.get("/findPayOut", getAllPayOutRecode);

router.get("/noRecord", checkSuperAdmin);
router.get("/noRecord", getNoOfRecode);

router.put("/changePayInStatus/:id", checkSuperAdmin);
router.put("/changePayInStatus/:id", payInStatusChange);

router.put("/changePayOutStatus/:id", checkSuperAdmin);
router.put("/changePayOutStatus/:id", payOutStatusChange);

router.post("/forgotPass", forgotPass);
router.get("/resetPassword/:id/:token", resetPassword);
router.post("/resetPassword/:id/:token", resetPasswordChange);

router.get("/summery/payin", payInSummery);
router.get("/summery/payout", payOutSummery);

router.use("/store/payIn", checkAuthUser);
router.post("/store/payIn", payIns);

router.use("/store/payout", checkAuthUser);

router.post("/ip-check", checkIp);

router.put("/transferTrn/:id", transferWallet);
export default router;
