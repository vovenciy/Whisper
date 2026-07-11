import React from "react"
import { Divider, Flex, Tag } from 'antd';
import '../styles/MyMessage.css'
export default function MyMessage({children}) {
    return (
        <div className="My-Message">
            {children}
        </div>
    )
}