import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div>
            <h1 style={{ margin: 0 }}>404</h1>
            <p style={{ opacity: 0.8 }}>Ты ушёл не туда. Бывает.</p>
            <Link to="/">← На главную</Link>
        </div>
    );
}
