import React, { useState, useEffect } from "react";
import { api } from "../api";

export default function MeModal({ open, onClose }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (!open) {
            setUser(null);
            return;
        }

        const fetchUser = async () => {
            try {
                const data = await api.me();
                setUser(data);
            } catch (err) {
                console.error(err);
                alert("Ошибка загрузки профиля")
            }
        };

        fetchUser();
    }, [open]);

    if (!open) return null;

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">Ваш профиль</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <div className="form">
                    {user && (
                        <>
                            <label className="label">
                                {`Ваш id: ${user.id}`}
                            </label>

                            <label className="label">
                                {`Ваш email: ${user.email}`}
                            </label>

                            <label className="label">
                                {`Ваше имя: ${user.first_name}`}
                            </label>

                            <label className="label">
                                {`Ваша фамилия: ${user.last_name}`}
                            </label>

                            <label className="label">
                                {`Ваш возраст: ${user.age}`}
                            </label>

                            <label className="label">
                                {`Ваша роль: ${user.role}`}
                            </label>
                        </>
                        )}
                </div>

                <div className="modal__footer">
                    <button type="button" className="btn" onClick={onClose}>
                        Закрыть
                    </button>
                </div>

            </div>
        </div>
    );
}