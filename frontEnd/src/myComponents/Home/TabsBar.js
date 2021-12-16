import React from 'react'
import profileIco from '../img/profile.svg'
import chatIco from '../img/chat.svg'
import searchIco from '../img/search.svg'
import requestIco from '../img/requests.svg'

const TabsBar = (props) => {

    const { user } = props;
    return (
        <div className="tabs-bar">
            <div className="tabs" onClick={() => window.location.href = `/home/?user=${user}`}>
                <div className="w-100" >
                    <img src={chatIco} className="tabsIco" alt="tab-Icon" />
                </div>
            </div>
            <div className="tabs" onClick={() => window.location.href = `/requests/?user=${user}`}>
                <div className="w-100" id="mid-tab">
                    <img src={requestIco} className="tabsIco" alt="tab-Icon" />
                </div>
            </div>
            <div className="tabs" onClick={() => window.location.href = `/explore/?user=${user}`}>
                <div className="w-100" id="mid-tab">
                    <img src={searchIco} className="tabsIco" alt="tab-Icon" />
                </div>
            </div>
            <div className="tabs" onClick={() => window.location.href = `/profile/?user=${user}`}>
                <div className="w-100">
                    <img src={profileIco} className="tabsIco" alt="tab-Icon" />
                </div>
            </div>
        </div>
    )
}

export default TabsBar