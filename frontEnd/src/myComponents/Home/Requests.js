import React, { useEffect, useContext, useState, useRef } from 'react';
import queryString from 'query-string';
import { useHistory, useLocation } from "react-router-dom";

// Importing components
import TabsBar from './TabsBar';
import Navbar from './HomeNavbar';
import receivedIco from '../img/download.svg'
import sentIco from '../img/upload.svg'

// Importing contexts
import userContext from "../context/authenticate/userContext";
import circleContext from "../context/friendcirle/circleContext";
import { io } from 'socket.io-client'

// Importing components
import ExploreContact from './ExploreContact';
const Requests = () => {

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
    const user = params.user;

    const Token = localStorage.getItem(user)
    if (!Token) {
        history.push('/login');
    }

    // States
    const [seachInput, setSeachInput] = useState("");
    const [accountUser, setAccountUser] = useState("");
    const [requestMode, setRequestMode] = useState("received")

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
            <div className="tabs-bar">
                <div className="tabs" onClick={() => setRequestMode("received")} style={{ "borderBottom": requestMode === 'received' ? "1px solid #a6a6ab" : "none" }}>
                    <div className="w-100 requestsTab" >
                        <img src={receivedIco} className="tabsIco" alt="tab-Icon" />
                        <span>Received Requests</span>
                    </div>
                </div>
                <div className="tabs" onClick={() => setRequestMode("sent")} style={{ "borderBottom": requestMode === 'sent' ? "1px solid #a6a6ab" : "none" }}>
                    <div className="w-100 requestsTab">
                        <img src={sentIco} className="tabsIco" alt="tab-Icon" />
                        <span>Sent Requests</span>
                    </div>
                </div>
            </div>
            <div id="home-search-div">
                <form className="d-flex">
                    <input className="form-control" id="home-search-input" type="search" placeholder="Type to search" aria-label="Search" onChange={(e) => setSeachInput(e.target.value)} />
                </form>
            </div>
            <div className="bg-black w-100">
                <ul className="d-block m-0 p-0">

                    {!seachInput && requestMode === 'received' && users.map(element => {
                        if (accountUser && accountUser.requestedBy.includes(element.username)) {
                            return <ExploreContact key={element.username} user={element} currentUser={user} requested={true} requestMode={requestMode} />;
                        }
                        else {
                            return null
                        }
                    })}

                    {!seachInput && requestMode === 'sent' && users.map(element => {
                        if (accountUser && accountUser.requested.includes(element.username)) {
                            return <ExploreContact key={element.username} user={element} currentUser={user} requested={true} requestMode={requestMode} />;
                        }
                        else {
                            return null
                        }
                    })}

                    {seachInput && users.map(element => {
                        let name = element.name.toLowerCase();
                        let username = element.username.toLowerCase();
                        let search = seachInput.toLowerCase();
                        if (name.includes(search) || username.includes(search)) {
                            if (requestMode === 'sent' && accountUser && accountUser.requested.includes(element.username))
                                return <ExploreContact key={element.username} user={element} currentUser={user} />;
                            else if (requestMode === 'received' && accountUser && element.requested.includes(user))
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

export default Requests