/* eslint-disable max-len */
/* eslint-disable no-unused-vars */

// Character meanings:
// (.) - empty space
// (#) - walls
// (+) - lava
// (@) - player starting position
// (o) - coin
// (=) - horizontally moving lava
// (|) - vertically moving lava
// (v) - falling drops of lava

// Levels should not have indented lines

const simpleLevelPlan = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................
`;
const GAME_LEVELS = [`
................................................................................
................................................................................
................................................................................
................................................................................
................................................................................
................................................................................
..................................................................###...........
...................................................##......##....##+##..........
....................................o.o......##..................#+++#..........
.................................................................##+##..........
...................................#####..........................#v#...........
............................................................................##..
..##......................................o.o................................#..
..#.....................o....................................................#..
..#......................................#####.............................o.#..
..#..........####.......o....................................................#..
..#..@.......#..#................................................#####.......#..
..############..###############...####################.....#######...#########..
..............................#...#..................#.....#....................
..............................#+++#..................#+++++#....................
..............................#+++#..................#+++++#....................
..............................#####..................#######....................
................................................................................
................................................................................
`, `
................................................................................
................................................................................
....###############################.............................................
...##.............................##########################################....
...#.......................................................................##...
...#....o...................................................................#...
...#................................................=.......................#...
...#.o........################...................o..o...........|........o..#...
...#.........................#..............................................#...
...#....o....................##########.....###################....##########...
...#..................................#+++++#.................#....#............
...###############....oo......=o.o.o..#######.###############.#....#............
.....#...............o..o.............#.......#......#........#....#............
.....#....................#############..######.####.#.########....########.....
.....#.............########..............#...........#.#..................#.....
.....#..........####......####...#####################.#..................#.....
.....#........###............###.......................########....########.....
.....#.......##................#########################......#....#............
.....#.......#................................................#....#............
.....###......................................................#....#............
.......#...............o...........................................#............
.......#...............................................o...........#............
.......#########......###.....############.........................##...........
.............#..................#........#####....#######.o.........########....
.............#++++++++++++++++++#............#....#.....#..................#....
.............#++++++++++++++++++#..........###....###...####.o.............#....
.............####################..........#........#......#.....|.........#....
...........................................#++++++++#......####............#....
...........................................#++++++++#.........#........@...#....
...........................................#++++++++#.........##############....
...........................................##########...........................
................................................................................
`, `
......................................#++#........................#######....................................#+#..
......................................#++#.....................####.....####.................................#+#..
......................................#++##########...........##...........##................................#+#..
......................................##++++++++++##.........##.............##...............................#+#..
.......................................##########++#.........#....................................o...o...o..#+#..
................................................##+#.........#.....o...o....................................##+#..
.................................................#+#.........#................................###############++#..
.................................................#v#.........#.....#...#........................++++++++++++++##..
.............................................................##..|...|...|..##............#####################...
..............................................................##+++++++++++##............v........................
...............................................................####+++++####......................................
...............................................#.....#............#######........###.........###..................
...............................................#.....#...........................#.#.........#.#..................
...............................................#.....#.............................#.........#....................
...............................................#.....#.............................##........#....................
...............................................##....#.............................#.........#....................
...............................................#.....#......o..o.....#...#.........#.........#....................
...............#######........###...###........#.....#...............#...#.........#.........#....................
..............##.....##.........#...#..........#.....#.....######....#...#...#########.......#....................
.............##.......##........#.o.#..........#....##...............#...#...#...............#....................
.....@.......#.........#........#...#..........#.....#...............#...#...#...............#....................
....###......#.........#........#...#..........#.....#...............#...#####...######......#....................
....#.#......#.........#.......##.o.##.........#.....#...............#.....o.....#.#.........#....................
++++#.#++++++#.........#++++++##.....##++++++++##....#++++++++++.....#.....=.....#.#.........#....................
++++#.#++++++#.........#+++++##.......##########.....#+++++++##+.....#############.##..o.o..##....................
++++#.#++++++#.........#+++++#....o.................##++++++##.+....................##.....##.....................
++++#.#++++++#.........#+++++#.....................##++++++##..+.....................#######......................
++++#.#++++++#.........#+++++##.......##############++++++##...+..................................................
++++#.#++++++#.........#++++++#########++++++++++++++++++##....+..................................................
++++#.#++++++#.........#++++++++++++++++++++++++++++++++##.....+..................................................
`, `
..............................................................................................................
..............................................................................................................
..............................................................................................................
..............................................................................................................
..............................................................................................................
........................................o.....................................................................
..............................................................................................................
........................................#.....................................................................
........................................#.....................................................................
........................................#.....................................................................
........................................#.....................................................................
.......................................###....................................................................
.......................................#.#.................+++........+++..###................................
.......................................#.#.................+#+........+#+.....................................
.....................................###.###................#..........#......................................
......................................#...#.................#...oooo...#.......###............................
......................................#...#.................#..........#......#+++#...........................
......................................#...#.................############.......###............................
.....................................##...##......#...#......#................................................
......................................#...#########...########..............#.#...............................
......................................#...#...........#....................#+++#..............................
......................................#...#...........#.....................###...............................
.....................................##...##..........#.......................................................
......................................#...#=.=.=.=....#............###........................................
......................................#...#...........#...........#+++#.......................................
......................................#...#....=.=.=.=#.....o......###.......###..............................
.....................................##...##..........#.....................#+++#.............................
..............................o...o...#...#...........#.....#................##v........###...................
......................................#...#...........#..............#.................#+++#..................
.............................###.###.###.###.....o.o..#++++++++++++++#...................v#...................
.............................#.###.#.#.###.#..........#++++++++++++++#........................................
.............................#.............#...#######################........................................
.............................##...........##.........................................###......................
..###.........................#.....#.....#.........................................#+++#................###..
..#.#.........................#....###....#..........................................###.................#.#..
..#...........................#....###....#######........................#####.............................#..
..#...........................#...........#..............................#...#.............................#..
..#...........................##..........#..............................#.#.#.............................#..
..#.......................................#.......|####|....|####|.....###.###.............................#..
..#................###.............o.o....#..............................#.........###.....................#..
..#...............#####.......##..........#.............................###.......#+++#..........#.........#..
..#...............o###o.......#....###....#.............................#.#........###..........###........#..
..#................###........#############..#.oo.#....#.oo.#....#.oo..##.##....................###........#..
..#......@..........#.........#...........#++#....#++++#....#++++#....##...##....................#.........#..
..#############################...........#############################.....################################..
..............................................................................................................
..............................................................................................................
`, `
..................................................................................................###.#.......
......................................................................................................#.......
..................................................................................................#####.......
..................................................................................................#...........
..................................................................................................#.###.......
..........................o.......................................................................#.#.#.......
.............................................................................................o.o.o###.#.......
...................###................................................................................#.......
.......+..o..+................................................#####.#####.#####.#####.#####.#####.#####.......
.......#.....#................................................#...#.#...#.#...#.#...#.#...#.#...#.#...........
.......#=.o..#............#...................................###.#.###.#.###.#.###.#.###.#.###.#.#####.......
.......#.....#..................................................#.#...#.#...#.#...#.#...#.#...#.#.....#.......
.......+..o..+............o..................................####.#####.#####.#####.#####.#####.#######.......
..............................................................................................................
..........o..............###..............................##..................................................
..............................................................................................................
..............................................................................................................
......................................................##......................................................
...................###.........###............................................................................
..............................................................................................................
..........................o.....................................................#......#......................
..........................................................##.....##...........................................
.............###.........###.........###.................................#..................#.................
..............................................................................................................
.................................................................||...........................................
..###########.................................................................................................
..#.........#.o.#########.o.#########.o.##................................................#...................
..#.........#...#.......#...#.......#...#.................||..................#.....#.........................
..#..@......#####...o...#####...o...#####.....................................................................
..#######.....................................#####.......##.....##.....###...................................
........#=..................=................=#...#.....................###...................................
........#######################################...#+++++++++++++++++++++###+++++++++++++++++++++++++++++++++++
..................................................############################################################
..............................................................................................................
`];