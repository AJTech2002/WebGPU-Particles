import { createContext, useState } from "react";
import "./App.css";
import GameScreen from "@game/ui/GameScreen";
import { SquadDef } from "@game/squad/squad";


function App() {

  const [selectedCard, setSelectedCard] = useState<SquadDef | undefined>(undefined);

  return (
    <GameScreen />
  );
}


export default App;
