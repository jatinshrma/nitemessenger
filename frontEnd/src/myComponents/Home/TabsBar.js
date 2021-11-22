import React from 'react'
import profileIco from '../img/profile.svg'
import friendsIco from '../img/friends.svg'

const TabsBar = (props) => {

    const { user } = props;
    return (
        <div className="tabs-bar">
            <div className="tabs" onClick={() => window.location.href = `/home/?user=${user}`}>
                <div className="w-100" >
                    <img src={friendsIco} className="tabsIco" alt="tab-Icon" />
                </div>
            </div>
            <div className="d-flex align-items-center">
                <div className="h-50" id="mid-tab"><p></p></div>
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