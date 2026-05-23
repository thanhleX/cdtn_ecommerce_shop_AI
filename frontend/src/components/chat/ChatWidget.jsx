import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, List, Avatar, Card, Space, Badge, Typography } from 'antd';
import { MessageOutlined, CloseOutlined, SendOutlined, RobotOutlined, UserOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Text } = Typography;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem('cdtn_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing chat history:", e);
      }
    }
    return [
      { id: 1, text: "Xin chào! Tôi có thể giúp gì cho bạn hôm nay?", sender: 'bot', products: [] }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const scrollRef = useRef(null);

  useEffect(() => {
    sessionStorage.setItem('cdtn_chat_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnreadCount(0);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    if (inputValue.length > 200) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Tin nhắn vượt quá giới hạn 200 ký tự.",
        sender: 'bot'
      }]);
      return;
    }

    const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8082/chat', {
        message: userMsg.text
      });

      const botMsg = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: 'bot',
        products: response.data.products || []
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      let errorText = "Xin lỗi, hiện tại dịch vụ tư vấn đang gặp sự cố. Bạn vui lòng thử lại sau nhé!";
      if (error.response && error.response.data && error.response.data.detail) {
        errorText = error.response.data.detail;
      }
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
        <Badge count={unreadCount}>
          <Button
            type="primary"
            shape="circle"
            size="large"
            icon={isOpen ? <CloseOutlined /> : <MessageOutlined />}
            onClick={toggleChat}
            style={{ width: 60, height: 60, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          />
        </Badge>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Card
          title={
            <Space>
              <RobotOutlined style={{ color: '#1890ff' }} />
              <span>AI Support Assistant</span>
            </Space>
          }
          style={{
            position: 'fixed',
            bottom: 100,
            right: 30,
            width: 350,
            height: 500,
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            border: '1px solid #f0f0f0',
            borderRadius: '12px'
          }}
          bodyStyle={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}
        >
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: 'auto', padding: '16px' }}
          >
            <List
              itemLayout="horizontal"
              dataSource={messages}
              renderItem={msg => (
                <div style={{
                  display: 'flex',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  marginBottom: 16,
                  alignItems: 'flex-start'
                }}>
                  <Avatar
                    icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                    style={{ backgroundColor: msg.sender === 'user' ? '#1890ff' : '#f5222d' }}
                  />
                  <div style={{
                    maxWidth: '80%',
                    margin: msg.sender === 'user' ? '0 12px 0 0' : '0 0 0 12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: msg.sender === 'user' ? '#e6f7ff' : '#f5f5f5',
                    textAlign: 'left'
                  }}>
                    <Text>{msg.text}</Text>

                    {msg.products && msg.products.length > 0 && (
                      <div style={{ marginTop: 12 }}>
                        {msg.products.map(p => (
                          <Link
                            key={p.id}
                            to={`/products/slug/${p.slug}`}
                            style={{ display: 'block', marginBottom: 8 }}
                            onClick={() => setIsOpen(false)}
                          >
                            <Card size="small" hoverable style={{ border: '1px solid #d9d9d9' }}>
                              <Space>
                                <ShoppingOutlined style={{ color: '#1890ff' }} />
                                <Text strong size="small">{p.name}</Text>
                              </Space>
                            </Card>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            />
            {loading && (
              <div style={{ display: 'flex', marginBottom: 16 }}>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#f5222d' }} />
                <div style={{
                  marginLeft: 12,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f5f5',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <Space size="small">
                    <Text italic type="secondary">AI đang phân tích yêu cầu</Text>
                    <span className="typing-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  </Space>
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0' }}>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="Nhập câu hỏi của bạn..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                disabled={loading}
                maxLength={200}
                showCount
              />
              <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
            </Space.Compact>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;
