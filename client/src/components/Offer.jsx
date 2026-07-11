import React from 'react';
import { Card, Space } from 'antd';
import { Button, ConfigProvider, Flex } from 'antd';
import { useContext } from 'react';
import { RequestsContext } from '../context/Requests';
import { ContactsContext } from '../context/contacts';
import { SocketContext } from '../context/Socket';
import { MyNameContext } from '../context/MyName';
import { MyTokenContext } from '../context/MyToken';
import { useState } from 'react';
import {customAlphabet} from 'nanoid';
import '../styles/Offer.css'

export default function Offer({name, token}) {
    
    const {Requests, setRequests} = useContext(RequestsContext)
    const {Contacts, setContacts} = useContext(ContactsContext)
    const {Socket, setSocket} = useContext(SocketContext)
    const {MyName, setMyName} = useContext(MyNameContext)
    const {MyToken, setMyToken} = useContext(MyTokenContext)
    return (
        <Card size="small" title="request for friendship" style={{ width: '100%' }}>
            <p>from: {name}</p>
            <div class = "button-container">
                <Button onClick = {async () => {
                    let ChatId = customAlphabet('ABCDEFGHIGKLMNOPQRSTUVWXYZ!1234567890')()
                    const msg = {
                        type: 'request accepted',
                        FirstName: MyName,
                        FirstToken: MyToken,
                        SecondName: name,
                        SecondToken: token,
                        ChatId: ChatId
                    }
                    Socket.send(JSON.stringify(msg))
                    
                    let newContact = {
                        ChatId: ChatId,
                        name: name,
                        FriendshipToken: token
                    }
                    
                    setContacts((prevContacts) => prevContacts.map(contact => contact.FriendshipToken).includes(newContact.FriendshipToken) ? prevContacts : [...prevContacts, newContact])
                    
                    setRequests((prevRequests) => prevRequests.filter((request) => request.reqToken !== token))
    
                }} color="cyan" variant="solid">
                    accept
                </Button>
                
                <Button onClick = {() => {
    
                    setRequests((prevRequests) => prevRequests.filter((request) => request.reqToken !== token))
    
                }} color="danger" variant="solid">
                    reject
                </Button>
            </div>
        </Card>
    )
}