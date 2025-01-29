import { EmptySquad, SquadDef } from "@game/squad/squad";
import { Draggable } from "../core/draggable/Draggable";
import "./Card.css";
import { CardCodingContext } from "@/App";
import { useContext } from "react";
import { useSquads } from "./SquadProvider";
import { bgColor } from "@/style";

export interface CardProps {
  squad: SquadDef;
}

export default function Card(props: CardProps) {

  const cardContext = useContext(CardCodingContext);
  const isPlaceholder = props.squad.name === "placeholder";
  const {addSquad, removeSquad} = useSquads();

  return (
    <Draggable id={props.squad.id.toString()}>
      <div 
        className="card"
        style={{
          width: '150px',
          height: '200px',
          backgroundColor: bgColor,
          opacity: isPlaceholder ? 0.5 : 1,
          position: 'relative',
          // top: '40px',
          top: '-90px'

        }}
        onClick={(e) => {
          
          // On click set the selected card for code editing
          if (!isPlaceholder) {
            cardContext.setSelectedCodeEditCard(props.squad);
            e.stopPropagation();
          }
          else {
            // create new squad
            addSquad(EmptySquad);
          }

        }}
      >
        {/* Card Color Bar */}
        <div style={{
          width: '100%',
          height: '10px',
          backgroundColor: props.squad.color,
        }}>
        </div>

        {
          isPlaceholder &&
          <center>
            <h1>+</h1>
          </center>
        }
        { !isPlaceholder &&
          /* Card Content */
          <center>
            <p style={{
              fontSize: '0.9em',
            }}>{props.squad.name}</p>
            <ul>
              {
                props.squad.unitTypes.map((unitType, index) => {
                  return <li key={index}>{unitType.count}x {unitType.type}</li>
                })
              }
            </ul>
            <button onClick={(e) => {
              removeSquad(props.squad.id);
              e.stopPropagation();
            }}>Remove</button>
          </center>
        }
      </div>
    </Draggable>
  );
}