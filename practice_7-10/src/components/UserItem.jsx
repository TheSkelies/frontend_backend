import React from "react";

export default function userItem({ user, onEdit, onDelete }) {
    return (
        <div className="productRow">
            <div className="productMain">
                <div className="productId">#{user.id}</div>
                <div className="productName">`{user.first_name} {user.last_name}`</div>
                <div className="productCategory">{user.email}</div>
                <div className="productPrice">{user.age.toLocaleString()} лет</div>
            </div>
            <div className="productDescription">{user.role}</div>
            <div className="productActions">
                <button className="btn" onClick={() => onEdit(user)}>
                    Редактировать
                </button>
                <button className="btn btn--danger" onClick={() => onDelete(user.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}