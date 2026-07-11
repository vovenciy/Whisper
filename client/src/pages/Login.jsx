import React from 'react';
import { Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, ConfigProvider, Flex } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MyTokenContext } from '../context/MyToken';
import { useContext } from 'react';
import { useEffect } from 'react';
import { SocketContext } from '../context/Socket';
import { MyNameContext } from '../context/MyName';
import '../styles/LoginAndRegistration.css'
export default function Login () {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [userpassword, setUserpassword] = useState('')
    const [messageFromServer, setMessageFromServer] = useState('')
    const {MyToken, setMyToken} = useContext(MyTokenContext)
    const {Socket, setSocket} = useContext(SocketContext)
    const {MyName, setMyName} = useContext(MyNameContext)
    setMyName('')
    setMyToken('')
    const handleEnterClick = async (name, password) => {
        
        const enteredData = {name: name, password: password}
        try {
            const response = await fetch('http://localhost:5001/login', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(enteredData) 
           })
           if (response.status===200) {
            const data = await response.json()
            setMyName(name)
            setMyToken(data.message)
            navigate('/Main')
            

            
           } else if (response.status===401) {
            setMessageFromServer('user is not found')
           } else {
            setMessageFromServer('wrong password')
           }
        } catch (error) {
            console.log(error)
        }
    }
    
    return (
        <div class="login-wrapper">
            <div class = "login-container">
                <h1 class = "welcome-title">Whisper</h1>
                <form class="login-form" onSubmit={(event) => event.preventDefault()}>
                    <input onChange={(event) => setUsername(event.target.value)} placeholder="Enter name" class="login-input"/>
            
                    <input onChange={(event) => setUserpassword(event.target.value)} class = "login-input"
                    placeholder="input password"
                    />
            
                    <button class = "login-btn" onClick={(event) => handleEnterClick(username, userpassword)} disabled={username != '' & userpassword != '' ? 0: 1} >
                    Log in
                    </button>
                    <h1>{messageFromServer}</h1>
                    <p class = "login-redirect">don't have an account?</p>
                    <a href="/Registration">Registration</a>
                </form>
            </div>
        </div>
    )
}