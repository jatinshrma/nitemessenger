import { useState } from 'react';
import MssgContext from "./mssgContext";

const MssgState = (props) => {

    const [chat, setChat] = useState([]);
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

    return (

        <MssgContext.Provider value={{
            chat, setChat,
            getMessages, sendMessage, unsend,
        }}>
            {props.children}
        </MssgContext.Provider>
    )
}

export default MssgState