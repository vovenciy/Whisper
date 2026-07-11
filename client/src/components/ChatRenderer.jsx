import React from "react";
import MyMessage from "./MyMessage";
import ContactMessage from "./ContactMessage";
import { useContext } from "react";
import { MyTokenContext } from "../context/MyToken";
import { useState, useRef, useEffect } from "react";
import '../styles/WriteAndSend.css'
import { CurrentChatContext } from "../context/CurrentChat";
import { CurrentContactContext } from "../context/CurrentContact";
import { SocketContext } from "../context/Socket";
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons'; // Стрелочка вверх обычно используется в инпутах

export default function ChatRenderer({ChatToRender}) {
    const {Socket, setSocket} = useContext(SocketContext)
    const {CurrentContact, setCurrentContact} = useContext(CurrentContactContext)
    const {CurrentChat, setCurrentChat} = useContext(CurrentChatContext)
    const [message, setMessage] = useState('')
    const {MyToken} = useContext(MyTokenContext)
    const messagesEndRef = useRef(null);
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ChatToRender]);
    
    const handleSend = (message) => {
        setMessage('')
        setCurrentChat((prevCurrentChat) => [...prevCurrentChat, {token: MyToken, text: message}])
        let prev = JSON.parse(sessionStorage.getItem(CurrentContact.ChatId)) || []
        prev.push({token: MyToken, text: message})
        sessionStorage.setItem(CurrentContact.ChatId, JSON.stringify(prev))
        let msg = {
            type: 'message',
            ChatId: CurrentContact.ChatId,
            from: MyToken,
            to: CurrentContact.FriendshipToken,
            message
        }
        Socket.send(JSON.stringify(msg))
    }
    return (
        <div className="chat-container dark-theme">
            
            <div className="chat-messages-wrapper">
                <div class = "chat-messages-list">
                    {ChatToRender.map((message) => (
                        <div key={Math.random(50)}>
                            {(message.token===MyToken) ? <MyMessage>{message.text}</MyMessage> : <ContactMessage>{message.text}</ContactMessage>}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            
            <div className="chat-footer-bar">
                <div className="chat-input-row">
                    <Input 
                        type="text" 
                        placeholder="write a message" 
                        value={message} onChange={(e) => setMessage(e.target.value)} 
                        className="chat-custom-input"
                        suffix = {
                            <Button 
                                type="primary" 
                                shape="circle"
                                icon={<SendOutlined />}
                                disabled = {!message.trim() || CurrentContact.name===''} 
                                className="chat-round-btn" 
                                onClick = {() => handleSend(message)}>
                            </Button>
                        }
                    />
                    
                </div>
            </div>  
        </div>
    )
}