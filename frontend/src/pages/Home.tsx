import { useEffect, useState } from "react";
import { api } from "../api/http";

type SkinLite = { id: number; name: string };

export default function Home() {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        api<SkinLite[]>("/market/skins")
            .then((data) => setCount(data.length))
            .catch(() => setCount(-1));
    }, []);

    return (
        <div>
            <h1 style={{ margin: 0 }}>CS Market Front</h1>
    <p style={{ opacity: 0.8 }}>Backend ping: skins = {count === null ? "loading..." : count}</p>
    </div>
);
}
