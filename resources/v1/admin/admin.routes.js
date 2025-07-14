// resources/v1/admin/admin.routes.js

const express = require("express");
const routes = express.Router();

const Authorize = require("../../../middleware/v1/authorize");
const auth = new Authorize();

const AdminValidation = require("./admin.validation");
const validate = new AdminValidation();

const AdminController = require("./admin.controller");
const admin = new AdminController();

// Public / static routes first
routes.post("/login", validate.login, admin.login);
routes.get("/health", admin.healthCheck);
routes.get("/mock", admin.getMockLinks);

// Authenticated admin-wide routes
routes.get("/", [auth.auth], admin.getAll);
routes.get("/profile", [auth.auth], admin.profile);

// User stats, export
// routes.get("/users/stats", [auth.auth], admin.getUserStats);
routes.get("/users/export", [auth.auth], admin.exportUsers);
routes.get("/stats", [auth.auth], admin.getUserStats);
routes.get("/users", [auth.auth], admin.getUsers);

// User management
routes.get("/users/:id", [auth.auth], admin.getUserById);
routes.put("/users/:id", [auth.auth], admin.updateUser); //django sync Done
// routes.patch("/users/:id", [auth.auth], admin.updateUser);
routes.patch("/users/:id/clear-device", [auth.auth], admin.clearDeviceId); //django sync Done
routes.post("/users/reset-password", [auth.auth, validate.resetPassword], admin.resetPasswordByToken); //django sync Done
routes.patch("/users/:id/subscription", [auth.auth], admin.updateSubscription); //django sync no need yet
routes.patch("/users/:id/status", [auth.auth], admin.updateAccountStatus); //django sync no need yet
routes.post("/users/:id/ban", [auth.auth], admin.banUser); //django sync Done
routes.post("/users/:id/unban", [auth.auth], admin.unbanUser); //django sync Done
routes.post("/users/:id/verify", [auth.auth], admin.verifyUser); //django sync Done
routes.post("/users/:id/remove-verification", [auth.auth], admin.removeVerification); //django sync Done
routes.post("/send-password-reset", [auth.auth], admin.sendPasswordReset);


// Generic admin CRUD
routes.post("/", [auth.auth, validate.createOne], admin.createOne); //django sync Done
routes.get("/:id", [auth.auth], admin.getOne);
routes.put("/:id", [auth.auth, validate.updateOne], admin.updateOne); //django sync no need yet
routes.delete("/:id", [auth.auth], admin.deleteOne); //django sync no need yet
routes.post("/:id/reset-password", [auth.auth, validate.resetPassword], admin.resetPassword); //django sync no need yet

// Link endpoints (if used)
// routes.get("/links", [auth.auth], admin.getLinks);
// routes.get("/links/:id", [auth.auth], admin.getLinkById);
// routes.patch("/links/:id/status", [auth.auth], admin.updateLinkStatus);

module.exports = routes;
