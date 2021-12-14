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
router.post('/profile/:username', async (req, res) => {

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

            user = await Accounts.findOneAndUpdate({ "_id": req.user.id }, { $set: updatedProfile }, { new: true, useFindAndModify: false });
            res.send(user);
        } catch (error) {
            res.status(500).json({ message: "Some error occurred", error: error.message })
        }
    }
);

// Route description : Add new friend.
router.put('/handshake/:friend', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const friend = req.params.friend;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        const friendExits = await Accounts.exists({ "username": friend });

        if (!friendExits) { return res.status(404).json(`No user with username @${friend} exists in the database.`) }

        if (user.friends.includes(friend)) { return res.json(`You and @${friend} are already friends.`) }
        let userFriends = { friends: [] };
        userFriends.friends = userFriends.friends.concat(user.friends);
        userFriends.friends = userFriends.friends.concat(friend);

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: userFriends }, { new: true, useFindAndModify: false });
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : unfriend.
router.put('/goodbye/:friend', getProfile, async (req, res) => {

    const userID = await req.user.id
    const friend = req.params.friend;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);

        if (!user.friends.includes(friend)) { return res.json(`You and @${friend} are not friends.`) }

        function unFriend(friend_username) {
            return friend_username != friend;
        }

        let userFriends = { friends: [] };
        userFriends.friends = userFriends.friends.concat(user.friends);
        userFriends.friends = userFriends.friends.filter(unFriend);
        console.log('worked till here.')

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: userFriends }, { new: true, useFindAndModify: false });
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : friendlist.
router.get('/friendlist/:user/:friend', async (req, res) => {

    const username = req.params.user;
    const friendname = req.params.friend;
    try {
        // Find user in the database
        let user = await Accounts.find({ "username": username }).select("-_id username friends blocked");
        let friend = await Accounts.find({ "username": friendname }).select("-_id username friends blocked");
        user = user[0];
        friend = friend[0];

        if (user.blocked.includes(friendname) && friend.blocked.includes(username)) {
            return res.status(401).json(`Not allowed`)
        }

        else if (!user.friends.includes(friendname)
            || !friend.friends.includes(username)
            || !friend || !user) {
            return res.status(401).json(`Not allowed`)
        }

        res.send(friend.friends);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Block a user
router.put('/block/:userToBeBlocked', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const userToBeBlocked = req.params.userToBeBlocked;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        const userExits = await Accounts.exists({ "username": userToBeBlocked });

        if (!userExits) { return res.status(404).json(`No user with username @${userToBeBlocked} exists in the database.`) };

        if (user.blocked.includes(userToBeBlocked)) { return res.json(`You have already blocked@ ${userToBeBlocked}.`) }
        let blocklist = { blocked: [] };
        blocklist.blocked = blocklist.blocked.concat(user.blocked);
        blocklist.blocked = blocklist.blocked.concat(userToBeBlocked);
        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: blocklist }, { new: true, useFindAndModify: false });
        res.send(user);
        console.log("worked till here");
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : unBlock a user
router.put('/unblock/:userToBeUnBlocked', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const userToBeUnBlocked = req.params.userToBeUnBlocked;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);

        if (!user.blocked.includes(userToBeUnBlocked)) { return res.json(`Account @${userToBeUnBlocked} is not in your blocklist.`) }

        function unBlock(account) {
            return account != userToBeUnBlocked;
        }

        let blocklist = { blocked: [] };
        blocklist.blocked = blocklist.blocked.concat(user.blocked);
        blocklist.blocked = blocklist.blocked.filter(unBlock);

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: blocklist }, { new: true, useFindAndModify: false });
        console.log("worked till here");
        res.send(user);

    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

module.exports = router