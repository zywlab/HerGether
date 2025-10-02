import Layout from "./Layout.jsx";

import Profile from "./Profile";

import MyActivities from "./MyActivities";

import Settings from "./Settings";

import Notifications from "./Notifications";

import ActivityPlaza from "./ActivityPlaza";

import ActivityDetail from "./ActivityDetail";

import ActivityEditor from "./ActivityEditor";

import Verification from "./Verification";

import Welcome from "./Welcome";

import Onboarding from "./Onboarding";

import ProfileView from "./ProfileView";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Profile: Profile,
    
    MyActivities: MyActivities,
    
    Settings: Settings,
    
    Notifications: Notifications,
    
    ActivityPlaza: ActivityPlaza,
    
    ActivityDetail: ActivityDetail,
    
    ActivityEditor: ActivityEditor,
    
    Verification: Verification,
    
    Welcome: Welcome,
    
    Onboarding: Onboarding,
    
    ProfileView: ProfileView,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Profile />} />
                
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/MyActivities" element={<MyActivities />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Notifications" element={<Notifications />} />
                
                <Route path="/ActivityPlaza" element={<ActivityPlaza />} />
                
                <Route path="/ActivityDetail" element={<ActivityDetail />} />
                
                <Route path="/ActivityEditor" element={<ActivityEditor />} />
                
                <Route path="/Verification" element={<Verification />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Onboarding" element={<Onboarding />} />
                
                <Route path="/ProfileView" element={<ProfileView />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}