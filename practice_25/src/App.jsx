import React, { Suspense, lazy } from 'react';
import { Routes, Route, Link } from 'react-router-dom';

const About = lazy(() => import('./pages/About'));

import Home from './pages/Home';

function App() {
    return (
        <div>
            <nav>
                <Link to="/">Главная</Link> | <Link to="/about">О нас</Link>
            </nav>
            <hr />
            <Suspense fallback={<div className="loading">Загрузка страницы</div>}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Suspense>
        </div>
    );
}

export default App;