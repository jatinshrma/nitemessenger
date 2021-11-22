import React, { useState, useContext } from 'react'
import userContext from './context/authenticate/userContext'
import { Link, useHistory } from "react-router-dom";
import '../Style.css'

const Login = () => {

    const history = useHistory();
    const context = useContext(userContext);
    const {login} = context;
    const [loginData, setLoginData] = useState({ username: "", password: "" })
    const onchange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value })
    }

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            const success = await login(loginData)
            if(success){ history.push(`/home/?user=${loginData.username}`) }
        } catch (error) {
            console.log(error.message);
        }
    }

    return (
        <>
            <h1 className="my-3 mx-5 text-center login-Head">Welcome back to Nite Messenger! <br/> We missed you. 😊😻</h1>
            <div className=" d-flex justify-content-center mt-5 container">
                <form style={{ width: '450px' }} onSubmit={loginHandler}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input type="text" name="username" className="form-control" id="username" value={loginData.username} onChange={onchange} aria-describedby="emailHelp" />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" name="password" className="form-control" id="password" value={loginData.password} onChange={onchange} />
                    </div>
                    <p>Don't have any account yet? <Link to="/signup" style={{ textDecoration: "none" }}>Sign up</Link></p>
                    <button type="submit" className="btn" style={{ background: "#2f2d52", color: "white" }}>Login</button>
                </form>
            </div>
        </>
    )
}

export default Login
