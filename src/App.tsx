import { useEffect, useMemo, useState } from "react";

type Screen = "splash" | "reward" | "collection" | "battle" | "wheel";

const heroes = [
  { id: 0, name: "Морвен", role: "Рыцарь Пепла", rarity: "РЕДКИЙ", status: "СОБРАН", hp: 72 },
  { id: 1, name: "Ардан", role: "Король Осколков", rarity: "ЛЕГЕНДАРНЫЙ", status: "4 / 6", hp: 84 },
  { id: 2, name: "Нера", role: "Хранительница Теней", rarity: "ЛЕГЕНДАРНЫЙ", status: "1 / 8", hp: 66 },
  { id: 3, name: "Рун", role: "Охотник Бездны", rarity: "ОБЫЧНЫЙ", status: "СОБРАН", hp: 64 },
];

const cards = [
  { name: "Удар", icon: "⚔", damage: 22, cost: 1 },
  { name: "Пламя", icon: "✦", damage: 28, cost: 2 },
  { name: "Щит", icon: "◆", damage: 16, cost: 1 },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [loading, setLoading] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [selected, setSelected] = useState(0);
  const [enemyHp, setEnemyHp] = useState(62);
  const [playerHp, setPlayerHp] = useState(72);
  const [turn, setTurn] = useState(0);
  const [battleText, setBattleText] = useState("ВАШ ХОД");
  const [busy, setBusy] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wheelDone, setWheelDone] = useState(false);

  useEffect(() => {
    if (screen !== "splash") return;
    const timer = window.setInterval(() => {
      setLoading((value) => {
        const next = Math.min(100, value + 4);
        if (next === 100) {
          window.clearInterval(timer);
          window.setTimeout(() => setScreen("reward"), 350);
        }
        return next;
      });
    }, 70);
    return () => window.clearInterval(timer);
  }, [screen]);

  const background = useMemo(() => {
    if (screen === "reward") return "reward-bg";
    if (screen === "wheel") return "wheel-bg";
    if (screen === "battle") return "battle-bg";
    return "dungeon-bg";
  }, [screen]);

  function startBattle() {
    setEnemyHp(62);
    setPlayerHp(heroes[selected].hp);
    setTurn(0);
    setBattleText("ВАШ ХОД");
    setBusy(false);
    setScreen("battle");
  }

  function playCard(damage: number, name: string) {
    if (busy || enemyHp <= 0) return;
    setBusy(true);
    setBattleText(`${name.toUpperCase()} — ${damage}`);
    const nextEnemy = Math.max(0, enemyHp - damage);
    setEnemyHp(nextEnemy);
    setTurn((value) => value + 1);
    if (nextEnemy === 0 || turn >= 2) {
      window.setTimeout(() => {
        setEnemyHp(0);
        setBattleText("ПОБЕДА");
        setBusy(false);
      }, 650);
      return;
    }
    window.setTimeout(() => {
      setBattleText("ТЕНЕВОЙ УДАР — 12");
      setPlayerHp((value) => Math.max(1, value - 12));
      window.setTimeout(() => {
        setBattleText("ВАШ ХОД");
        setBusy(false);
      }, 650);
    }, 650);
  }

  function spinWheel() {
    if (spinning || wheelDone) return;
    setSpinning(true);
    window.setTimeout(() => {
      setSpinning(false);
      setWheelDone(true);
    }, 2800);
  }

  function resetRun() {
    setWheelDone(false);
    setSpinning(false);
    setScreen("collection");
  }

  return (
    <main className="game-stage">
      <section className={`phone ${background}`} aria-live="polite">
        <div className="scanlines" />
        {screen !== "splash" && <RunesNav screen={screen} />}

        {screen === "splash" && (
          <div className="screen splash-screen">
            <div className="brand-mark">✦</div>
            <p className="eyebrow">ХРОНИКИ ПОДЗЕМЕЛЬЯ</p>
            <h1>ОСКОЛКИ<br />ГЕРОЯ</h1>
            <p className="tagline">Собери тех, кого поглотила тьма</p>
            <div className="loading-track"><span style={{ width: `${loading}%` }} /></div>
            <p className="loading-copy">ПРОБУЖДЕНИЕ... {loading}%</p>
          </div>
        )}

        {screen === "reward" && (
          <div className="screen reward-screen">
            <header className="screen-header">
              <p className="eyebrow">ДЕНЬ 4 ИЗ 7</p>
              <h2>ДАР ПОДЗЕМЕЛЬЯ</h2>
              <p>Возвращайся каждый день, чтобы собрать легендарного героя.</p>
            </header>
            <div className="calendar" aria-label="Календарь наград">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div className={`day ${day < 4 ? "past" : ""} ${day === 4 ? "today" : ""}`} key={day}>
                  <span>Д{day}</span>
                  <b>{day === 4 ? "✦" : day === 7 ? "♜" : day % 2 ? "◆" : "●"}</b>
                  <small>{day < 4 ? "✓" : day === 4 ? "СЕГОДНЯ" : "?"}</small>
                </div>
              ))}
            </div>
            <div className={`reward-box ${claimed ? "claimed" : ""}`}>
              <div className={`item-sprite ${claimed ? "shard" : "chest"}`} />
              <p>{claimed ? "ОСКОЛОК АРДАНА" : "НАГРАДА ЖДЁТ"}</p>
              <strong>{claimed ? "4 ИЗ 6 ОСКОЛКОВ" : "ОТКРОЙ СУНДУК"}</strong>
              <div className="shard-progress"><span style={{ width: claimed ? "66%" : "50%" }} /></div>
            </div>
            <button className="primary-button" onClick={() => claimed ? setScreen("collection") : setClaimed(true)}>
              {claimed ? "ПРОДОЛЖИТЬ" : "ЗАБРАТЬ"}
            </button>
          </div>
        )}

        {screen === "collection" && (
          <div className="screen collection-screen">
            <header className="screen-header compact">
              <p className="eyebrow">КОЛЛЕКЦИЯ · 2 / 4</p>
              <h2>ВЫБЕРИ ГЕРОЯ</h2>
            </header>
            <div className="hero-grid">
              {heroes.map((hero) => {
                const unlocked = hero.status === "СОБРАН";
                return (
                  <button key={hero.id} className={`hero-card hero-${hero.id} ${selected === hero.id ? "selected" : ""} ${unlocked ? "" : "locked"}`} onClick={() => unlocked && setSelected(hero.id)} aria-label={`${hero.name}: ${hero.status}`}>
                    <div className="hero-portrait" />
                    <div className="hero-info">
                      <span>{hero.rarity}</span><h3>{hero.name}</h3><p>{hero.role}</p><b>{hero.status}</b>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="selected-hero"><span>В БОЙ ИДЁТ</span><strong>{heroes[selected].name}</strong><small>HP {heroes[selected].hp} · СИЛА 18</small></div>
            <button className="primary-button" onClick={startBattle}>НАЧАТЬ БИТВУ</button>
          </div>
        )}

        {screen === "battle" && (
          <div className="screen battle-screen">
            <header className="battle-top">
              <div><span>{heroes[selected].name}</span><b>{playerHp} HP</b></div>
              <p>ХОД {Math.min(turn + 1, 3)} / 3</p>
              <div className="enemy-meta"><span>ПОЖИРАТЕЛЬ</span><b>{enemyHp} HP</b></div>
            </header>
            <div className="battlefield">
              <div className={`fighter player hero-${selected}`}><div className="hero-portrait" /></div>
              <div className="versus">VS</div>
              <div className="fighter enemy"><div className="enemy-shape">♜</div></div>
            </div>
            <div className={`battle-message ${battleText === "ПОБЕДА" ? "victory" : ""}`}>{battleText}</div>
            {battleText === "ПОБЕДА" ? (
              <div className="victory-panel"><p>ПОЖИРАТЕЛЬ ПОВЕРЖЕН</p><strong>НАГРАДА ОТКРЫТА</strong><button className="primary-button" onClick={() => setScreen("wheel")}>К КОЛЕСУ</button></div>
            ) : (
              <div className="card-hand">
                {cards.map((card) => <button key={card.name} onClick={() => playCard(card.damage, card.name)} disabled={busy}><span>{card.cost}</span><b>{card.icon}</b><strong>{card.name}</strong><small>{card.damage} УР.</small></button>)}
              </div>
            )}
          </div>
        )}

        {screen === "wheel" && (
          <div className="screen wheel-screen">
            <header className="screen-header compact"><p className="eyebrow">НАГРАДА ЗА ПОБЕДУ</p><h2>КОЛЕСО СУДЬБЫ</h2><p>Одна попытка. Судьба выберет награду.</p></header>
            <div className="wheel-wrap">
              <div className="wheel-pointer">▼</div>
              <div className={`wheel ${spinning ? "spinning" : ""}`}><span className="w1">✦</span><span className="w2">●</span><span className="w3">▣</span><span className="w4">◆</span><div className="wheel-core">☼</div></div>
            </div>
            <button className="primary-button" onClick={spinWheel} disabled={spinning || wheelDone}>{spinning ? "КОЛЕСО ВРАЩАЕТСЯ" : wheelDone ? "СУДЬБА РЕШИЛА" : "КРУТИТЬ"}</button>
            {wheelDone && <div className="loot-modal"><p>ТВОЯ НАГРАДА</p><div className="item-sprite shard small" /><h3>ОСКОЛОК АРДАНА</h3><span>5 ИЗ 6 СОБРАНО</span><button className="secondary-button" onClick={resetRun}>ЗАБРАТЬ</button></div>}
          </div>
        )}
      </section>
    </main>
  );
}

function RunesNav({ screen }: { screen: Screen }) {
  const items: Screen[] = ["reward", "collection", "battle", "wheel"];
  const active = items.indexOf(screen);
  return <div className="runes-nav" aria-label="Прогресс прохождения">{items.map((item, index) => <span key={item} className={index <= active ? "active" : ""}>{index + 1}</span>)}</div>;
}
