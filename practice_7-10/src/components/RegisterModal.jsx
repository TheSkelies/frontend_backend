import React, { useState, useEffect } from "react";

export default function RegisterModal({ open, initialUser, mode, onClose, onSubmit }) {
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [age, setAge] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");


    useEffect(() => {
        if (!open) return;

        setEmail(initialUser?.email ?? "");
        setFirstName(initialUser?.first_name ?? "");
        setLastName(initialUser?.last_name ?? "");
        setAge(initialUser?.age != null ? String(initialUser.age) : "");
        setRole(initialUser?.role ?? "");

    }, [open, initialUser]);


    if (!open) return null;

    const title = mode === "edit" ? "Редактирование профиля" : "Создание профиля";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        const trimmedFirstName = first_name.trim();
        const trimmedLastName = last_name.trim();
        const trimmedRole = role.trim();
        const parsedAge = Number(age);

        if (!trimmedEmail) {
            alert("Введите email");
            return;
        }

        if (!trimmedPassword) {
            alert("Введите пароль");
            return;
        }

        if (!trimmedFirstName) {
            alert("Введите имя");
            return;
        }

        if (!trimmedLastName) {
            alert("Введите фамилию");
            return;
        }

        if (!trimmedRole) {
            alert("Введите роль пользователя");
            return;
        }

        if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
            alert("Введите корректный возраст (больше 0)");
            return;
        }

        onSubmit({
            email: trimmedEmail,
            first_name: trimmedFirstName,
            last_name: trimmedLastName,
            age: parsedAge,
            role: trimmedRole,
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
                    <div className="modal__title">{title}</div>
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
                        Имя пользователя
                        <input
                            className="input"
                            value={first_name}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Например, Артём"
                            autoFocus
                        />
                    </label>


                    <label className="label">
                        Фамилия пользователя
                        <input
                            className="input"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Например, Илюхин"
                            autoFocus
                        />
                    </label>


                    <label className="label">
                        Возраст пользователя
                        <input
                            className="input"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="Например, 19"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Роль пользователя
                        <input
                            className="input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Например, admin"
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
                            {mode === "edit" ? "Сохранить" : "Зарегистрироваться"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}