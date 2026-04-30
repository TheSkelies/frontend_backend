import React, { useState } from "react";

export default function AuthModal({ open, onClose, onSubmit }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");


    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedEmail) {
            alert("Введите email");
            return;
        }

        if (!trimmedPassword) {
            alert("Введите пароль");
            return;
        }

        onSubmit({
            email: trimmedEmail,
            password: trimmedPassword,
        })
    }

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">Авторизация</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Email пользователя
                        <input
                            className="input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Например, abv@mail.ru"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Пароль
                        <input
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Например, 12345"
                        />
                    </label>

                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            Авторизоваться
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}