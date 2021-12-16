import React, { useState } from 'react';
import CircleContext from "./circleContext";

const CircleState = (props) => {

    const host = process.env.REACT_APP_SERVER;
    const [users, setUsers] = useState([]);
    const [friendsProfile, setFriendsProfile] = useState([]);

    // ----------------- Request -----------------
    const request = async (username, user) => {

        const response = await fetch(`${host}/accounts/request/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }


    // ----------------- Cancel Request -----------------
    const cancelrequest = async (username, user) => {

        const response = await fetch(`${host}/accounts/cancelrequest/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }

    // ----------------- Decline Request -----------------
    const declinerequest = async (username, user) => {

        const response = await fetch(`${host}/accounts/declinerequest/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }

    // ----------------- Handshake -----------------
    const handshake = async (username, user) => {

        const response = await fetch(`${host}/accounts/handshake/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }


    // ----------------- Goodbye -----------------
    const goodbye = async (username, user) => {

        const response = await fetch(`${host}/accounts/goodbye/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }


    // ----------------- Block -----------------
    const block = async (username, user) => {

        const response = await fetch(`${host}/accounts/block/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }


    // ----------------- unblock -----------------
    const unblock = async (username, user) => {

        const response = await fetch(`${host}/accounts/unblock/${username}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user)
            }
        })
        return response.json();
    }

    const fetchUsers = async (user) => {
        const response = await fetch(`${host}/accounts/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user),
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

        <CircleContext.Provider value={{
            request, cancelrequest, declinerequest,
            handshake, goodbye,
            block, unblock,
            users, fetchUsers,
            friendsProfile, getFriendsProfile
        }}>
            {props.children}
        </CircleContext.Provider>
    )
}

export default CircleState