import React, { useEffect, useContext, useState, useRef } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import queryString from 'query-string';
import Contact from './Contact'
import mssgContext from "../context/message/mssgContext";
import TabsBar from './TabsBar';
import { io } from 'socket.io-client'
import './Home.css';
import Navbar from './HomeNavbar';

const ContactsList = () => {

    // Clear stored date in session storage
    sessionStorage.removeItem('date')

    // Refs
    let socket = useRef();

    useEffect(() => {

        socket.current = io(process.env.REACT_APP_SOCKET);
        socket.current.emit("addUser", user);

        socket.current.on("getUsers", users => {
        });

        socket.current.on("disconnect", () => {
        });
        // eslint-disable-next-line
    }, [])

    const [seachInput, setSeachInput] = useState("");
    const history = useHistory();
    const location = useLocation();
    const context = useContext(mssgContext);
    const { users, fetchUsers } = context;

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, [])

    // Extract friend's username from the url
    const params = queryString.parse(location.search);
    const user = params.user

    const Token = localStorage.getItem(user)
    if (!Token) {
        history.push('/login');
    }

    const urlparam = history.location.search;
    return (
        <>
            <Navbar user={user} />
            <TabsBar user={user} />
            <div id="home-search-div">
                <form className="d-flex">
                    <input className="form-control" id="home-search-input" type="search" placeholder="Type to search" aria-label="Search" onChange={(e) => setSeachInput(e.target.value)} />
                </form>
            </div>
            <div className="bg-black w-100">
                <ul className="d-block m-0 p-0">
                    {!seachInput && users.map(element => {
                        return <Contact key={element._id} user={element} params={urlparam} currentUser={user}/>;
                    })}
                    {seachInput && users.map(element => {
                        let name = element.name.toLowerCase();
                        let username = element.username.toLowerCase();
                        let search = seachInput.toLowerCase();
                        if (name.includes(search) || username.includes(search)) {
                            return <Contact key={element._id} user={element} params={urlparam} />;
                        }
                        else {
                            return null;
                        }
                    })}
                </ul>
            </div>
        </>
    )
}

export default ContactsList