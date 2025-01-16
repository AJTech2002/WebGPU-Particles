// Follow mouse cursor
setInterval(() => {
  game.units.forEach((u) => u.moveTo(game.mousePosition[0], game.mousePosition[1]))
})