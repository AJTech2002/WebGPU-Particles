import Card from "./Card";
import { useSquads } from "./SquadProvider";

export default function CardTray () {

  const {squadState} = useSquads();
  const squads = Array.from(squadState.values());
  
  return ( <div
    style={{
      position: "absolute",
      display: "flex",
      gap: "10px",
      justifyContent: "center",
      bottom: 0,
      width: "100vw",
      height: "150px",

    }}
  >
    {squads.map((squad) => {
      return <Card key={squad.id} squad={squad} />;
    })}
    <Card key={"placeholder"} squad={{ id: -1, name: "placeholder", unitTypes: [], color: 'gray', code: ''}} />
  </div>
  );
}