import {  Layout } from 'antd';
import { useContext } from 'react';
import { CurrentContactContext } from '../../context/CurrentContact';
const headerStyle = {
  textAlign: 'center',
  color: '#fff',
  height: 60,
  paddingInline: 48,
  lineHeight: '64px',
  backgroundColor: '#4096ff',
};

export default function ChatHeader () {
    const {CurrentContact, setCurrentContact} = useContext(CurrentContactContext)
    return ( 
        <Layout.Header style={headerStyle}>
          {CurrentContact ? CurrentContact.name : ''}
        </Layout.Header> 
    )
}