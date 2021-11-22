import React, { useState, useEffect, useContext } from 'react';
import { Link, useHistory } from "react-router-dom";
import DeskPic from './img/default-dp.png';
import '../Style.css'
import userContext from './context/authenticate/userContext';

const Signup = () => {

    const history = useHistory();
    const [signupData, setSignupData] = useState({ dp_id: "", name: "", email: "", username: "", password: "", });

    const [file, setFile] = useState(null);
    const [fileBase64String, setFileBase64String] = useState("");

    const context = useContext(userContext)
    const { signup, uploadPicture, imageResponse } = context;

    // ------------------- Preview-Image before uploading -----------------

    const onImageChange = (e) => {
        setFile(e.target.files[0])
    }

    // Convert image to base64 string which is used as a source for img tag.
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


    // ----------------------- Sign Up ----------------------- 

    // Set sign up data
    const onchange = (e) => {
        setSignupData({ ...signupData, [e.target.name]: e.target.value })
    }

    // Upload profile picture
    const handleSignUp = (e) => {
        e.preventDefault();
        uploadPicture(file)
    }

    // Insert uploaded image' filename into signup data state
    useEffect(() => {
        imageResponse && setSignupData({ ...signupData, dp_id: imageResponse.file.filename })
        // eslint-disable-next-line
    }, [imageResponse])

    // Perform Signup
    useEffect(() => {
        const callback = async () => {
            const content = await signup(signupData);
            if (content.Token) {
                localStorage.setItem(signupData.username, content.Token);
                localStorage.setItem("user", signupData.username);
                history.push(`/home/?user=${signupData.username}`);
            }
            else { console.log('Credentials are not valid.') }
        }
        signupData.dp_id && callback();
        // eslint-disable-next-line
    }, [signupData.dp_id]);

    return (
        <>
            <h3 className="my-3 mx-5 text-center signup-Head">Welcome to Nite Messenger 😊😻</h3>
            <form className="profile-pic-form mt-5" id="fileForm" name="fileForm" >
                <label type="submit" htmlFor="file">
                    <img className="w-100" alt="default" src={fileBase64String ? fileBase64String : DeskPic} />
                </label>
                <input type="file" name="file" id="file" className="file-input" onChange={onImageChange} />
            </form>
            <div className=" d-flex justify-content-center mt-3 container">
                <form style={{ width: '500px' }} onSubmit={handleSignUp}>
                    <div className="mb-3">
                        <input type="text" className="form-control" id="name" name="name" value={signupData.name} onChange={onchange} aria-describedby="emailHelp" placeholder="Full Name" />
                    </div>
                    <div className="mb-3">
                        <input type="email" className="form-control" id="email" name="email" value={signupData.email} onChange={onchange} aria-describedby="emailHelp" placeholder="Email" />
                    </div>
                    <div className="mb-3">
                        <input type="text" className="form-control" id="username" name="username" value={signupData.username.toLowerCase()} onChange={onchange} aria-describedby="emailHelp" placeholder="Username" />
                    </div>
                    <div className="mb-3">
                        <input type="password" className="form-control" id="password" name="password" value={signupData.password} onChange={onchange} placeholder="Password" />
                        <div className="for m-text">We'll never share your password with anyone.</div>
                    </div>
                    <p>Already have an account? <Link to="/login" style={{ textDecoration: "none" }}>Log in</Link></p>
                    <button type="submit" className="btn">Signup</button>
                </form>
            </div>
        </>
    )
}

export default Signup
