import { Color, Vector3 } from "@engine/math/src";
import { BoidInterface } from "./interface/boid_interface";
import { GameDataBridge } from "./interface/bridge";
import { GameInterface } from "./interface/game_interface";
import { Vector4 } from "@engine/math/src";
import BoidInstance from "@game/boids/boid_instance";
import { TerminalEventEmitter } from "@game/ui/game/TerminalHandler";

/* This is fine to be on the UI thread */
export class SelectionManager extends GameInterface {

  private _selectedBoid: BoidInterface | null = null;
  private shiftKey: boolean = false;
  private boxSelect: boolean = false;

  // Visuals
  private boxSelectDiv: HTMLDivElement | null = null;

  constructor(bridge: GameDataBridge) {
    super(bridge);

    // create the div
    this.boxSelectDiv = document.createElement("div");
    this.boxSelectDiv.style.position = "absolute";
    this.boxSelectDiv.style.border = "3px solid white";
    this.boxSelectDiv.style.pointerEvents = "none";
    this.boxSelectDiv.style.zIndex = "9999";
    this.boxSelectDiv.id = "box-select";
    this.boxSelectDiv.style.backgroundColor = "rgba(255,255,255,0.1)";
    // duisplay none
    this.boxSelectDiv.style.display = "none";
    document.body.appendChild(this.boxSelectDiv);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Shift") {
        this.shiftKey = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "Shift") {
        this.shiftKey = false;
        this.disableSelections();
      }
    });

    window.addEventListener("mousedown", (e) => {
      if (e.button === 0 && this.shiftKey) {
        this.onMouseDown(e);
      }
    });

    window.addEventListener("mousemove", (e) => {
        this.onMouseMove(e);
    });

    window.addEventListener("mouseup", (e) => {
        this.onMouseUp(e);
    });

  }

  private downPosition: Vector3 | null = null;
  private activePointerPosition: Vector3 = new Vector3(0,0,0);

  private onMouseDown (e: MouseEvent) {
    this.downPosition = new Vector3(e.clientX, e.clientY, 0);
  
  }

  //TODO: This should use the BoidINterface for WebWorker support
  private selectOnMouse () : BoidInstance | null {
    const mousePosition = this.bridge.mousePosition;
    const toGridTile = this.bridge.worldToGrid(mousePosition.x, mousePosition.y);
    const boids = this.bridge.getUnitsAtGrid(toGridTile.x, toGridTile.y);

    let foundBoid: BoidInstance | null = null;
    for (const boid of boids) {
      if (mousePosition.distanceTo(boid.position) < 0.1) {
        foundBoid = boid;
        break;
      }
    }

    return foundBoid;
  }

  private onMouseMove (e: MouseEvent) {
    if (this.shiftKey) {
      // look for boids in the area

      if (!this.boxSelect) {
        
        const boid = this.selectOnMouse();

        if (boid !== null) {
          // make cursor selection
          document.body.style.cursor = "pointer";
        }
        else {
          // make cursor normal
          document.body.style.cursor = "default";
        }
      }
      this.activePointerPosition = new Vector3(e.clientX, e.clientY, 0);


      if (this.downPosition) {
        if (this.activePointerPosition.distanceTo2D(this.downPosition) > 0.2) {
          this.boxSelect = true;
          this.runBoxSelect();
        }
      }

    }
  }

  private tempSelection: BoidInstance[] = [];

  private runBoxSelect() {
    if (this.downPosition) {
      const start = this.downPosition;
      const end = this.activePointerPosition;
      this.boxSelectDiv!.style.display = "block";
      this.boxSelectDiv!.style.left = Math.min(start.x, end.x) + "px";
      this.boxSelectDiv!.style.top = Math.min(start.y, end.y) + "px";
      this.boxSelectDiv!.style.width = Math.abs(start.x - end.x) + "px";
      this.boxSelectDiv!.style.height = Math.abs(start.y - end.y) + "px";


      const startWorldPos = this.bridge.screenToWorld(start.x, start.y, 0, true);
      const endWorldPos = this.bridge.screenToWorld(end.x, end.y, 0, true);

      const startGridPos = this.bridge.worldToGrid(startWorldPos.x, startWorldPos.y);
      const endGridPos = this.bridge.worldToGrid(endWorldPos.x, endWorldPos.y);

      const selectedBoids : BoidInstance[] = [];

      for (let x = Math.min(startGridPos.x, endGridPos.x); x <= Math.max(startGridPos.x, endGridPos.x); x++) {
        for (let y = Math.min(startGridPos.y, endGridPos.y); y <= Math.max(startGridPos.y, endGridPos.y); y++) {
          const boids = this.bridge.getUnitsAtGrid(x, y);
          for (const boid of boids) {
            // check if the boid is in the box
            const boidWorldPos = boid.position;
            const boidScreenPos = this.bridge.worldToScreen(boidWorldPos);
            if (boidScreenPos.x > Math.min(start.x, end.x) && boidScreenPos.x < Math.max(start.x, end.x) && boidScreenPos.y > Math.min(start.y, end.y) && boidScreenPos.y < Math.max(start.y, end.y)) {
              selectedBoids.push(boid);
            }
          }
        }
      }


      // hihghlight selected boids & remove from previous selection
    
      // find the intersection of the two arrays
      const intersection = this.tempSelection.filter(boid => !selectedBoids.find(b => b.id === boid.id));

      // remove the intersection from both arrays
      for (const boid of intersection) {
        boid.diffuseColor = boid.originalColor.clone();
      }

      for (const boid of selectedBoids) {
        boid.diffuseColor = boid.originalColor.clone().add(new Vector4(0.2, 0.2, 0.2, 0));
      }


      this.tempSelection = selectedBoids;
    }

  }

  private activeSelections: BoidInstance[] = [];

  private appendSelections (selection: BoidInstance[]) {
    for (const boid of selection) {
      boid.diffuseColor = boid.originalColor.clone().add(new Vector4(0.2, 0.2, 0.2, 0));
    }

    this.activeSelections = this.activeSelections.concat(selection);
  }

  private clearSelections () {
    for (const boid of this.activeSelections) {
      boid.diffuseColor = boid.originalColor.clone();
    }
    this.activeSelections = [];
  }

  private disableSelections () {
    this.boxSelect = false;

    this.downPosition = null;
    // this.boxSelectDiv?.remove();
    this.boxSelectDiv!.style.display = "none";
    document.body.style.cursor = "default";

  }

  public get selections () {
    return this.bridge.getOrCreateInterfaces(this.activeSelections);
  }

  private onMouseUp (e: MouseEvent) {

    if (!this.boxSelect && this.shiftKey) {
      const boid = this.selectOnMouse();
      if (boid) {
        this.appendSelections([boid]);
        if (this.activeSelections.length > 0) {
          TerminalEventEmitter.emit('open_new_terminal', {
            mousePosition: [e.clientX, e.clientY],
            fromSelection: true
          });
        }
    
      }
      else
        this.clearSelections();
    }
    else if (this.boxSelect) {
      this.appendSelections(this.tempSelection);

      if (this.activeSelections.length > 0 && this.tempSelection.length > 0) {

        const start = [this.downPosition!.x, this.downPosition!.y];
        const end = [e.clientX, e.clientY];
        const avg = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];

        TerminalEventEmitter.emit('open_new_terminal', {
          mousePosition: [avg[0], avg[1]],
          fromSelection: true
        });
      }

      this.tempSelection = [];

  
    }

   
    this.disableSelections();

  }

}

