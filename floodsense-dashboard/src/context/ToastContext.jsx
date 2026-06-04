// ─── src/context/ToastContext.jsx ─────────────────────────────────────────────
//  Modern toast notification system — minimalist design with micro-interactions
//  Glass morphism effects, smooth animations, and elegant typography
// ─────────────────────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const ToastContext = createContext(null);

// ─── Variant config ───────────────────────────────────────────────────────────
const VARIANTS = {
    success: {
        bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
    error: {
        bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
    },
    warning: {
        bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12M12 16H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
            </svg>
        ),
    },
    info: {
        bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 16V12M12 8H12.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2"/>
            </svg>
        ),
    },
};

const DEFAULT_DURATION = 4000;

// ─── ToastItem ────────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
    const v = VARIANTS[toast.type] || VARIANTS.info;
    const [exiting, setExiting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const dismiss = useCallback(() => {
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
    }, [toast.id, onRemove]);

    React.useEffect(() => {
        if (!isHovered) {
            const t = setTimeout(dismiss, toast.duration || DEFAULT_DURATION);
            return () => clearTimeout(t);
        }
    }, [dismiss, toast.duration, isHovered]);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: "relative",
                marginBottom: 12,
                opacity: exiting ? 0 : 1,
                transform: exiting ? "translateX(120%) scale(0.95)" : "translateX(0) scale(1)",
                transition: "all 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)",
            }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                borderRadius: 16,
                padding: "12px 16px 12px 20px",
                minWidth: 320,
                maxWidth: 420,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                transition: "all 0.2s ease",
            }}>
                {/* Icon with gradient background */}
                <div style={{
                    background: v.bg,
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                }}>
                    {v.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 4,
                    }}>
                        <span style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#1f2937",
                            letterSpacing: "-0.3px",
                        }}>
                            {toast.label || toast.type?.charAt(0).toUpperCase() + toast.type?.slice(1)}
                        </span>
                    </div>

                    {toast.title && (
                        <div style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#374151",
                            marginBottom: 2,
                        }}>{toast.title}</div>
                    )}

                    <div style={{
                        fontSize: 13,
                        color: "#6b7280",
                        lineHeight: 1.4,
                        wordBreak: "break-word",
                    }}>
                        {toast.message || toast.text}
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={dismiss}
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 10,
                        border: "none",
                        background: "transparent",
                        color: "#9ca3af",
                        cursor: "pointer",
                        fontSize: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.color = "#ef4444";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#9ca3af";
                    }}
                >×</button>
            </div>

            {/* Progress bar */}
            {!isHovered && (
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 20,
                    right: 20,
                    height: 2,
                    background: "rgba(0, 0, 0, 0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                }}>
                    <div style={{
                        height: "100%",
                        background: v.bg,
                        width: "100%",
                        animation: `progress ${toast.duration || DEFAULT_DURATION}ms linear forwards`,
                        borderRadius: 2,
                    }} />
                </div>
            )}
        </div>
    );
}

// ─── ToastContainer ───────────────────────────────────────────────────────────
function ToastContainer({ toasts, onRemove }) {
    if (toasts.length === 0) return null;

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(120%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                    }
                }
                
                @keyframes progress {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(100%);
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
            `}</style>

            <div style={{
                position: "fixed",
                top: 24,
                right: 24,
                zIndex: 99999,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                pointerEvents: "none",
            }}>
                {toasts.map((toast, index) => (
                    <div
                        key={toast.id}
                        style={{
                            pointerEvents: "all",
                            animation: `slideIn 0.3s cubic-bezier(0.34, 1.2, 0.64, 1) forwards`,
                            marginTop: index === 0 ? 0 : 12,
                        }}
                    >
                        <ToastItem toast={toast} onRemove={onRemove} />
                    </div>
                ))}
            </div>
        </>
    );
}

// ─── ToastProvider ────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const counter = useRef(0);

    const addToast = useCallback((type, textOrOptions, message, duration) => {
        const id = ++counter.current;
        let toastData;

        if (typeof textOrOptions === "string") {
            toastData = message
                ? { id, type, title: textOrOptions, message, duration }
                : { id, type, text: textOrOptions, duration };
        } else {
            toastData = { id, type, ...textOrOptions };
        }

        setToasts(prev => [...prev, toastData]);

        // Auto-remove without animation
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, (duration || DEFAULT_DURATION) + 300);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const api = {
        success: (text, message, duration) => addToast("success", text, message, duration),
        error: (text, message, duration) => addToast("error", text, message, duration),
        warning: (text, message, duration) => addToast("warning", text, message, duration),
        info: (text, message, duration) => addToast("info", text, message, duration),
    };

    return (
        <ToastContext.Provider value={api}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

// ─── useToast hook ────────────────────────────────────────────────────────────
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
    return ctx;
}