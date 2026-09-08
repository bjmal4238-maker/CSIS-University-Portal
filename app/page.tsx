'use client';

import { useState } from 'react';
import LoginPage from './pages/register';
import Dashboard from './pages/dashboard';

export default function Home() {
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	return isLoggedIn ? <Dashboard /> : <LoginPage onLogin={() => setIsLoggedIn(true)} />;
}
