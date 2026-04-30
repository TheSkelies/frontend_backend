import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage/ProductsPage";
import UsersPage from "./pages/ProductsPage/UsersPage";

import "./pages/ProductsPage/ProductsPage.scss"

function App() {
    return (
    <BrowserRouter>
        <div className="App">
            <nav className="navbar">
                <Link className="nav-link" to="/">Товары</Link>
                <p></p>
                <Link className="nav-link" to="/profile">Профиль</Link>
            </nav>

            <Routes>
                <Route path="/" element={<ProductsPage />} />
                <Route path="/profile" element={<UsersPage />} />
            </Routes>
        </div>
    </BrowserRouter>
    );
}

export default App;

