import { BoidInterface } from "./interface/boid_interface";
import { GameDataBridge } from "./interface/bridge";
import { GameInterface } from "./interface/game_interface";
export declare class SelectionManager extends GameInterface {
    private _selectedBoid;
    private shiftKey;
    private boxSelect;
    private boxSelectDiv;
    constructor(bridge: GameDataBridge);
    private downPosition;
    private activePointerPosition;
    private onMouseDown;
    private selectOnMouse;
    private onMouseMove;
    private tempSelection;
    private runBoxSelect;
    private activeSelections;
    private appendSelections;
    private clearSelections;
    private disableSelections;
    get selections(): BoidInterface[];
    private onMouseUp;
}
