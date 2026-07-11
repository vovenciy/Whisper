import { lineHeight, width } from '@mui/system';
import { Button, ConfigProvider, Flex } from 'antd';
import { CurrentContactContext } from '../context/CurrentContact';
import { useContext, useState } from 'react';
import React from "react";
import { SocketContext } from '../context/Socket';
import { MyTokenContext } from '../context/MyToken';
import { CurrentChatContext } from '../context/CurrentChat';
import { useEffect } from 'react';
import '../styles/Contact.css'
import { PulsingListContext } from '../context/PulsingList';
const ContactStyle = {
    display: 'block',
    height: '5%',
    width: '100%'
}


const Contact = ({current}) => {
    const {CurrentChat, setCurrentChat} = useContext(CurrentChatContext)
    const {MyToken} = useContext(MyTokenContext)
    const {Socket} = useContext(SocketContext)
    const {CurrentContact, setCurrentContact} = useContext(CurrentContactContext)
    const {PulsingList, setPulsingList} = useContext(PulsingListContext)
    const [IsPulsing, setIsPulsing] = useState(false)
    
    useEffect(() => {
        if (PulsingList.includes(current.FriendshipToken)) {
            setIsPulsing(true)
        }
        if (PulsingList.length > 0) {
            document.title = 'new notification!'
        } else {
            document.title = 'Whisper'
        }
        return
    }, [PulsingList])
    return (
        <button disabled={CurrentContact.name===current.name} color="primary" variant="outlined" onClick={() => {
            setCurrentContact(current)
            setIsPulsing(false)
            
            setPulsingList((prev) => prev.filter(t => t!==current.FriendshipToken))

            sessionStorage.setItem('CurrentContact', JSON.stringify(current))
            let sessionChat = JSON.parse(sessionStorage.getItem(current.ChatId))
            if (sessionChat!==null) {
                setCurrentChat(sessionChat)
            } else {
                let targetID = current.ChatId
                let msg = {
                    type: 'give me chat',
                    ChatId: current.ChatId
                }
                Socket.send(JSON.stringify(msg))
            }
            
            
            
            }} className = {`contact-item ${IsPulsing ? 'is-pulsing' : ''}`}>
            {current.name}
          </button>
    )
}
export default Contact