import { Vector2, Vector3 } from "@engine/math/src"

interface WorldDivProps extends React.HTMLAttributes<HTMLDivElement> {
    worldPosition: Vector3;
    size: Vector2;
    absoluteSize: boolean;
}

export const WorldDiv = ({ worldPosition, size, absoluteSize, style, ...divAttrs }: WorldDivProps) => {

    return (
        <div {...divAttrs}>
            <h1>WorldDiv</h1>
            <div>
                <h2>worldPosition</h2>
                <p>{worldPosition.toString()}</p>
            </div>
        </div>
    )
}
