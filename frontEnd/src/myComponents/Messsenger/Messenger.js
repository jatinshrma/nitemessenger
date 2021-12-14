// Impotring Modules
import React, { createRef, useState, useEffect, useContext, useRef } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import queryString from 'query-string';
import Picker from 'emoji-picker-react';
import { io } from 'socket.io-client'

// Imporing Files
import mssgContext from "../context/message/mssgContext";
import ChatItem from './ChatItem';
import ChatNav from './ChatNav';
import Smile from '../img/smile.svg';
import './Messenger.css';

const Messenger = (props) => {

    const location = useLocation();
    const history = useHistory()

    // Extract params from the url
    const params = queryString.parse(location.search);
    const friend = params.friend
    const user = params.user

    const Token = localStorage.getItem(user)
    if (!Token) {
        history.push('/login');
    }

    // Destructuring from context
    const context = useContext(mssgContext);
    const { chat, setChat, getMessages, sendMessage, friendsProfile, getFriendsProfile } = context;

    // Refs
    let socket = useRef();
    const inputRef = createRef();

    // States
    const [showPicker, setShowPicker] = useState(false);
    const [cursorLocation, setCursorLocation] = useState();

    // Scroll to the bottom
    if (window.pageYOffset === 0) {
        window.scrollTo(0, window.document.body.scrollHeight);
    }

    const [messageStatus, setMessageStatus] = useState(false);
    const [activeStatus, setActiveStatus] = useState(false);
    const [activeUsers, setActiveUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {

        socket.current = io(process.env.REACT_APP_SOCKET);
        socket.current.emit("addUser", user);

        socket.current.on("getUsers", users => {
            setActiveUsers(users);
        });

        socket.current.on("disconnect", () => {
        })

        socket.current.on("getMessage", (newMessage) => {
            setChat(prevChat => prevChat.concat(newMessage));
        });

        socket.current.on("isFriendTyping", (isTyping) => {
            setIsTyping(isTyping);
        });

        // Fetch Messeges
        getMessages(friend, user);

        // Fetch friend's profile
        getFriendsProfile(friend, user);

        // Scroll to the bottom
        window.scrollTo(0, window.document.body.scrollHeight);
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        var match = false
        activeUsers.forEach(element => {
            if (element.userId === friend && !match) {
                setActiveStatus(true);
                setMessageStatus(true);
                match = true
            }
            else if (!match) {
                setActiveStatus(false);
                setMessageStatus(false);
                match = false
            }
        });
        // eslint-disable-next-line
    }, [activeUsers])

    // Reset Scroll to bottom after fetching messages
    useEffect(() => {

        chat.forEach(element => {

            if (element.status !== 'seen' && element.receiver === user) {
                console.log("on receiver side, marking status as seen");
                fetch(`http://localhost:5000/status/seen`, {
                    method: 'PUT',
                    headers: {
                        'Token': localStorage.getItem(user),
                        'id': element._id,
                    },
                });
            }
        });
        window.scrollTo(0, window.document.body.scrollHeight);
        // eslint-disable-next-line
    }, [chat])

    // Handles Inserting an emoji.
    const onEmojiClick = (event, emojiObject) => {

        const ref = inputRef.current;
        ref.focus();
        const start = inputRef.current.substring(0, ref.selectionStart);
        const end = inputRef.current.substring(ref.selectionStart);
        const text = start + emojiObject.emoji + end;
        inputRef.current.value = text;
        setCursorLocation(start.length + 2);
    };

    // Set cursor position after inserting an emoji
    useEffect(() => {
        inputRef.current.selectionEnd = cursorLocation;
        // eslint-disable-next-line
    }, [cursorLocation])

    // Handle onChange input and height of Text-Area
    const onchange = (e) => {
        inputRef.current.rows = e.target.value.split("\n").length;
        window.scrollTo(0, window.pageYOffset);

        inputRef.current.value.length !== 0 ?
            socket.current.emit("typing", true, friend)
            : socket.current.emit("typing", false, friend)

    }

    // Send Message into database and re-fetch updated messages.
    const sendMsgHandler = async (e) => {
        e.preventDefault();
        const typedMessage = inputRef.current.value;
        let status = "sent";

        activeUsers.forEach(element => {
            if (element.userId === friend) {
                status = "seen";
            }
        });

        if (typedMessage) {

            socket.current.emit("typing", false, friend);

            const sentMessage = await sendMessage(typedMessage, friend, user, status);
            socket.current.emit("sendMessage", sentMessage, friend);
            getMessages(friend, user);
            inputRef.current.value = "";
            inputRef.current.rows = 1;
            window.scrollTo(0, window.document.body.scrollHeight);
        };
    }

    var count = 0;
    return (
        <>
            <ChatNav user={user} friend={friendsProfile} activeStatus={activeStatus} />
            <div id="chatContainer" className="px-2">
                {chat.map(element => {
                    count++;
                    let showStatus = false;
                    if (chat.length === count && element.sender === user) {
                        showStatus = true;
                    }

                    // Date validation
                    const newDate = new Date(element.date).toUTCString().substring(0, 16);
                    const lastDate = sessionStorage.getItem('date');
                    if (lastDate !== newDate) {
                        var validation = false;
                        sessionStorage.setItem('date', newDate);
                    }
                    else {
                        validation = true
                    }

                    // Class specification
                    const chatClass = element.sender === user ? "sentTxt" : "recTxt";

                    return <ChatItem chat={element} date={!validation && newDate} chatClass={chatClass} key={element._id ? element._id : Date.now()} msg={element.message} messageStatus={messageStatus} showStatus={showStatus} />;
                })}
                {isTyping && <div className="dots-cont my-1 mx-2">
                    <span className="dot dot-1"></span>
                    <span className="dot dot-2"></span>
                    <span className="dot dot-3"></span>
                </div>}
                {showPicker && <div id="emojiContainer">
                    <Picker onEmojiClick={onEmojiClick} />
                </div>}
            </div>
            <form className="d-flex bottomDiv" onSubmit={sendMsgHandler}>
                <div className="d-flex bottomInnerDiv">
                    <button type="button" id="emojiBtn" onClick={() => setShowPicker(val => !val)}><img src={Smile} alt="Emoji" /></button>
                    <textarea rows="1" ref={inputRef} id="txtInput" onChange={onchange} placeholder="Message" />
                </div>
                <button type="submit" id="sendBtn">Send</button>
            </form>
        </>
    )
}

export default Messenger