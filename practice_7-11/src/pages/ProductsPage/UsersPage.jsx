import React, { useState, useEffect } from "react";
import "./ProductsPage.scss";


import { api } from "../../api";
import UsersList from "../../components/UsersList";
import RegisterModal from "../../components/RegisterModal";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [modalMode, setModalMode] = useState("create");
    const [editingUser, setEditingUser] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
            alert("Ошибка загрузки профилей");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Удалить пользователя?");
        if (!ok) return;

        try {
            await api.deleteUser(id);
            setUsers((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error(err);
            alert("Ошибка удаления пользователя");
        }
    };

    const openEdit = (user) => {
        setModalMode("edit");
        setEditingUser(user);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingUser(null);
    };


    const handleSubmitModal = async (payload) => {
        try {
            if (modalMode === "create") {
                const newUser = await api.register(payload);
                setUsers((prev) => [...prev, newUser]);
            } else {
                const updatedUser = await api.updateUser(payload.id, payload);
                setUsers((prev) =>
                    prev.map((u) => (u.id === payload.id ? updatedUser : u))
                );
            }
            closeModal();
        } catch (err) {
            console.error(err);
            alert("Ошибка сохранения пользователя");
        }
    };


    return (
        <div className="page">
            <main className="main">
                <div className="container">
                    <div className="toolbar">
                        <h1 className="title">Пользователи</h1>
                    </div>

                    {loading ? (
                        <div className="empty">Загрузка...</div>
                    ) : (
                        <UsersList
                            users={users}
                            onDelete={handleDelete}
                            onEdit={openEdit}
                        />
                    )}
                </div>
            </main>

            <footer className="footer">
                <div className="footer__inner">
                    {new Date().getFullYear()} Интернет-магазин
                </div>
            </footer>

            <RegisterModal
                open={modalOpen}
                mode={modalMode}
                initialProduct={editingUser}
                onClose={closeModal}
                onSubmit={handleSubmitModal}
            />

        </div>
    )
}