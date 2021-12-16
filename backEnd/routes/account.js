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
router.get('/users', getProfile, async (req, res) => {

    try {
        const users = await Accounts.find().select("-_id dp_id username name")
        res.send(users);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Get user profile by username from database.
router.post('/profile/:username', getProfile, async (req, res) => {

    try {
        const user = await Accounts.findOne({ username: req.params.username }).select("-_id dp_id username name")
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

// Route description : Update user profile details into database.
router.put('/profile/update', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const { dp_id, name, bio, email } = req.body;

    try {
        // Find user with entered email in database. When true, returns error
        let user = await Accounts.findById(userID)

        if (email && email !== user.email) {

            let isUser = await Accounts.exists({ "email": email });
            if (isUser) {
                return res.status(400).json({ error: "User with this email already exists" })
            }
        }

        if (!user) { return res.status(404).send("Not Found") }
        if (user._id.toString() !== userID) { return res.status(401).send("Not Allowed") }

        let updatedProfile = { dp_id: null, name: null, bio: null, email: null };

        updatedProfile.dp_id = dp_id ? dp_id : user.dp_id;
        updatedProfile.name = name ? name : user.name;
        updatedProfile.bio = bio ? bio : user.bio;
        updatedProfile.email = email ? email : user.email;

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: updatedProfile }, { new: true, useFindAndModify: false });
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
}
);

// Route description : Request for a handshake.
router.put('/request/:requestee', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const requesteeName = req.params.requestee;

    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        let requestee = await Accounts.find({ "username": requesteeName }).select("requestedBy");
        requestee = requestee[0];

        if (!requestee) { return res.status(404).json(`No user with username @${requesteeName} exists in the database.`) }

        if (user.friends.includes(requesteeName)) { return res.status(401).json(`You and @${requesteeName} are already friends.`) }

        if (user.requested.includes(requesteeName)) { return res.status(401).json(`You have already requsted.`) }
        if (user.blocked.includes(requesteeName)) { return res.status(401).json(`Not allowed`) }

        // Updating requests list on user object
        let requestsArray = { requested: [] };
        requestsArray.requested = requestsArray.requested.concat(user.requested);
        requestsArray.requested = requestsArray.requested.concat(requesteeName);

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: requestsArray }, { new: true, useFindAndModify: false });

        // Updating requestedBy list on requestee object
        let RequesteeObj = { requestedBy: [] };
        RequesteeObj.requestedBy = RequesteeObj.requestedBy.concat(requestee.requestedBy);
        RequesteeObj.requestedBy = RequesteeObj.requestedBy.concat(user.username);

        user = await Accounts.findOneAndUpdate({ "_id": requestee._id }, { $set: RequesteeObj }, { new: true, useFindAndModify: false });

        res.json({ Message: `Requested for a handshake to @${requesteeName}` });
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Cancel request.
router.put('/cancelrequest/:requestee', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const requesteeName = req.params.requestee;

    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        let requestee = await Accounts.find({ "username": requesteeName }).select("requestedBy");
        requestee = requestee[0];

        if (!requestee) { return res.status(404).json(`No user with username @${requesteeName} exists in the database.`) }

        if (user.friends.includes(requesteeName)) { return res.status(401).json(`You and @${requesteeName} are already friends.`) }

        if (!user.requested.includes(requesteeName) || user.blocked.includes(requesteeName)) { return res.status(401).json(`You didnot request`) }

        // Updating requests list on user object
        function cancelRequested(username) {
            return username != requesteeName;
        }

        let requestsArray = { requested: [] };
        requestsArray.requested = requestsArray.requested.concat(user.requested);
        requestsArray.requested = requestsArray.requested.filter(cancelRequested);

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: requestsArray }, { new: true, useFindAndModify: false });

        // Updating requestedBy list on requestee object
        function removeFromRequestedBy(username) {
            return username != user.username;
        }

        let RequesteeObj = { requestedBy: [] };
        RequesteeObj.requestedBy = RequesteeObj.requestedBy.concat(requestee.requestedBy);
        RequesteeObj.requestedBy = RequesteeObj.requestedBy.filter(removeFromRequestedBy);

        user = await Accounts.findOneAndUpdate({ "_id": requestee._id }, { $set: RequesteeObj }, { new: true, useFindAndModify: false });

        res.json({ Message: "You have cancelled your request" });
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Decline request.
router.put('/declinerequest/:requestor', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const requestorName = req.params.requestor;

    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        let requestor = await Accounts.findOne({ username: requestorName }).select('requested');

        if (!requestor.requested.includes(user.username) || user.friends.includes(requestorName) || user.blocked.includes(requestor)) {
            return res.status(401).json(`Not allowed`)
        };

        // Removing request from requestor side
        function declineRequest(username) {
            return username != user.username;
        }

        let requestsArray = { requested: [] };
        requestsArray.requested = requestsArray.requested.concat(requestor.requested);
        requestsArray.requested = requestsArray.requested.filter(declineRequest);

        requestor = await Accounts.findOneAndUpdate({ "_id": requestor._id }, { $set: requestsArray }, { new: true, useFindAndModify: false });

        // Updating requestedBy on user side
        function updateRequestedBy(username) {
            return username != requestorName;
        }

        let requestorsArray = { requestedBy: [] };
        requestorsArray.requestedBy = requestorsArray.requestedBy.concat(user.requestedBy);
        requestorsArray.requestedBy = requestorsArray.requestedBy.filter(updateRequestedBy);

        user = await Accounts.findOneAndUpdate({ "_id": user._id }, { $set: requestorsArray }, { new: true, useFindAndModify: false });

        // res.json({ user: user.requestedBy, requestor: requestor.requested })
        res.send({ Message: "Request has been Declined." });
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Add new friend.
router.put('/handshake/:requestor', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const requestorName = req.params.requestor;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        let requestor = await Accounts.findOne({ "username": requestorName }).select("friends requested");

        if (!requestor) { return res.status(404).json(`No user with username @${requestorName} exists in the database.`) }

        if (!requestor.requested.includes(user.username)) { return res.status(401).json(`Not allowed`) }

        let userFriends = { friends: [] };
        userFriends.friends = userFriends.friends.concat(user.friends);
        userFriends.friends = userFriends.friends.concat(requestorName);

        let requestorFriends = { friends: [] };
        requestorFriends.friends = requestorFriends.friends.concat(requestor.friends);
        requestorFriends.friends = requestorFriends.friends.concat(user.username);
        // Removing request from requestor side
        function declineRequest(username) {
            return username != user.username;
        }

        let requestsArray = { requested: [] };
        requestsArray.requested = requestsArray.requested.concat(requestor.requested);
        requestsArray.requested = requestsArray.requested.filter(declineRequest);

        requestor = await Accounts.findOneAndUpdate({ "_id": requestor._id }, { $set: requestsArray }, { new: true, useFindAndModify: false });

        // Updating requestedBy on user side
        function updateRequestedBy(username) {
            return username != requestorName;
        }

        let requestorsArray = { requestedBy: [] };
        requestorsArray.requestedBy = requestorsArray.requestedBy.concat(user.requestedBy);
        requestorsArray.requestedBy = requestorsArray.requestedBy.filter(updateRequestedBy);

        user = await Accounts.findOneAndUpdate({ "_id": user._id }, { $set: requestorsArray }, { new: true, useFindAndModify: false });

        if (!user.friends.includes(requestorName)) {
            user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: userFriends }, { new: true, useFindAndModify: false });
        }

        if (!requestor.friends.includes(user.username)) {
            requestor = await Accounts.findOneAndUpdate({ "_id": requestor._id }, { $set: requestorFriends }, { new: true, useFindAndModify: false });
        }

        res.send(`Successfully handshaked with @${requestorName}`);
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

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: userFriends }, { new: true, useFindAndModify: false });
        res.send(user);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : friendlist.
router.get('/friendlist/:friend', getProfile, async (req, res) => {

    const userID = req.user.id;
    const friendname = req.params.friend;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID).select("-_id username friends blocked");
        let friend = await Accounts.findOne({ "username": friendname }).select("-_id friends");

        if (!friend)
            res.status(401).json("Not allowed");
        else if (friend.friends.includes(user.username))
            res.send(friend.friends);
        else
            res.status(401).json("Not allowed");
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : Block a user
router.put('/block/:userToBeBlocked', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const userToBeBlockedName = req.params.userToBeBlocked;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        let userToBeBlocked = await Accounts.find({ "username": userToBeBlockedName }).select("blockedBy");
        userToBeBlocked = userToBeBlocked[0];

        if (!userToBeBlocked) { return res.status(404).json(`No user with username @${userToBeBlockedName} exists in the database.`) };

        if (user.blocked.includes(userToBeBlockedName)) { return res.json(`You have already blocked@ ${userToBeBlockedName}.`) }

        // Blocking user on user side
        let blocklist = { blocked: [] };
        blocklist.blocked = blocklist.blocked.concat(user.blocked);
        blocklist.blocked = blocklist.blocked.concat(userToBeBlockedName);

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: blocklist }, { new: true, useFindAndModify: false });

        // Updating blocked user's blockedBy list
        let blockedUser = { blockedBy: [] };
        blockedUser.blockedBy = blockedUser.blockedBy.concat(userToBeBlocked.blockedBy);
        blockedUser.blockedBy = blockedUser.blockedBy.concat(user.username);

        blockedUser = await Accounts.findOneAndUpdate({ "_id": userToBeBlocked._id }, { $set: blockedUser }, { new: true, useFindAndModify: false })

        res.send(`successfully blocked @${userToBeBlockedName}`);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

// Route description : unBlock a user
router.put('/unblock/:userToBeUnBlocked', getProfile, async (req, res) => {

    const userID = await req.user.id;
    const userToBeUnBlockedName = req.params.userToBeUnBlocked;
    try {
        // Find user in the database
        let user = await Accounts.findById(userID);
        let userToBeUnblocked = await Accounts.find({ "username": userToBeUnBlockedName }).select("blockedBy");
        userToBeUnblocked = userToBeUnblocked[0];

        if (!userToBeUnblocked) { return res.status(404).json(`No user with username @${userToBeUnBlockedName} exists in the database.`) };

        if (!user.blocked.includes(userToBeUnBlockedName) && !userToBeUnblocked.blockedBy.includes(user.username)) { return res.json(`You have not blocked @${userToBeUnBlockedName}.`) };

        function unBlock(username) {
            return username != userToBeUnBlockedName;
        }

        // Blocking user on user side
        let blocklist = { blocked: [] };
        blocklist.blocked = blocklist.blocked.concat(user.blocked);
        blocklist.blocked = blocklist.blocked.filter(unBlock);

        user = await Accounts.findOneAndUpdate({ "_id": userID }, { $set: blocklist }, { new: true, useFindAndModify: false });

        // Updating blocked user's blockedBy list
        function removeFromBlockedBy(username) {
            return username != user.username;
        }
        let blockedUser = { blockedBy: [] };
        blockedUser.blockedBy = blockedUser.blockedBy.concat(userToBeUnblocked.blockedBy);
        blockedUser.blockedBy = blockedUser.blockedBy.filter(removeFromBlockedBy);

        blockedUser = await Accounts.findOneAndUpdate({ "_id": userToBeUnblocked._id }, { $set: blockedUser }, { new: true, useFindAndModify: false })

        res.send(`successfully blocked @${userToBeUnBlockedName}`);
    } catch (error) {
        res.status(500).json({ message: "Some error occurred", error: error.message })
    }
});

module.exports = router