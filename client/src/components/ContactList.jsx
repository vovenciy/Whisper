import React from "react";
import { useState } from "react";
import Contact from "./Contact";
import { Input } from 'antd';
import { Button, ConfigProvider, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import RequestSection from "./RequestSection";
import '../styles/SiderButtonsAndFilter.css'
import { useContext } from "react";
import { ContactsContext } from "../context/contacts";
import { CurrentContactContext } from "../context/CurrentContact";
const buttonsStyle = {
    display: 'flex',            
    flexDirection: 'row',      
    marginTop: 0,            
    marginBottom: 0,         
    paddingTop: 0,          
    paddingBottom: 0,  
}
const ContactList = () => {
    const {CurrentContact, setCurrentContact} = useContext(CurrentContactContext)
    const {Contacts, setContacts} = useContext(ContactsContext)
    const navigate = useNavigate()
    const [pageContacts, setPageContacts] = useState(true)
    const [value, setValue] = useState('')
    return (
        <div class = "widget-container">
            <div class = "button-row">
                <button class = "btn btn-exit" onClick = {(event) => {
                    sessionStorage.setItem('CurrentContact', JSON.stringify({name: '???', FriendshipToken: '0', ChatId: '0'}))
                    setCurrentContact({name: '???', FriendshipToken: '0', ChatId: '0'})
                    navigate('/login')
                }
                } color="danger" variant="solid">
                    exit
                </button>
                <button class= "btn btn-requests" onClick = {(event) => setPageContacts(false)} color="purple" variant="solid">
                    requests
                </button>
                <button class = "btn btn-contacts" onClick = {(event) => setPageContacts(true)} color="pink" variant="solid">
                    contacts
                </button>
            </div>   
            
            {pageContacts && <>
                <div class = "filter-container">
                    <input class = "filter-input" placeholder='search...' value={value} onChange={(event) => setValue(event.target.value)}></input>
                </div>
                <div class  ="contacts-list">
                    {Contacts.filter(user => user.name.toLowerCase().includes(value.toLowerCase())).map((user) => 
                        (<Contact 
                            key={user.FriendshipToken} 
                            current={user} 
                        />))}  
                </div>
            </>}
            {!pageContacts && <RequestSection/>}
        </div>
    )   
}
    
export default ContactList