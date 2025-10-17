// RootLayout.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainChatDrawer from '../chatAi-v2/MainChatDrawers';

interface RootLayoutProps {
    children: React.ReactNode;
}

function RootLayout({ children }: RootLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

    return (
        <div className="w-full flex flex-col min-h-screen max-h-screen overflow-x-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Main content area with navbar and children */}
            <div
                className="flex flex-col transition-all duration-300 "
                style={{
                    marginLeft: sidebarOpen ? '16rem' : '5rem',
                    background: "white"
                }}
            >
                {/* Navbar */}
                {/* <NavBar 
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
                    isDarkMode={false} 
                    currentTheme={{
                        color: '',
                        ring: '',
                        name: '',
                        gradient: ''
                    }}
                /> */}

                {/* Page content */}
                <main className="flex-grow">
                    {children}
                </main>
            </div>

            {/* AI Chat Button - Floating */}
            <div className="ai-button-container">
                <div className="glow"></div>
                <div className="ai-container">
                    <div className="particles">
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                        <div className="particle"></div>
                    </div>
                    <button
                        className="ai-button"
                        onClick={() => setAiDrawerOpen(true)}
                        title="Open AI Assistant"
                    >
                        <span className="button-text">
                            AI
                        </span>
                    </button>
                </div>
            </div>

            {/* AI Chat Drawer */}
            <MainChatDrawer open={aiDrawerOpen} setOpen={setAiDrawerOpen} />
        </div>
    );
}

export default RootLayout;