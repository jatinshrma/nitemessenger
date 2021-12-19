import React, { useEffect, useContext, useState, useRef } from 'react';
import { useHistory, useLocation } from "react-router-dom";
import queryString from 'query-string';
import { io } from 'socket.io-client'

// Importing components
import './Home.css';
import TabsBar from './TabsBar';
import Navbar from './HomeNavbar';
import Contact from './Contact'

// Importing contexts
import userContext from "../context/authenticate/userContext";
import circleContext from "../context/friendcirle/circleContext";

const ContactsList = () => {
    
    const user_Context = useContext(userContext);
    const { getProfile } = user_Context;

    const circle_Context = useContext(circleContext);
    const { users, fetchUsers } = circle_Context;

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
    const [accountUser, setAccountUser] = useState("");
    const history = useHistory();
    const location = useLocation();
    
    // Extract friend's username from the url
    const params = queryString.parse(location.search);
    const user = params.user

    useEffect(() => {
        async function func() {
            fetchUsers(user);

            const account = await getProfile(user);
            setAccountUser(account);
        }
        func()
        // eslint-disable-next-line
    }, []);

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
                        if (accountUser && accountUser.friends.includes(element.username)) {
                            return <Contact key={element.username} user={element} params={urlparam} currentUser={user} accountUser={accountUser} />;
                        }
                        else {
                            return null;
                        }
                    })}

                    {seachInput && users.map(element => {
                        let name = element.name.toLowerCase();
                        let username = element.username.toLowerCase();
                        let search = seachInput.toLowerCase();
                        if (accountUser && accountUser.friends.includes(element.username)) {
                            if (name.includes(search) || username.includes(search))
                                return <Contact key={element.username} user={element} params={urlparam} />;
                            else {
                                return null;
                            }
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