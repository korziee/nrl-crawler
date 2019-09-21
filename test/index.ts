import { NrlApi } from "../src/index";

// new NrlApi()
//   .getRoundDetails(12)
//   .then(x => console.log(JSON.stringify(x, null, 2)));

new NrlApi()
  .getMatchDetails("finals-week-2/game-2")
  .then(x => console.log(JSON.stringify(x, null, 2)));
