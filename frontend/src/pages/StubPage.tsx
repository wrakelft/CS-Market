export default function StubPage({ title }: { title: string }) {
    return (
        <div>
            <h1 style={{ margin: 0 }}>{title}</h1>
            <p style={{ opacity: 0.8 }}>Страница в процессе. Скоро тут будет движ 😄</p>
        </div>
    );
}
