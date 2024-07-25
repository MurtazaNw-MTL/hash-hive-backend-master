// ------------------BASE TEMPLATE-----------------------
const { app, server } = require("./socket");
const PORT = process.env.port || 5000;
require("./controllers/cronJob.js")
var bodyParser = require("body-parser");
app.use(bodyParser.json());
var cors = require("cors");
require("./connectDb");
app.use(cors({ origin: true, credentials: true }));

app.use(function (req, res, next) {
  console.log(req._parsedUrl.path, "<<<<< CURRENT API CALL");
  next();
});

// -------------------------------------- REQUIRE ROUTES-----------------------
const AuthRoutes = require("./routes/auth.routes");
const UserRoutes = require("./routes/user.routes");
const GameRoutes = require("./routes/game.routes");
const ReferralRoutes = require("./routes/referral.routes");
const AccountRoutes = require("./routes/account.routes");
const TransactionRoutes = require("./routes/transaction.routes");
const PrivacyRoutes = require("./routes/privacy.routes");
const TermsRoutes = require("./routes/terms.routes");
const PaymentRoutes = require("./routes/payment.routes");
const RoadMapRoutes = require("./routes/roadmap.routes");
const SupportRoutes = require("./routes/support.routes");
const AboutRoutes = require("./routes/aboutus.routes");
const SettingRoute = require("./routes/setting.routes");
const MinerRoutes = require("./routes/miner.routes");
const MoneroRoutes = require("./routes/monero.routes");
const FaqRoutes = require("./routes/faq.routes");


// MANAGE CONTROLERS

app.use("/v1/auth", AuthRoutes);
app.use("/v1/game", GameRoutes);
app.use("/v1/user", UserRoutes);
app.use("/v1/account", AccountRoutes);
app.use("/v1/transaction", TransactionRoutes);
app.use("/v1/privacy", PrivacyRoutes);
app.use("/v1/payment", PaymentRoutes);
app.use("/v1/terms", TermsRoutes);
app.use("/v1/referral", ReferralRoutes);
app.use("/v1/about", AboutRoutes);
app.use("/v1/support", SupportRoutes);
app.use("/v1/roadmap", RoadMapRoutes);
app.use("/v1/setting", SettingRoute);
app.use("/v1/miner", MinerRoutes);
app.use("/v1/monero", MoneroRoutes);
app.use("/v1/faq", FaqRoutes);
// app.use("/delete",UserRoutes)

//  routes
server.listen(PORT, () =>
  console.log("********* USER Server is running on PORT:", PORT)
);



