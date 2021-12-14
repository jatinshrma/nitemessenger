const express = require('express');
const router = express.Router();
const Messages = require('../models/Chat-Model')
const Accounts = require('../models/Account-Model');
const getProfile = require('../middleware/getProfile');
const { body, validationResult } = require('express-validator');

// Route : 1 To fetch all messages
router.get('/messages/:username', getProfile, async (req, res) => {

    const username = await Accounts.exists({ username: req.params.username })
    if (!username) {
        return res.status(404).json({ error: "This application doesn't receive messsages from ghosts, pass a valid friend's username." })
    }

    const messages = await Messages.find({
        $or: [
            { sender: req.user.username, receiver: req.params.username },
            { receiver: req.user.username, sender: req.params.username }
        ]
    }).select("-user");
    res.send(messages);
});

// Route : 2 Add a message
router.post('/sendmessage/:username', getProfile,

    // Validation for each value
    [
        body('message', "No message").exists(),
        body('status', "No status").exists(),
    ], async (req, res) => {

        // If error occur, returns the message
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const username = await Accounts.exists({ username: req.params.username })
        if (!username) {
            return res.status(404).json({ error: "This application doesn't send messsages to ghosts, pass a valid friend's username." })
        }

        let { message } = await req.body;
        let { status } = await req.body;
        try {
            // Adds a new message in database.
            message = await Messages.create({
                user: req.user.id,
                sender: req.user.username,
                receiver: req.params.username,
                message: message,
                status: status,
            })
            console.log("worked till here.");
            res.send(message);
        } catch (err) {
            res.json({ error: err.message })
        }
    });

// Route : 3 Unsend a message and remove it from database.
router.delete('/unsendmessage', getProfile, async (req, res) => {

    const messageId = req.header('id');
    try {
        let message = await Messages.findById(messageId)
        if (!message) { return res.status(404).send("Not Found") }
        if (message.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }

        message = await Messages.findByIdAndDelete(messageId)
        res.json({ success: "Message unsent", unsent: message });
    } catch (error) {
        res.status(500).json(error.message);
    }
});

// Route : 4 Update message status.
router.put('/status/:status', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const status = req.params.status;
    const messageId = req.header('id');
    try {
        let message = await Messages.findById(messageId)
        if (!message) { return res.status(404).send("Not Found") }

        let user = await Accounts.findById(userID).select("-_id username")
        console.log(user);

        if (user.username !== message.receiver) { return res.status(401).send("Not Allowed") }
        else {
            statusUpdate = { status: status };
            message = await Messages.findByIdAndUpdate(messageId, { $set: statusUpdate }, { new: true, useFindAndModify: false });
            res.send(message);
        }


    } catch (error) {
        res.status(500).json(error.message);
    }
});
module.exports = router