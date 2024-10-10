const { Router } = require("express");
const authController = require("../controllers/authController");
const currController = require("../controllers/currController");
const payController = require("../controllers/payController");
const { requireAuth, checkUser, requireUnAuth } = require("../middleware/authMiddleware");
const router = Router();

router.get("*", checkUser);

router.get("/", (req, res) => res.render("home"));

router.get("/account", requireAuth, (req, res) => res.render("account"));
router.get("/edit", requireAuth, (req, res) => res.render("edit"));
router.get("/logout", requireAuth, authController.logout_get);
router.put("/update-profile", requireAuth, authController.update_profile);
router.delete("/delete-account", requireAuth, authController.delete_account);

router.get("/send-money", requireAuth, (req, res) => res.render("send-money"));
router.post("/send-money", requireAuth, authController.send_money_post);

router.get("/buy-currency", requireAuth, (req, res) => res.render("buy-currency"));
router.get("/convert", currController.get_currencies);
router.post("/buy-currency/pay", requireAuth, payController.payment);

router.get("/signup", requireUnAuth, (req, res) => res.render("signup"));
router.post("/signup", requireUnAuth, authController.signup_post);

router.get("/signin", requireUnAuth, (req, res) => res.render("signin"));
router.post("/signin", requireUnAuth, authController.signin_post);

module.exports = router;
