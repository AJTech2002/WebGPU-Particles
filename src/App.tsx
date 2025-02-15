import { createContext,  useState } from "react";
import "./App.css";
import GameScreen from "@game/ui/GameScreen";
import { SquadDef } from "@game/squad/squad";

interface ICardContextProps {
  selectedCodeEditCard: SquadDef | undefined; 
  setSelectedCodeEditCard: (card: SquadDef | undefined) => void;
}

export const CardCodingContext = createContext({} as ICardContextProps);

function App() {

  const [selectedCard, setSelectedCard] = useState<SquadDef | undefined>(undefined);

  return (
    <CardCodingContext.Provider value={{ 
      // With the state updater 
      selectedCodeEditCard: selectedCard,
      setSelectedCodeEditCard: setSelectedCard 
    }}>
    <GameScreen />
    </CardCodingContext.Provider>
  );
}


export default App;
