import "./App.css";
import { SquadDef } from "./game/squad/squad";
interface ICardContextProps {
    selectedCodeEditCard: SquadDef | undefined;
    setSelectedCodeEditCard: (card: SquadDef | undefined) => void;
}
export declare const CardCodingContext: import("react").Context<ICardContextProps>;
declare function App(): import("react/jsx-runtime").JSX.Element;
export default App;
