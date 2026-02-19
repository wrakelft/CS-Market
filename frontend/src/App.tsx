import { useEffect, useState } from "react";
import { api } from "./api/http";

export default function App() {
    const [count, setCount] = useState<number | null>(null);

    type SkinLite = {
        id: number;
        name: string;
    };

    useEffect(() => {
        api<SkinLite[]>("/market/skins")
            .then((data) => setCount(data.length))
            .catch((e) => {
                console.error(e);
                setCount(-1);
            });
    }, []);

    return (
        <div style={{ padding: 24 }}>
            <h1>CS Market Front</h1>
            <p>skins: {count === null ? "loading..." : count}</p>
        </div>
    );
}
