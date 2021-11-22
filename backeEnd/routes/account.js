require('dotenv').config();
const express = require('express');
const router = express.Router();
const Accounts = require('../models/Account-Model');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const getProfile = require('../middleware/getProfile');
const { find } = require('../models/Account-Model');
const key = process.env.SECRET;

// Route description : Create a user by signing up with his data
router.post('/signup',

    // Validation for each value
    [
        body('name', "Enter your name").exists(),
        body('email', "Email is not valid or already in use").isEmail(),
        body('username', "Username is not valid or already in use").isLength({ min: 1 }),
        body('password', "Passoword must be atleast 8 characters.").isLength({ min: 8 }),
    ], async (req, res) => {

        const errors = validationResult(req);
        // If error occur, returns the message
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {

            // Find user with entered email and username in database. When true, returns error
            let userEmail = await Accounts.exists({ email: req.body.email })
            let userName = await Accounts.exists({ username: req.body.username })

            if (userEmail) {
                return res.status(400).json({ error: "User with this email already exists" })
            }
            else if (userName) {
                return res.status(400).json({ error: "Username unavailable" })
            }

            // Password Hashing with salt
            const salt = bcrypt.genSaltSync(10);
            const hashedPass = bcrypt.hashSync(req.body.password, salt);

            // Creates a user in database.
            user = await Accounts.create({
                dp_id: req.body.dp_id,
                name: req.body.name,
                email: req.body.email,
                username: req.body.username,
                password: hashedPass
            })

            const data = {
                user: {
                    id: user._id,
                    username: user.username,
                },
            };

            // Sign JWT Token
            const authToken = jwt.sign(data, key);

            res.send({ Token: authToken, user: user });
        } catch (error) {
            res.status(500).json({ message: "Some error occurred", error: error.message })
        }
    }
);

// Route description : Log in user
router.post('/login',

    // Validation for each value
    [
        body('username', "Enter username").exists(),
        body('password', "Passowrd cannot be blank.").exists(),
    ], async (req, res) => {
        const errors = validationResult(req);

        // If error occur, returns the message
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = await req.body
        try {

            let user = await Accounts.findOne({ username: username })
            if (!user) {
                return res.status(400).json({ error: "Username and password doesnot match." })
            }
            const varifyPassword = bcrypt.compare(password, user.password);
            if (!varifyPassword) {
                return res.status(404).json({ error: "Username and password doesnot match." })
            }

            const data = {
                user: {
                    id: user._id,
                    username: user.username,
                },
            };
            // Sign JWT Token
            const authToken = jwt.sign(data, key);
            res.send({ Token: authToken });
        } catch (error) {
            res.status(500).json({ message: "Some error occurred", error: error.message })
        }
    }
);

// Route description : Get all users from database.
router.get('/users', async (req, res) => {

    try {
        const user = await Accounts.find().select("-password")
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Fetch Logged in user details: login required.
router.post('/profile', getProfile, async (req, res) => {

    // If error occur, returns the message
    try {
        const userID = await req.user.id;
        const user = await Accounts.findById(userID).select("-password -_id")
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Get user profile by username from database.
router.post('/profile/:username', getProfile, async (req, res) => {

    try {
        const user = await Accounts.findOne({ username: req.params.username }).select("-_id -password -email")
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Update user profile details into database.
router.put('/profile/update',

    // Validation for each value
    [
        body("name", "Name can't be left empty.").exists(),
        body("bio", "Bio is too long").isLength({ max: 150 }),
        body("email", "Enter a valid Email").isEmail(),
    ], getProfile, async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userID = await req.user.id;
        const { dp_id, name, bio, email } = req.body;

        try {
            // Find user with entered email in database. When true, returns error
            let user = await Accounts.findById(userID)
            // console.log(user);

            if (email !== user.email) {

                let isUser = await Accounts.exists({ "email": email });
                if (isUser) {
                    return res.status(400).json({ error: "User with this email already exists" })
                }
                // console.log(user)
            }

            if (!user) { return res.status(404).send("Not Found") }
            if (user._id.toString() !== userID) { return res.status(401).send("Not Allowed") }

            let updatedProfile = { dp_id: "", name: "", bio: "", email: "" };
            if (dp_id) { updatedProfile.dp_id = dp_id };
            if (name) { updatedProfile.name = name };
            if (bio) { updatedProfile.bio = bio };
            if (email) { updatedProfile.email = email };

            user = await Accounts.findOneAndUpdate({"_id":req.user.id}, { $set: updatedProfile }, {new: true, useFindAndModify: false});
            res.send(user);
        } catch (error) {
            res.status(500).json({ message: "Some error occurred", error: error.message })
        }
    }
);

module.exports = router