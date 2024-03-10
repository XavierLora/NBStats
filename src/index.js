let upcomingGamesData;
let topPlayersData;
let topAthletesData = [];
let topAthletesStats = [];
let topTeamData;
let topTeamsData = [];


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
  const apiUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/leaders';

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
        const secureAthleteUrl = athleteUrl.replace('http:', 'https:');
        const athleteResponse = await fetch(secureAthleteUrl);
        if (!athleteResponse.ok) {
          throw new Error('Error fetching athlete data');
        }
        const athleteData = await athleteResponse.json();
        topAthletesData.push(athleteData);
      }
      for(let i = 0; i<topAthletesData.length; i++){
        const athleteStatUrl = topAthletesData[i].statistics.$ref;
        const secureAthleteStatUrl = athleteStatUrl.replace('http:', 'https:');
        const athleteStatResponse = await fetch(secureAthleteStatUrl);
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

async function getTopTeams() {
  const apiUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/powerindex?lang=en&region=us';

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Error fetching top teams data');
      }
      topTeamData = await response.json();
      // Assuming obj.categories[0].leaders[0].athlete.$ref is the URL of the athlete's data
      for(let i = 0; i<3; i++){
        const teameUrl = topTeamData.items[i].team.$ref;
        const secureTeamUrl = teameUrl.replace('http:', 'https:');
        const teamResponse = await fetch(secureTeamUrl);
        if (!teamResponse.ok) {
          throw new Error('Error fetching athlete data');
        }
        const teamData = await teamResponse.json();
        topTeamsData.push(teamData);
      }

      
      resolve({ topTeamData, topTeamsData});
    } catch (error) {
      reject(new Error('Error fetching top players data'));
    }
  });
}


document.addEventListener('DOMContentLoaded', async function eventHandler() {
  try {
    const [upcomingGames, topPlayers, topTeams] = await Promise.all([getUpcomingGames(), getTopPlayers(), getTopTeams()]);
    console.log('Top Players Data:', topPlayers);
    console.log('Top Teams Data:', topTeams);
    console.log('Upcoming Games Data:', upcomingGames);
      for (let i = 0; i < upcomingGamesData.events.length; i++) {
          const obj = upcomingGamesData.events[i];
          displayUpcomingGames(obj);
      }
      for (let i = 0; i < topAthletesData.length; i++) {
        const obj = topAthletesData[i];
        displayTopPlayers(obj);
    }
    for (let i = 0; i < topTeamsData.length; i++) {
      const obj = topTeamData.items[i];
      displayTopTeams(obj);
    }
    
    // Remove the event listener after execution
    document.removeEventListener('DOMContentLoaded', eventHandler);
  } catch (error) {
      console.error('Error:', error);
  }
});

const upcomingGamesMachine = (obj) => {
  let allGamesOver = false;
  for(let i = 0; i<upcomingGamesData.events.length; i++){
    if(upcomingGamesData.events[i].status.type.state === "post"){
      allGamesOver = true;
    }else{
      allGamesOver = false;
    }
  }
  const gamesTitleElement = document.getElementById("gamesTitle");
  if(allGamesOver){
    gamesTitleElement.innerHTML="Last Night's Games";
  }else{
    gamesTitleElement.innerHTML="Live & Upcoming Games";
  }
  var team1 = obj.competitions[0].competitors[0].team;
  var team2 = obj.competitions[0].competitors[1].team;
  var gameTeams = obj.shortName;
  var winner1 = obj.competitions[0].competitors[0].winner;
  var winner2 = obj.competitions[0].competitors[1].winner;
  var isGameActive = obj.status.type.state == "in"
  var isGamePre = obj.status.type.state == "pre";
  var isGameOver = obj.status.type.state == "post";
  var score1 = obj.competitions[0].competitors[0].score;
  var score2 = obj.competitions[0].competitors[1].score;
  var highlights;
  var record1 = obj.competitions[0].competitors[0].records[0].summary;
  var record2 = obj.competitions[0].competitors[1].records[0].summary;
  var date = obj.competitions[0].status.type.shortDetail;
  if (isGameOver) {
    highlights = obj.links[2].href;
  }
  const makeGame = `
    <div class="collapse w-full">
      <input type="radio" name="my-accordion-1"/>
      <div class="collapse-title text-l font-medium flex flex-col justify-center">
        <div class="flex gap-4 justify-center text-center place-items-center">
        ${isGameOver ?
          `${winner2 ? // Check if there is a winner
          `<p class="text-center text-xl" id="win">W</p>` :
          `<p class="text-center text-xl" id="lose">L</p>`
          }
          <div class="avatar">
            <div class="w-14 rounded-xl">
              <img src="${team2.logo}" />
            </div>
          </div>
          <h2 class="card-title text-base">${gameTeams}</h2>
          <div class="avatar">
            <div class="w-14 rounded-xl">
              <img src="${team1.logo}" />
            </div>
          </div>
          ${winner1 ? // Check if there is a winner
            `<p class="text-center text-xl" id="win">W</p>` :
            `<p class="text-center text-xl" id="lose">L</p>`
            }`:
        `<div class="avatar">
          <div class="w-14 rounded-xl">
            <img src="${team2.logo}" />
          </div>
        </div>
        <h2 class="card-title text-base">${gameTeams}</h2>
        <div class="avatar">
          <div class="w-14 rounded-xl">
            <img src="${team1.logo}" />
          </div>
        </div>
        `
        }
        </div>
        <p class="text-center">${date}</p>
        <div class="divider w-full"></div>
      </div>
      <div class="collapse-content text-center">
        <div class="stats shadow w-11/12">
          ${isGamePre ? // Check if game is pre
            `<div class="stat place-items-center">
            <div class="stat-title text-base">Record</div>
            <div class="stat-value text-xl">${record2}</div>
          </div>
          <div class="stat place-items-center">
            <div class="stat-title text-base">Record</div>
            <div class="stat-value text-xl">${record1}</div>
          </div>` :
            (isGameActive ? // Check if game is active
              `<div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score2}</div>
              </div>
              <div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score1}</div>
              </div>` :
              (isGameOver ? // Check if game is over
                `<div class="stat place-items-center">
                  <div class="stat-title text-base">Final</div>
                  <div class="stat-value text-base">${score2}-${score1}</div>
                </div>
                <div class="stat place-items-center">
                <div class="stat-title text-base">Highlights</div>
                <div class="stat-value text-base">
                  <a href="${highlights}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
                    </svg>
                  </a>
                </div>
              </div>` :
                `<div class="stat place-items-center">
                  <div class="stat-title text-base">Game Status Unknown</div>
                </div>`
              )
            )
          }
        </div>
      </div>
    </div>`;

  return makeGame;
}

const topPlayersMachine = (obj) => {
  var objPlayerLink = obj.$ref;
  var securePlayerLink = objPlayerLink.replace('http:', 'https:');
  var objStatsLink = obj.statistics.$ref;
  var temp = objStatsLink.replace('http:', 'https:');
  var secureStatsLink = temp.replace('/statistics', '/statistics/0');
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
  var i = 0;
while (typeof FG_name === 'undefined') {
    if ((topPlayersData.categories[0].leaders[i].athlete.$ref).replace('http:', 'https:') === securePlayerLink) {
        var pts = topPlayersData.categories[0].leaders[i].displayValue;
        if ((topAthletesStats[i].$ref).replace('http:', 'https:') === secureStatsLink) {
            var reb_name = topAthletesStats[i].splits.categories[1].stats[15].shortDisplayName;
            var reb_num = topAthletesStats[i].splits.categories[1].stats[15].displayValue;
            var reb_rank = topAthletesStats[i].splits.categories[1].stats[15].rankDisplayValue;
            var FG_name = topAthletesStats[i].splits.categories[2].stats[5].abbreviation;
            var FG_num = topAthletesStats[i].splits.categories[2].stats[5].displayValue;
            var FG_rank = topAthletesStats[i].splits.categories[2].stats[5].rankDisplayValue;
            var AST_name = topAthletesStats[i].splits.categories[2].stats[32].shortDisplayName;
            var AST_num = topAthletesStats[i].splits.categories[2].stats[32].displayValue;
            var AST_rank = topAthletesStats[i].splits.categories[2].stats[32].rankDisplayValue;
        }
    }
    i++;
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
        <div class="stats shadow" id="playerStatWidth">
            <div class="stat place-items-center">
            <div class="stat-title text-base">${reb_name}</div>
            <div class="stat-value text-xl">${reb_num}</div>
            <div class="stat-value text-xs">${reb_rank}</div>
            </div>
            <div class="stat place-items-center">
            <div class="stat-title text-base">${AST_name}</div>
            <div class="stat-value text-xl">${AST_num}</div>
            <div class="stat-value text-xs">${AST_rank}</div>
            </div>
            <div class="stat place-items-center">
            <div class="stat-title text-base">${FG_name}</div>
            <div class="stat-value text-xl">${FG_num}</div>
            <div class="stat-value text-xs">${FG_rank}</div>
            </div>
        </div>
    </div>
  </div>`

  return makePlayers;
}

const topTeamsMachine = (obj) => {
  var place = obj.stats[48].displayValue;
  var wins = obj.stats[4].value;
  var loses = obj.stats[5].value;
  var sos = obj.stats[33].displayValue;
  if (place.indexOf("Tied-") !== -1) {
    // If "Tied-" is found, remove it
    place = place.replace("Tied-", "");
}
  var objTeamLink = obj.team.$ref;
  var secureTeamLink = objTeamLink.replace('http:', 'https:');
  var teamName;
  var teamCity;
  var teamImg;

  var i = 0;
  
  while (typeof teamName === 'undefined') {
    if ((topTeamsData[i].$ref).replace('http:', 'https:') === secureTeamLink) {
            teamName = topTeamsData[i].name;
            teamCity = topTeamsData[i].abbreviation;
            var temp = topTeamsData[i].logos[0].href;
            var teamImg = temp.replace('http:', 'https:');
        }
    i++;
  }
  const makeTeams = 
    `<div class="collapse">
    <input type="radio" name="my-accordion-1"/> 
    <div class="collapse-title text-l font-medium">
        <div class="playerList">
            <div class="avatar">
                <div class="w-14 rounded-full">
                  <img src="${teamImg}" />
                </div>
            </div>
            <p class="teamName">${teamCity} ${teamName}</p>
            <p class="cardPts">${wins}-${loses}</p>
        </div>
        <div class="divider"></div> 
    </div>
    <div class="collapse-content text-center"> 
    <div class="stats shadow" id="playerStatWidth">
    <div class="stat place-items-center">
      <div class="stat-title text-base">RANK</div>
      <div class="stat-value text-xl">${place}</div>
    </div>
    <div class="stat place-items-center">
      <div class="stat-title text-base">Strength of Sch.</div>
      <div class="stat-value text-xl">${sos}</div>
    </div>
</div>
    </div>
  </div>`

  return makeTeams;
}


function displayUpcomingGames(obj){
  let parentNode = document.getElementById('upcomingGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', upcomingGamesMachine(obj));
}

function displayTopPlayers(obj){
  let parentNode = document.getElementById('topPlayersContainer');
    parentNode.insertAdjacentHTML('beforeend', topPlayersMachine(obj));
}

function displayTopTeams(obj){
  let parentNode = document.getElementById('teamsContainer');
    parentNode.insertAdjacentHTML('beforeend', topTeamsMachine(obj));
}



//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba
  
//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/leaders?lang=en&region=us