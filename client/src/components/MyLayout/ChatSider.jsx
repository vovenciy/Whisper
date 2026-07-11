import { React, useContext } from 'react'
import { Layout } from 'antd';
import ContactList from '../ContactList';
import { ContactsContext } from '../../context/contacts';

const siderStyle = {
  textAlign: 'center',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#1677ff',
};

export default function ChatSider () {
    
    return <Layout.Sider width="25%" style={siderStyle}>
        {<ContactList/>}
      </Layout.Sider>
}