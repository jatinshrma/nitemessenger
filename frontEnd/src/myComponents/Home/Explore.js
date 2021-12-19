import React, { useEffect, useContext, useState, useRef } from 'react';
import queryString from 'query-string';
import { useHistory, useLocation } from "react-router-dom";
import { io } from 'socket.io-client'

// Importing components
import TabsBar from './TabsBar';
import Navbar from './HomeNavbar';
import ExploreContact from './ExploreContact';

// Importing contexts
import userContext from "../context/authenticate/userContext";
import circleContext from "../context/friendcirle/circleContext";

const Explore = () => {
    // Refs
    let socket = useRef();
    useEffect(() => {

        socket.current = io(process.env.REACT_APP_SOCKET);
        socket.current.emit("addUser", user);

        // eslint-disable-next-line
    }, [])

    const user_Context = useContext(userContext);
    const { getProfile } = user_Context;

    const circle_Context = useContext(circleContext);
    const { users, fetchUsers } = circle_Context;

    const history = useHistory();
    const location = useLocation();

    // Extract friend's username from the url
    const params = queryString.parse(location.search);
    const user = params.user

    const Token = localStorage.getItem(user)
    if (!Token) {
        history.push('/login');
    }

    // States
    const [seachInput, setSeachInput] = useState("");
    const [accountUser, setAccountUser] = useState("");

    useEffect(() => {
        async function func() {
            fetchUsers(user);

            const account = await getProfile(user);
            setAccountUser(account);
        }
        func()
        // eslint-disable-next-line
    }, []);


    return (
        <div>
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
                        if (accountUser && !accountUser.friends.includes(element.username)
                            && !accountUser.requested.includes(element.username)
                            && !accountUser.requestedBy.includes(element.username)) {
                            return <ExploreContact key={element.username} user={element} currentUser={user} />;
                        }
                        else {
                            return null
                        }
                    })}

                    {seachInput && users.map(element => {
                        let name = element.name.toLowerCase();
                        let username = element.username.toLowerCase();
                        let search = seachInput.toLowerCase();
                        if (accountUser && !accountUser.friends.includes(element.username)
                            && !accountUser.requested.includes(element.username)
                            && !accountUser.requestedBy.includes(element.username)) {

                            if (name.includes(search) || username.includes(search))
                                return <ExploreContact key={element.username} user={element} currentUser={user} />;
                            else
                                return null;
                        }
                        else {
                            return null;
                        }
                    })}
                </ul>
            </div>
        </div>
    )
}

export default Explore