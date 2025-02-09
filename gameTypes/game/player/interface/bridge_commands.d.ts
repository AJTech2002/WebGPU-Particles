import { Vector3 } from "../../../engine/math/src";
import { Neighbour } from "../../boids/boid_system";
import { UnitType } from "../../squad/squad";
export interface BoidInterfaceData {
    id: number;
    ownerId: number;
    position: Vector3;
    alive: boolean;
    neighbours: Neighbour[];
    unitType: UnitType;
}
export interface EnemyInterfaceData {
    id: number;
    ownerId: number;
    position: Vector3;
    alive: boolean;
    unitType: UnitType;
    health: number;
}
export type BoidInterfaceCommand = {
    id: number;
    type: "Move";
    props: MoveCommandProps;
} | {
    id: number;
    type: "Attack";
    props: AttackCommandProps;
} | {
    id: number;
    type: "TakeDamage";
    props: TakeDamageCommandProps;
} | {
    id: number;
    type: "Stop";
} | {
    id: number;
    type: "Terminate";
} | {
    type: "Create";
    props: CreateCommandProps;
};
export interface MoveCommandProps {
    vec: Vector3;
    dir: boolean;
}
export interface AttackCommandProps {
    direction: Vector3;
}
export interface TakeDamageCommandProps {
    damage: number;
}
export interface CreateCommandProps {
    type: UnitType;
    position: Vector3;
}
