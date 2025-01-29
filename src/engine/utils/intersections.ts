import { Vector2 } from "@engine/math/src";


export function line2DIntersectsRotatedSquare(squareCenter : Vector2, sideLength : number, rotation : number, lineStart : Vector2, lineEnd : Vector2) {
  // Create rotation matrix (inverse rotation to align square)
  const cosTheta = Math.cos(-rotation);
  const sinTheta = Math.sin(-rotation);

  function rotatePoint(p : Vector2) {
      // Translate point relative to square center
      const translated = new Vector2(p.x - squareCenter.x, p.y - squareCenter.y);
      // Apply inverse rotation
      return new Vector2(
          translated.x * cosTheta - translated.y * sinTheta,
          translated.x * sinTheta + translated.y * cosTheta
      );
  }

  // Rotate the line points
  const newStart = rotatePoint(lineStart);
  const newEnd = rotatePoint(lineEnd);

  // Define the axis-aligned square bounds after transformation
  const halfSide = sideLength / 2;
  const minX = -halfSide, maxX = halfSide;
  const minY = -halfSide, maxY = halfSide;

  // Check if either point is inside the square (trivial acceptance)
  function isInside(p : Vector2) {
      return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  }
  if (isInside(newStart) || isInside(newEnd)) return true;

  // Check for line-segment intersection with square edges
  const squareEdges = [
      [new Vector2(minX, minY), new Vector2(maxX, minY)], // Bottom edge
      [new Vector2(maxX, minY), new Vector2(maxX, maxY)], // Right edge
      [new Vector2(maxX, maxY), new Vector2(minX, maxY)], // Top edge
      [new Vector2(minX, maxY), new Vector2(minX, minY)]  // Left edge
  ];

  function lineSegmentIntersects(p1 : Vector2, p2 : Vector2, q1 : Vector2, q2 : Vector2) {
      function cross(v1 : Vector2, v2 : Vector2) {
          return v1.x * v2.y - v1.y * v2.x;
      }
      const r = new Vector2().subVectors(p2, p1);
      const s = new Vector2().subVectors(q2, q1);
      const rxs = cross(r, s);
      const qmp = new Vector2().subVectors(q1, p1);
      const qmpxr = cross(qmp, r);
      if (rxs === 0 && qmpxr === 0) return false; // Collinear
      if (rxs === 0) return false; // Parallel

      const t = cross(qmp, s) / rxs;
      const u = qmpxr / rxs;

      return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  for (const [q1, q2] of squareEdges) {
      if (lineSegmentIntersects(newStart, newEnd, q1, q2)) {
          return true;
      }
  }

  return false;
}