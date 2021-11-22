import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import userContext from '../context/authenticate/userContext';
import queryString from 'query-string';
import TabsBar from './TabsBar';
import "./Home.css";

const UserProfile = () => {

    // Extract params from the url
    const history = useHistory();
    const urlparam = history.location.search;
    const param = queryString.parse(urlparam);

    const Token = localStorage.getItem(param.user)
    if (!Token) {
        history.push('/login');
    }
    const context = useContext(userContext);
    const { profile, getProfile, updateProfile, uploadPicture, imageResponse, getImageFile, deletePicture } = context;

    const [file, setFile] = useState(null);
    const [fileBase64String, setFileBase64String] = useState("");
    const [editContent, setEditContent] = useState(false);

    const [updateData, setUpdateData] = useState({ dp_id: null, bio: "", name: 'Loading...', email: 'Loading...' });

    // Get user profile
    useEffect(() => {
        getProfile(param.user);
        // eslint-disable-next-line
    }, []);

    // Get user's image file
    useEffect(() => {
        const callback = async () => {
            setUpdateData({
                dp_id: profile.dp_id,
                bio: profile.bio,
                name: profile.name,
                email: profile.email
            });
            await getImageFile(profile.dp_id);
        }
        profile && callback()
        // eslint-disable-next-line
    }, [profile]);

    // Set input File value as state.
    const onDPChange = (e) => {
        setFile(e.target.files[0])
    }

    // Encode input image into base64.
    useEffect(() => {

        const encodeFileBase64 = (file) => {
            var reader = new FileReader();
            if (file) {
                reader.readAsDataURL(file);
                reader.onload = () => {
                    var Base64 = reader.result;
                    setFileBase64String(Base64);
                };
                reader.onerror = (error) => {
                    console.log("error: ", error);
                };
            }
        };
        encodeFileBase64(file)
    }, [file])

    // ----------------------- Update ----------------------- 

    // Set update data into state object.
    const onchange = (e) => {
        setUpdateData({ ...updateData, [e.target.name]: e.target.value })
    }

    // Update profile picture
    const UpdateHandler = async (e) => {
        e.preventDefault()
        !imageResponse.file && updateProfile(updateData, param.user);
        file && deletePicture(profile.dp_id) &&
            await uploadPicture(file)
        setEditContent(false)
    }

    // Insert uploaded image' filename into updateData data state
    useEffect(() => {
        imageResponse.file && setUpdateData({ ...updateData, dp_id: imageResponse.file.filename })
        // eslint-disable-next-line
    }, [imageResponse.file])

    // Perform UpDate
    useEffect(() => {
        imageResponse.file && updateProfile(updateData, param.user);
        // eslint-disable-next-line
    }, [updateData.dp_id]);

    return (
        <>
            <TabsBar user={profile.username} />
            <div className="card mb-3 bg-dark">
                <div className="row g-0">
                    <div className="col-md-4" id="profile_page_dp_div">
                        {editContent && <form name="fileForm" onSubmit={uploadPicture} encType="multipart/form-data">
                            <input type="file" id="dp_update_input" onChange={onDPChange} className="d-none" />
                        </form>}
                        <label htmlFor="dp_update_input">{profile && <img src={fileBase64String ? fileBase64String : `${process.env.REACT_APP_USER_DP}/${profile.dp_id}`} id="profile_page_dp" alt="..." />}</label>
                    </div>
                    <div className="col-md-8">
                        <div className="card-body g-0 card p-2 bg-dark">
                            <div className="card-body">
                                <h5 className="card-title">{updateData.name ? updateData.name : profile.name}</h5>

                                {!editContent && <p className="list-value-bio card-text">{updateData.bio ? updateData.bio : profile.bio}</p>}

                                {editContent &&
                                    <>
                                        <textarea rows='2' name="bio" value={updateData.bio} onChange={onchange} className="bio-textarea form-control" maxLength="150" style={{ outline: "none" }} />
                                        {updateData.bio && <span className="list-value-bio mx-2" id="bio-length">{updateData.bio.length}/150</span>}
                                    </>
                                }

                            </div>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item bg-dark text-white d-flex">
                                    <div className="list-keys">Name</div>
                                    {!editContent && <div className="list-values">{updateData.name ? updateData.name : profile.name}</div>}
                                    {editContent && <div className="list-values"><input type="text" className="form-control" name="name" value={updateData.name} onChange={onchange} /></div>}
                                </li>
                                <li className="list-group-item bg-dark text-white d-flex">
                                    <div className="list-keys">Username</div>
                                    <div className="list-values">{profile.username}</div>
                                </li>
                                <li className="list-group-item bg-dark text-white d-flex">
                                    <div className="list-keys">Email</div>
                                    {!editContent && <div className="list-values">{updateData.email ? updateData.email : profile.email}</div>}
                                    {editContent && <div className="list-values"><input type="text" className="form-control" name="email" value={updateData.email} onChange={onchange} /></div>}
                                </li>
                            </ul>
                        </div>
                        {editContent && <button onClick={UpdateHandler} className="btn m-2 mx-4">Save</button>}
                        {!editContent && <button onClick={() => setEditContent(true)} className="btn m-2 mx-4">Edit</button>}
                    </div>
                </div>
            </div>
        </>
    )
}

export default UserProfile
