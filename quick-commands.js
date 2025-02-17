
// Follow mouse cursor
setInterval(() => {
  game.units.forEach((u) => u.moveTo(game.mousePosition[0], game.mousePosition[1]))
})

setInterval(() => {
  game.units[0].moveTo(
    game.mousePosition[0], game.mousePosition[1]
  )
});


while (true) {
  await game.tick();
  game.units.forEach((u) => {
    const mP = game.mousePosition;
    u.moveTo(mP[0], mP[1])
  })
}

game.units.forEach((u) => u.stop());


const radius = 3; // Adjust the radius as needed
const interval = 100; // Time interval in milliseconds

setInterval(() => {
  const mousePosition = game.mousePosition;
  const units = squad.units;
  const mouseX = mousePosition.x;
  const mouseY = mousePosition.y;
  const unitCount = units.length;

  units.forEach((unit, index) => {
    const angle = (index / unitCount) * 2 * Math.PI; // Distribute evenly in a circle
    const targetX = mouseX + radius * Math.cos(angle);
    const targetY = mouseY + radius * Math.sin(angle);

    unit.moveTo(targetX, targetY);
  });
}, interval);

var center;
while (true) {
  const mousePosition = game.mousePosition;
  const units = squad.units;
  const mouseX = mousePosition.x;
  const mouseY = mousePosition.y;
  const unitCount = units.length;

  units.forEach((unit, index) => {
    const angle = (index / unitCount) * 2 * Math.PI; // Distribute evenly in a circle
    const targetX = mouseX + radius * Math.cos(angle);
    const targetY = mouseY + radius * Math.sin(angle);

    unit.moveTo(targetX, targetY);
  });
  await tick();
  // await seconds(2);
}


const unitCounts = 1000;

for (let i = 0; i < unitCounts; i++) {
  if (game.units[i].id < unitCounts)
  game.units[i].kill();
}
game.units.forEach((u, i) => console.log({u, i}));


// while (true) {
//   await game.tick();
//   var closest = game.units[0].closestFriendlyNeighbour;
//   if (closest !== undefined) {
//     console.log(closest);
//     const closestPos = closest.position;
//     game.units[0].moveTo(
//       closestPos.x, closestPos.y
//     )
//   / }

// SIngle guy attacking all
while (true) {
  await game.tick();
  for (let i = 0; i < game.units.length; i++) {
    var closest = game.units[i].closestFriendlyNeighbour;

    if (closest !== undefined) {
      const closestPos = closest.position;
      console.log(closestPos);
      game.units[i].moveTo(
        closestPos.x, closestPos.y
      )

      game.units[i].attack(closest);
    }
  }
}


// line up around
for (let i = 0; i < squad.units.length; i++) {
  var gap = 0.2;
  var posX = (squadDropPosition[0] - squad.units.length * gap) + i * gap;
  var posY = squadDropPosition[1];

  squad.units[i].moveTo(posX, posY);

}


var enemyMapped = {};

while (true) {
  await seconds(2.0);
  for (var unit of squad.getUnits()) {
    
    var closestEnemy = (unit as any).closestEnemy;

    if (closestEnemy !== null && closestEnemy !== undefined && closestEnemy.alive) {
      unit.moveTo(closestEnemy.position.x, closestEnemy.position.y);
      unit.attack(closestEnemy);
    }
    else {
      const closest  = unit.getClosestEnemy();
      if (closest === null || closest === undefined) {
        continue;
      }
      // check if key exists
      if (enemyMapped[closest.id] === undefined) {
        enemyMapped[closest.id] = 1;
      }
      else {
        if (enemyMapped[closest.id] > 2) {
          continue;
        }
        enemyMapped[closest.id] += 1;
        (unit as any).closestEnemy = closest;
      }
    }
  }
}


/// -- BACKGROUND ATTACK
selection.forEach((u) => {
  const nearest  = u.getClosestEnemy();
  if (nearest !== null) {
    u.attack(nearest)
  }
})