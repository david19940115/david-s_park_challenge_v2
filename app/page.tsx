export default function Home() {
  return (
    <main className="game-shell">
      <iframe
        className="game-frame"
        src="/game/index.html"
        title="David的公園挑戰"
        allow="autoplay; fullscreen"
      />
    </main>
  );
}
