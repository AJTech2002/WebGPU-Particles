import { SquadDef, UnitType } from "../../squad/squad";
export declare const useSquads: () => {
    squadState: Map<number, SquadDef>;
    addSquad: (squad: SquadDef) => void;
    updateSquad: (id: number, squad: Partial<SquadDef>) => void;
    clearSquads: () => void;
    removeSquad: (id: number) => void;
    updateSquadUnitType: (id: number, unitType: UnitType, count: number) => void;
};
export declare function SquadProvider(props: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
