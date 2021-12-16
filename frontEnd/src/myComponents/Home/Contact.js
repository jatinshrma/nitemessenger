import React, { useEffect, useState, useContext } from 'react';
import { Link } from "react-router-dom";
import doticon from '../img/3dots.svg';
import defaultDp from '../img/default-dp.png';

import circleContext from "../context/friendcirle/circleContext";

const ContactItem = (props) => {

    const circle_Context = useContext(circleContext);
    const { block, unblock, goodbye } = circle_Context;

    const { user, params, currentUser, accountUser } = props;
    const dp = `${process.env.REACT_APP_USER_DP}/${user.dp_id}`;

    const [isBlock, setIsBlock] = useState(false);

    useEffect(() => {
        if (accountUser) {
            if (accountUser.blocked.includes(user.username)) {
                setIsBlock(true);
            }
            else {
                setIsBlock(false);
            }
        }
    }, [accountUser, user.username])

    const blockUser = () => {
        block(user.username, currentUser)
        setIsBlock(true);
    }

    const unblockUser = () => {
        unblock(user.username, currentUser)
        setIsBlock(false);
    }
    
    const removeFriend = () => {
        goodbye(user.username, currentUser)
    }

    return (
        <li className="d-flex">
            <Link to={`/chat/${params}&friend=${user.username}`} style={{ width: '100%', textDecoration: 'none' }} >
                <div className="d-flex justify-content-between align-items-start ContactItem">
                    <div id="contact-dpContainer">
                        <img id="contact-dp" src={user.dp_id.length > 10 ? dp : defaultDp} alt="Profile" />
                    </div>
                    <div className="me-auto" style={{ margin: "auto 20px" }}>
                        <div>{currentUser === user.username ? "Me" : user.name}</div>
                        {user.username}
                    </div>
                </div>
            </Link>
            <div className="dropdown" id="menu-dots">
                <div id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <img style={{ width: "39px" }} alt="menu" src={doticon} />
                </div>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" id="contactMenu">

                    {isBlock &&
                        <button onClick={unblockUser} className="dropdown-item cmItem">Unblock</button>}

                    {!isBlock &&
                        <button onClick={blockUser} className="dropdown-item" id="cmItemDel">Block</button>}

                    <div onClick={removeFriend} className="dropdown-item cmItem">
                        Unfriend
                    </div>
                </div>
            </div>
        </li>
    )
}

export default ContactItem
