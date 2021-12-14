import React from 'react'
import backIcon from '../img/backIcon.png'
import { useHistory } from "react-router-dom";

const ChatNav = (props) => {

    const history = useHistory();
    const { user, friend, activeStatus } = props;

    return (
        <nav className="navbar navbar-dark p-0" id="messenger-nav" style={{ background: "#161616" }}>
            <div onClick={history.goBack} style={{ marginLeft: '10px' }}>
                <img src={backIcon} alt="back" style={{ height: '26px' }} />
            </div>
            <div className="d-flex navbar-brand m-0 mx-1">
                <div className="nav-dpContainer">
                    <img className="nav-profilePic" src={`${process.env.REACT_APP_USER_DP}/${friend.dp_id}`} alt="Profile" />
                </div>
                <h3 style={{ margin: "auto 5px", fontSize: "inherit" }}>
                    {user === friend.username ? "Me" : friend.username}
                    {activeStatus && <div>😺</div>}
                    {!activeStatus && <div>🙈</div>}
                </h3>
            </div>
        </nav>
    )
}

export default ChatNav
