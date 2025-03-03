import { Vector3 } from "@engine/math/src";
import Component from "@engine/scene/component";
import { SquadDef } from "@game/basic_level";
import BoidScene from "@game/boid_scene";
import { Unit } from "@game/units/unit";

class Squad {
  opts: SquadDef;
  squad: Unit[];
}

export class SquadManager extends Component {

  private squads: Squad[] = [];

  constructor() {
    super();
  }

  async spawnSquads(squads: SquadDef[]) {
    for (let i = 0; i < squads.length; i++) {
      await this.spawnSquad(squads[i]);
    }

    this.selectSquad(this.squads[0]);
  }

  async spawnSquad(squadLeader: SquadDef) {
    const squadSize = squadLeader.squadSize;
    const squadUnits: Unit[] = [];
    for (let j = 0; j < squadSize; j++) {
      const unit = (this.scene as BoidScene).createUnit(0, squadLeader.squadType, new Vector3(0, 0, 0), 1.0, 0, 0.3, 1.0, true);
      squadUnits.push(unit);
    }

    const squad: Squad = {
      opts: squadLeader,
      squad: squadUnits
    }

    this.squads.push(squad);
  }


  public selectSquad(squad: Squad) {
    for (let i = 0; i < squad.squad.length; i++) {
      squad.squad[i].select();
    }
  }


}

