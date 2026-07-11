import { Layout } from 'antd';
import MyMessage from '../MyMessage';
import ContactMessage from '../ContactMessage';
import ChatRenderer from '../ChatRenderer';
import { useContext } from 'react';
import { CurrentChatContext } from '../../context/CurrentChat';
const contentStyle = {
  textAlign: 'center',
  minHeight: 'calc(100vh - 60px)',
  color: '#fff',
  backgroundColor: '#001529'
};

export default function ChatContent () {
    const {CurrentChat, setCurrentChat} = useContext(CurrentChatContext)
    
    return <Layout.Content style={contentStyle}>
        <ChatRenderer ChatToRender={CurrentChat} ></ChatRenderer>
    </Layout.Content>
}