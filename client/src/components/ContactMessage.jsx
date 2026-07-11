import React from "react"
import { Divider, Flex, Tag } from 'antd';
import '../styles/ContactMessage.css'
export default function ContactMessage({children}) {
    return (
        <div className="Contact-Message">
            {children}
        </div>
    )
}