import { useState } from 'react';
import MssgContext from "./mssgContext";

const MssgState = (props) => {

    const [chat, setChat] = useState([]);
    const [users, setUsers] = useState([]);
    const [friendsProfile, setFriendsProfile] = useState([]);
    const host = process.env.REACT_APP_SERVER;

    const getMessages = async (friend, user) => {

        const response = await fetch(`${host}/messages/${friend}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            },
        });
        const content = await response.json();
        setChat(content);
    }

    // Send
    const sendMessage = async (message, friend, user, status) => {
        const response = await fetch(`${host}/sendmessage/${friend}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user),
            },
            body: JSON.stringify({ message, status })
        });
        const content = await response.json();
        return content
    };

    // Delete
    const unsend = async (id, user) => {

        await fetch(`${host}/unsendmessage`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user),
                'id': id,
            },
        });
    };

    // Status Update
    const status_update = async (id, user) => {

        //     await fetch(`${host}/status/seen`, {
        //         method: 'PUT',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Token': localStorage.getItem(user),
        //             'id': id,
        //         },
        //     });
    };

    const fetchUsers = async () => {
        const response = await fetch(`${host}/accounts/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setUsers(data)
    }

    const getFriendsProfile = async (friend, user) => {
        const response = await fetch(`${host}/accounts/profile/${friend}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user),
            },
        });
        const data = await response.json();
        setFriendsProfile(data)
    }

    return (

        <MssgContext.Provider value={{ chat, setChat, getMessages, sendMessage, unsend, status_update, users, setUsers, fetchUsers, friendsProfile, getFriendsProfile }}>
            {props.children}
        </MssgContext.Provider>
    )
}

export default MssgState