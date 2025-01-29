import { SquadDef, UnitType } from "@game/squad/squad";
import { createContext, useContext, useEffect, useState } from "react";

// Create the context
const SquadContext = createContext<{
  squadState: Map<number, SquadDef>;
  addSquad: (squad: SquadDef) => void;
  updateSquad: (id: number, squad: Partial<SquadDef>) => void;
  clearSquads: () => void;
  removeSquad: (id: number) => void;
  updateSquadUnitType: (id: number, unitType: UnitType, count: number) => void;
} | null>(null);


// Custom hook to use squads
export const useSquads = () => {
  const context = useContext(SquadContext);
  if (!context) {
    throw new Error("useSquads must be used within a SquadProvider");
  }
  return context;
};

// Create the provider component
export function SquadProvider (props : {
  children: React.ReactNode;
}) {
  const [squadState, setSquads] = useState<Map<number, SquadDef>>(() => {
    const squadsStr = localStorage.getItem("squads");
    return squadsStr ? new Map<number, SquadDef>(JSON.parse(squadsStr)) : new Map();
  });

  useEffect(() => {
    localStorage.setItem("squads", JSON.stringify(Array.from(squadState.entries())));
  }, [squadState]);

  const addSquad = (squad: SquadDef) => {
    setSquads((prev) => {
      const newSquads = new Map(prev);
      newSquads.set(squad.id, squad);
      return newSquads;
    });
  };

  const updateSquad = (id: number, squad: Partial<SquadDef>) => {
    setSquads((prev) => {
      const newSquads = new Map(prev);
      if (newSquads.has(id)) {
        newSquads.set(id, { ...newSquads.get(id), ...squad } as SquadDef);
      }
      return newSquads;
    });
  };

  const removeSquad = (id: number) => {
    setSquads((prev) => {
      const newSquads = new Map(prev);
      newSquads.delete(id);
      return newSquads;
    });
  }

  const clearSquads = () => {
    setSquads(new Map());
  };

  const updateSquadUnitType = (id: number, unitType: UnitType, count: number) => {
    setSquads((prev) => {
      const newSquads = new Map(prev);
      if (newSquads.has(id)) {
        const squad = newSquads.get(id);
        if (squad) {
          const newUnitTypes = squad.unitTypes.map((unit) => {
            if (unit.type === unitType) {
              return { type: unitType, count: count };
            }
            return unit;
          });
          newSquads.set(id, { ...squad, unitTypes: newUnitTypes });
        }
      }
      return newSquads;
    });
  }

  return (
    <SquadContext.Provider value={{ squadState, addSquad, updateSquad, clearSquads, removeSquad, updateSquadUnitType }}>
      {props.children}
    </SquadContext.Provider>
  );

};
