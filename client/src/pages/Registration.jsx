import React from 'react';
import { Input } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { Button, ConfigProvider, Flex } from 'antd';
import { useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import {customAlphabet} from 'nanoid'
import { SocketContext } from '../context/Socket';
import { useContext } from 'react';
import '../styles/LoginAndRegistration.css'

export default function Registration () {
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [messageFromServer, setMessageFromServer] = useState('')
    const {Socket, setSocket} = useContext(SocketContext)
    const SendingToServer = async (name, password) => {
        const data = { name: name, password: password }
        try {
           const response = await fetch('http://localhost:8080/registration', {
                method: 'POST', 
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data) 
           }) 
           if (response.status===200) {
                setMessageFromServer('account created')
                
                     
           } else {
                setMessageFromServer('this name is already taken')
           }
        } catch (error) {
          console.log(error)  
        }
        
    }

    return (
        <div class = "login-wrapper">
            <div class = "login-container">
                <h1 class = "welcome-title">Whisper</h1>
                <form class = "login-form" onSubmit={(event) => event.preventDefault()}>
                    <input class = "login-input" onChange={(event) => setName(event.target.value)} placeholder="create a name"/>
                    <input class = "login-input" onChange={(event) => setPassword(event.target.value)} 
                    placeholder="create a password"
                    />
        
                    <button class = "login-btn" disabled={name != '' & password != '' ? 0: 1} onClick = {(event) => SendingToServer(name, password)}>
                    Sign up
                    </button>
                    <h1>{messageFromServer}</h1>
                    <p>already have an account?</p>
                    <a href="/Login">Login</a>
                    
                </form>
            </div>
        </div>
    )
}