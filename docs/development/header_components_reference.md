# Header Components Reference Guide

## 📋 **Complete Header Component Breakdown**

### **1. Landing Page Header** (`client/src/pages/landing.tsx` - line ~110)
- **When**: Shows for **unauthenticated users** on landing page (`/` route)
- **Appearance**: White background, Heliotrope logo, Login button
- **Purpose**: Pre-authentication navigation
- **Users**: Visitors before login

### **2. NavBar.tsx** (`client/src/components/navigation/NavBar.tsx` - line ~224)
- **When**: **Main header for ALL authenticated users** across workshop application
- **Appearance**: **Yellow background** (`bg-yellow-500`), Heliotrope logo, user controls
- **Purpose**: Primary navigation for logged-in users
- **Users**: Every authenticated user sees this
- **Contains**: Admin/Facilitator buttons, user profile, logout

### **3. TestUserBanner.tsx** (`client/src/components/test-users/TestUserBanner.tsx`)
- **When**: Only for users marked as `isTestUser: true`
- **Appearance**: **Yellow banner** above main header
- **Purpose**: Test user identification and controls
- **Users**: Test users only
- **Contains**: "TEST USER" badge, Reset Data, Switch App

### **4. Header.tsx** (`client/src/components/layout/Header.tsx`)
- **When**: Alternative white header (currently used minimally)
- **Appearance**: White background, Dashboard/Logout buttons
- **Purpose**: Generic header component
- **Status**: Available but not primary

### **5. AppHeader.tsx** (`client/src/components/layout/AppHeader.tsx`)
- **When**: AllStarTeams-specific branding header
- **Appearance**: White background with AllStarTeams logo
- **Purpose**: Workshop-specific branding
- **Status**: Available but currently commented out/unused

### **6. NavigationHeader.tsx** (`client/src/components/navigation/NavigationHeader.tsx`)
- **When**: Workshop progress tracking header
- **Appearance**: Progress bars, estimated time, current section
- **Purpose**: Workshop navigation and progress visualization
- **Status**: Built but not implemented in main workshop flow

## 🎯 **Current Active Headers**

### **Unauthenticated Users:**
- **Landing Page Header** (white, with login button)

### **Authenticated Users:**
- **NavBar.tsx** (yellow, main navigation) - **PRIMARY**
- **TestUserBanner.tsx** (yellow banner above NavBar) - **Test users only**

## 🛠️ **Development Environment Indicator Status**

✅ **NavBar.tsx** - DEV badge added (correct location for all authenticated users)
✅ **Header.tsx** - DEV badge added (backup/alternative header)
✅ **AppHeader.tsx** - DEV badge added (currently unused)

## 📝 **Key Insights**
- **Single header pattern** currently used for consistency
- **NavBar.tsx is the main header** everyone sees during workshop use
- **Multiple headers available** for different use cases but not all active
- **Test users get additional yellow banner** above main header