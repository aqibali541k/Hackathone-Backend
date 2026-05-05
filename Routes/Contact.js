const express = require("express");
const Contact = require("../models/Contact.model");
const verifyToken = require("../middlewares/token/verifyToken");

const contactRouter = express.Router();

/* ---------------- SUBMIT CONTACT FORM ---------------- */
contactRouter.post("/submit", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email, and message are required" });
    }

    const newContact = await Contact.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

/* ---------------- GET UNREAD COUNT (FOR DASHBOARD BELL) ---------------- */
contactRouter.get("/unread-count", verifyToken, async (req, res) => {
  try {
    // Only NGOs/Admins care about incoming messages typically, but we return count
    const count = await Contact.countDocuments({ isRead: false });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching count" });
  }
});

/* ---------------- GET ALL CONTACTS ---------------- */
contactRouter.get("/readall", verifyToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching contacts" });
  }
});

/* ---------------- MARK AS READ ---------------- */
contactRouter.put("/mark-read/:id", verifyToken, async (req, res) => {
  try {
    await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error marking read" });
  }
});

module.exports = contactRouter;
