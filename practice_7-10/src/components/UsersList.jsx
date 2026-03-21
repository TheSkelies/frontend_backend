import React from "react";
import UserItem from "./UserItem";

export default function UsersList({ users, onEdit, onDelete }) {
    if (!users.length) {
        return <div className="empty">Пользователей нет</div>;
    }

    return (
        <div className="list">
            {users.map((user) => (
                <UserItem
                    key={user.id}
                    user={user}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}