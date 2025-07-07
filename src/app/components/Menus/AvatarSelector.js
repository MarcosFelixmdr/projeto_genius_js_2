import { useState } from "react";
    // MODELO: coloque seus arquivos de avatar aqui
    export const avatarList = [
    { id: "1", src: "/avatars/1.png", alt: "Avatar 1" },
    { id: "2", src: "/avatars/2.png", alt: "Avatar 2" },
    { id: "3", src: "/avatars/3.png", alt: "Avatar 3" },
    { id: "4", src: "/avatars/4.png", alt: "Avatar 4" },
    { id: "5", src: "/avatars/5.png", alt: "Avatar 5" },
    { id: "6", src: "/avatars/6.png", alt: "Avatar 6" },
    { id: "7", src: "/avatars/7.png", alt: "Avatar 7" },
    { id: "8", src: "/avatars/8.png", alt: "Avatar 8" },
    { id: "9", src: "/avatars/9.png", alt: "Avatar 9" },
    { id: "10", src: "/avatars/10.png", alt: "Avatar 10" },
    { id: "11", src: "/avatars/11.png", alt: "Avatar 11" },
    { id: "12", src: "/avatars/12.png", alt: "Avatar 12" },
    { id: "13", src: "/avatars/13.png", alt: "Avatar 13" },
    { id: "14", src: "/avatars/14.png", alt: "Avatar 14" },
    { id: "15", src: "/avatars/15.png", alt: "Avatar 15" },
    { id: "16", src: "/avatars/16.png", alt: "Avatar 16" },
    { id: "17", src: "/avatars/17.png", alt: "Avatar 17" },
    { id: "18", src: "/avatars/18.png", alt: "Avatar 18" },
    { id: "19", src: "/avatars/19.png", alt: "Avatar 19" },
    { id: "20", src: "/avatars/20.png", alt: "Avatar 20" },
    { id: "21", src: "/avatars/21.png", alt: "Avatar 21" },
    { id: "22", src: "/avatars/22.png", alt: "Avatar 22" },
    // ...adicione mais conforme necessário
    ];

    export default function AvatarSelector({ selected, onSelect }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="avatar-selector">
        <img
            src={selected?.src || "/avatars/1.png"}
            alt={selected?.alt || "Avatar"}
            className="avatar-thumb"
            onClick={() => setOpen(true)}
            style={{ cursor: "pointer" }}
        />
        {open && (
            <div className="avatar-modal" onClick={() => setOpen(false)}>
            <div className="avatar-modal-content" onClick={e => e.stopPropagation()}>
                <h4>Escolha um avatar</h4>
                <div className="avatar-list">
                {avatarList.map(avatar => (
                    <img
                    key={avatar.id}
                    src={avatar.src}
                    alt={avatar.alt}
                    className={`avatar-option${selected?.id === avatar.id ? "selected" : ""}`}
                    onClick={() => {
                        onSelect(avatar);
                        setOpen(false);
                    }}
                    style={{ cursor: "pointer", width: 48, height: 48, margin: 4 }}
                    />
                ))}
                </div>
            </div>
            </div>
        )}
        <style jsx>{`
            .avatar-modal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.4);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
            }
            .avatar-modal-content {
            background: #fff;
            padding: 24px;
            border-radius: 8px;
            min-width: 300px;
            }
            .avatar-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
            }
            .avatar-option.selected {
            border: 2px solid #0070f3;
            border-radius: 50%;
            }
            .avatar-thumb {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid #ccc;
            margin-right: 8px;
            }
        `}</style>
        </div>
    );
    }