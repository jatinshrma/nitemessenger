import React, { useState } from 'react';
import UserContext from "./userContext";
import axios from 'axios'

const UserState = (props) => {

    const host = process.env.REACT_APP_SERVER;
    const [profile, setProfile] = useState('');

    // Login User
    const login = async (credentials) => {

        const response = await fetch(`${host}/accounts/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        })

        const data = await response.json();
        if (data.Token) {
            localStorage.setItem(credentials.username, data.Token);
            localStorage.setItem("user", credentials.username );
            return true;
        }
        else {
            console.log('Credentials are not valid.');
            return false;
        }
    }

    // Fetch user's profile
    const getProfile = async (user) => {

        const response = await fetch(`${host}/accounts/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user),
            }
        })
        const data = await response.json();
        setProfile(data);
    }

    // Upload image
    const [imageResponse, setImageResponse] = useState("");
    const uploadPicture = async (file) => {

        const formData = new FormData();
        formData.append("imageFile", file);

        await axios
            .post(`${host}/dp/upload`, formData)
            .then((res) => {
                setImageResponse(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    // Get image file.
    const getImageFile = async (filename) => {
        const response = await fetch(`${host}/dp/files/${filename}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const data = await response.json();
        return data
    }

    // Delete image
    const deletePicture = async (id) => {
        axios
            .delete(`${host}/dp/files/${id}`)
            .then((res) => {
                console.log(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    // ----------------- Update user's profile -----------------
    const updateProfile = async (data, user) => {

        const response = await fetch(`${host}/accounts/profile/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Token': localStorage.getItem(user),
            },
            body: JSON.stringify(data)
        })
        await response.json();
    }

    // ----------------- Signup -----------------
    const signup = async (data) => {

        const response = await fetch(`${host}/accounts/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        return response.json();
    }

    return (

        <UserContext.Provider value={{ signup, login, profile, getProfile, updateProfile, uploadPicture, imageResponse, getImageFile, deletePicture }}>
            {props.children}
        </UserContext.Provider>
    )
}

export default UserState