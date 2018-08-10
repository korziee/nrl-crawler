const puppeteer = require('puppeteer');
const moment = require('moment');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.nrl.com/draw/');
  page.on('console', msg => console.log(msg.text()));
  const result = await page.evaluate(() => {
    const scores = [];
    const upcoming = [];
    const live = [];
    const matches = document.querySelectorAll('.match-header');
    matches.forEach((match) => {
      const resultObj = { home: {}, away: {} };

      const home = match.querySelector('.match-team--home');
      const away = match.querySelector('.match-team--away');

      resultObj.home.teamName = home.querySelector('.match-team__name').innerText;
      resultObj.away.teamName = away.querySelector('.match-team__name').innerText;

      if ([...match.classList].includes('o-white-bg-with-grey-angle')) {
        if (match.querySelector('.match-clock').innerHTML.indexOf('Live') === -1) {
          // game has not started
          // using rest params on match.classList to convert to array as it is a "DOMTokenList" not an array, therefore includes does not work.
          resultObj.home.startTime = match.querySelector('.match-clock time').dateTime;
          upcoming.push(resultObj);
          return;
        }
      }

      resultObj.home.points = home.querySelector('.match-team__score').outerText.split(' ')[1];
      resultObj.away.points = away.querySelector('.match-team__score').outerText.split(' ')[1];

      if (match.querySelector('.match-clock').innerHTML.indexOf('Live') !== -1) {
        // game is live!
        resultObj.gameClockTime = match.querySelector('.match-clock__time').innerText;
        live.push(resultObj);
        return;
      }

      scores.push(resultObj);
      return;
    });
    return { scores, upcoming, live };
  }, moment);

  result.upcoming = result.upcoming.map(game => {
    game.home.startTime = moment(game.home.startTime).format('LLLL');
    return game;
  })

  const printNewLines = (amount) => {
    for (i = 0; i < amount; i += 1) {
      console.log('\n');
    }
  }

  if (result.scores.length) {
    console.log('---- ---- ---- PREVIOUS GAME SCORES ---- ---- ----')
    result.scores.forEach(game => {
      console.table(game);
    });
    printNewLines(3);
  }

  if (result.live.length) {
    console.log('---- ---- ---- LIVE GAME SCORES ---- ---- ----')
    result.live.forEach(game => {
      printNewLines(1);
      console.log('GAME IS LIVE, CURRENT TIME ON CLOCK: ', game.gameClockTime);
      console.table({ home: game.home, away: game.away });
    });
    printNewLines(3);
  }

  if (result.upcoming.length) {
    console.log('---- ---- ---- UPCOMING GAMES ---- ---- ----')
    result.upcoming.forEach(game => console.table(game));
    printNewLines(3);
  }


  await browser.close();
})();
