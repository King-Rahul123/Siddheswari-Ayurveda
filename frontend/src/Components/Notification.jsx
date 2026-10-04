import { useEffect, useRef } from "react";
import "../CSS/Notification.css";

export default function Notification({ isOpen, onClose, notifications = [] }) {
    const notificationRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleEscape = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="notification-popover" ref={notificationRef} role="dialog" aria-label="Notifications">
            <div className="notification-popover-header">
                <div>
                    <h4>Notifications</h4>
                    <span>{notifications.length ? `${notifications.length} unread` : "You're all caught up"}</span>
                </div>
                <button type="button" className="notification-close" onClick={onClose} aria-label="Close notifications">
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>

            {notifications.length === 0 ? (
                <div className="notification-empty">
                    <div className="notification-empty-icon">
                        <i className="bi bi-bell-slash"></i>
                    </div>
                    <strong>No new notifications</strong>
                    <span>Important updates will appear here.</span>
                </div>
            ) : (
                <div className="notification-list">
                    {notifications.map((notification) => (
                        <div className="notification-item" key={notification.id}>
                            <div className="notification-item-icon">
                                <i className={`bi ${notification.icon || "bi-info-circle"}`}></i>
                            </div>
                            <div>
                                <strong>{notification.title}</strong>
                                <p>{notification.message}</p>
                                {notification.time && <small>{notification.time}</small>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}