let upcomingGamesData;
let topPlayersData;
let topAthletesData = [];
let topAthletesStats = [];


async function getUpcomingGames() {
    const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
  
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Error fetching NBA scoreboard data');
        }
        upcomingGamesData = await response.json();
        resolve(upcomingGamesData);
    } catch (error) {
        reject(new Error('Error fetching NBA scoreboard data'));
    }
    });
  }

async function getTopPlayers(){
  const apiUrl = 'http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/leaders';

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Error fetching top players data');
      }
      topPlayersData = await response.json();
      // Assuming obj.categories[0].leaders[0].athlete.$ref is the URL of the athlete's data
      for(let i = 0; i<3; i++){
        const athleteUrl = topPlayersData.categories[0].leaders[i].athlete.$ref;
        const athleteResponse = await fetch(athleteUrl);
        if (!athleteResponse.ok) {
          throw new Error('Error fetching athlete data');
        }
        const athleteData = await athleteResponse.json();
        topAthletesData.push(athleteData);
      }
      for(let i = 0; i<topAthletesData.length; i++){
        const athleteStatUrl = topAthletesData[0].statistics.$ref;
        const athleteStatResponse = await fetch(athleteStatUrl);
        if(!athleteStatResponse.ok){
          throw new Error('Error fetching Athlete Data')
        }
        const athleteStatData = await athleteStatResponse.json();
        topAthletesStats.push(athleteStatData);
      }
      
      resolve({ topPlayersData, topAthletesData, topAthletesStats});
    } catch (error) {
      reject(new Error('Error fetching top players data'));
    }
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  try {
    const [upcomingGames, topPlayers] = await Promise.all([getUpcomingGames(), getTopPlayers()]);
    console.log('Top Players Data:', topPlayers);
      for (let i = 0; i < upcomingGamesData.events.length; i++) {
          const obj = upcomingGamesData.events[i];
          displayUpcomingGames(obj);
      }
      for (let i = 0; i < topAthletesData.length; i++) {
        const obj = topAthletesData[i];
        displayTopPlayers(obj);
    }
  } catch (error) {
      console.error('Error:', error);
  }
});


const upcomingGamesMachine = (obj) => {
  var team1 = obj.competitions[0].competitors[0].team;
  var team2 = obj.competitions[0].competitors[1].team;
  var gameTeams = obj.shortName;
  var record1 = obj.competitions[0].competitors[0].records[0].summary;
  var record2 = obj.competitions[0].competitors[1].records[0].summary;
  var date = obj.competitions[0].status.type.shortDetail;
  const makeGame = 
    `<div class="flex gap-4">
    <div class="avatar">
      <div class="w-14 rounded-xl">
        <img src="${team1.logo}" />
      </div>
    </div>
    <h2 class="card-title">${gameTeams}</h2>
    <div class="avatar">
      <div class="w-14 rounded-xl">
        <img src="${team2.logo}" />
      </div>
    </div>
  </div>
  <p>${date}</p>`;

  return makeGame;
}

const topPlayersMachine = (obj) => {
  var name = obj.fullName;
  var img = obj.headshot.href;
  var pts;
  var reb_name;
  var reb_num;
  var reb_rank;
  var FG_name;
  var FG_num;
  var FG_rank;
  var AST_name;
  var AST_num;
  var AST_rank;
  for(var i=0; i<topPlayersData.categories[0].leaders.length; i++){
    if(topPlayersData.categories[0].leaders[i].athlete.$ref == obj.$ref){
      var pts = topPlayersData.categories[0].leaders[i].displayValue;
    }
  }
  for(var i=0; i<topAthletesStats.length; i++){
    if(topAthletesStats[i].$red == obj.ref){
      var reb_name = topAthletesStats[i].splits.categories[1].stats[15].abbreviation;
      var reb_num = topAthletesStats[i].splits.categories[1].stats[15].displayValue;
      var reb_rank = topAthletesStats[i].splits.categories[1].stats[15].rank + "th";
      var FG_name = topAthletesStats[i].splits.categories[2].stats[5].abbreviation;
      var FG_num = topAthletesStats[i].splits.categories[2].stats[5].displayValue;
      var FG_rank = topAthletesStats[i].splits.categories[2].stats[5].rank + "th";
      var AST_name = topAthletesStats[i].splits.categories[2].stats[0].abbreviation;
      var AST_num = topAthletesStats[i].splits.categories[2].stats[0].displayValue;
      var AST_rank = topAthletesStats[i].splits.categories[2].stats[0].rank + "th";
    }
  }
  const makePlayers = 
    `<div class="collapse">
    <input type="radio" name="my-accordion-1"/> 
    <div class="collapse-title text-l font-medium">
        <div class="playerList">
            <div class="avatar">
                <div class="w-14 rounded-full">
                  <img src="${img}" />
                </div>
            </div>
            <p>${name}</p>
            <p class="cardPts">${pts}</p>
        </div>
        <div class="divider"></div> 
    </div>
    <div class="collapse-content text-center"> 
        <div class="stats shadow w-11/12">
            <div class="stat place-items-center">
            <div class="stat-title text-base">${reb_name}</div>
            <div class="stat-value text-xl">${reb_num}</div>
            <div class="stat-desc text-sm">${reb_rank}</div>
            </div>
            <div class="stat place-items-center">
            <div class="stat-title text-base">${AST_name}</div>
            <div class="stat-value text-xl">${AST_num}</div>
            <div class="stat-desc text-sm">${AST_rank}</div>
            </div>
            <div class="stat place-items-center">
            <div class="stat-title text-base">${FG_name}</div>
            <div class="stat-value text-xl">${FG_num}</div>
            <div class="stat-desc text-sm">${FG_rank}</div>
            </div>
        </div>
    </div>
  </div>`

  return makePlayers;
}

function displayTopPlayers(obj){
  let parentNode = document.getElementById('topPlayersContainer');
    parentNode.insertAdjacentHTML('beforeend', topPlayersMachine(obj));
}

function displayUpcomingGames(obj){
  let parentNode = document.getElementById('upcomingGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', upcomingGamesMachine(obj));
}

//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba
  
//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/leaders?lang=en&region=us