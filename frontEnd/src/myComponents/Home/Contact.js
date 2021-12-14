import React from 'react';
import { Link } from "react-router-dom";
import doticon from '../img/3dots.svg';

const ContactItem = (props) => {

    const { user, params, currentUser } = props;
    const dp = `${process.env.REACT_APP_USER_DP}/${user.dp_id}`;
    const defaultDP = process.env.REACT_APP_DEFAULT_DP;
    return (
        <li className="d-flex">
            <Link to={`/chat/${params}&friend=${user.username}`} style={{ width: '100%', textDecoration: 'none' }} >
                <div className="d-flex justify-content-between align-items-start ContactItem">
                    <div id="contact-dpContainer">
                        <img id="contact-dp" src={user.dp_id.length > 14 ? dp : defaultDP} alt="Profile" />
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
                    <a className="dropdown-item" id="cmItem" href="/">Mute</a>
                    {/* <button className="dropdown-item" id="cmItem">Block</button> */}
                    <button className="dropdown-item" id="cmItemDel">Block</button>
                </div>
            </div>
        </li>
    )
}

export default ContactItem
