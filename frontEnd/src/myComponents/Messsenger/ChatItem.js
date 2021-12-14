import React from 'react'
import './Messenger.css'
// import doticon from '../img/3dots.svg'

const ChatItem = (props) => {
    const { msg, chatClass, showStatus, chat, date, messageStatus } = props;
    let align;
    if (chatClass === "sentTxt") {
        align = "end"
    }
    else if (chatClass === "recTxt") {
        align = "start"
    }

    const localTime = new Date(chat.date).toLocaleTimeString();
    const postTimeVAr = localTime.substr(-2);
    const lastIndexes = localTime.substr(-6);
    const time = localTime.split(lastIndexes);

    return (
        <div>
            {date && <div className="text-center date-elements">{date}</div>}
            <div className={`${chatClass}Div d-flex`}>
                <span className={chatClass} id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="true" >
                    {msg}
                    <div className={`text-${align}`} id="chatTime">{time} {postTimeVAr}</div>
                </span>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton" id="contactMenu">
                    <a className="dropdown-item" id="cmItem" href="/">Copy</a>
                    <button className="dropdown-item" id="cmItemDel">Unsend</button>
                </div>
            </div>
            {showStatus && <div id="messageStatus">{messageStatus ? "seen" : chat.status}</div>}
            {/* {messageStatus && <div id="messageStatus">seen</div>} */}
        </div>
    )
}

export default ChatItem
