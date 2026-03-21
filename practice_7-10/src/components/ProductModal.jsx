import React, { useEffect, useState } from "react";

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");

    useEffect(() => {
        if (!open) return;

        setTitle(initialProduct?.title ?? "");
        setCategory(initialProduct?.category ?? "");
        setDescription(initialProduct?.description ?? "");
        setPrice(initialProduct?.price != null ? String(initialProduct.price) : "");
    }, [open, initialProduct]);

    if (!open) return null;

    const tit = mode === "edit" ? "Редактирование товара" : "Создание товара";

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedTitle = title.trim();
        const trimmedCategory = category.trim();
        const trimmedDescription = description.trim();
        const parsedPrice = Number(price);

        if (!trimmedTitle) {
            alert("Введите название товара");
            return;
        }

        if (!trimmedCategory) {
            alert("Введите категорию");
            return;
        }

        if (!trimmedDescription) {
            alert("Введите описание");
            return;
        }

        if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
            alert("Введите корректную цену (больше 0)");
            return;
        }



        onSubmit({
            id: initialProduct?.id,
            title: trimmedTitle,
            category: trimmedCategory,
            description: trimmedDescription,
            price: parsedPrice,
        });
    };

    return (
        <div className="backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <div className="modal__header">
                    <div className="modal__title">{tit}</div>
                    <button className="iconBtn" onClick={onClose} aria-label="Закрыть">
                        ✕
                    </button>
                </div>

                <form className="form" onSubmit={handleSubmit}>
                    <label className="label">
                        Название товара
                        <input
                            className="input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Например, Ноутбук ASUS"
                            autoFocus
                        />
                    </label>

                    <label className="label">
                        Категория
                        <input
                            className="input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Например, Ноутбуки"
                        />
                    </label>

                    <label className="label">
                        Описание
                        <input
                            className="input"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Например, Ноутбук с 5090"
                        />
                    </label>

                    <label className="label">
                        Цена (₽)
                        <input
                            className="input"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="Например, 89990"
                            inputMode="numeric"
                        />
                    </label>



                    <div className="modal__footer">
                        <button type="button" className="btn" onClick={onClose}>
                            Отмена
                        </button>
                        <button type="submit" className="btn btn--primary">
                            {mode === "edit" ? "Сохранить" : "Создать"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}