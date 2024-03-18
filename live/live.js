let liveGamesData;
let teamData;
let playerStats = [];

async function getLiveGames() {
  const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error('Error fetching NBA scoreboard data');
      }
      liveGamesData = await response.json();
      resolve(liveGamesData);
  } catch (error) {
      reject(new Error('Error fetching NBA scoreboard data'));
  }
  });
}

async function getTeamStats(gameID) {
  const apiUrl = `https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/events/${gameID}`;

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error('Error fetching NBA scoreboard data');
      }
      teamData = await response.json();
      resolve(teamData);
  } catch (error) {
      reject(new Error('Error fetching NBA scoreboard data'));
  }
  });
}

async function getPlayerStats(gameStats) {
  const apiUrl = `${gameStats}`;
  playerStats = []; 

  return new Promise(async (resolve, reject) => {
      try {
          const response = await fetch(apiUrl);
          if (!response.ok) {
              throw new Error('Error fetching game stats');
          }
          const gameData = await response.json();

          const categories = gameData.splits.categories[0];

          
          const playerPromises = categories.athletes.map(async athlete => {
            var AthleteUrl = athlete.athlete.$ref;
            var secureAthleteUrl = AthleteUrl.replace('http:', 'https:');
            var AthleteStatUrl = athlete.statistics.$ref;
            var secureAthleteStatUrl = AthleteStatUrl.replace('http:', 'https:');
            const athleteResponse = await fetch(secureAthleteUrl);
            const athleteStatResponse = await fetch(secureAthleteStatUrl);
            if (!athleteResponse.ok || !athleteStatResponse.ok) {
                throw new Error('Error fetching player stats');
            }
            const athleteData = await athleteResponse.json();
            const athleteStatData = await athleteStatResponse.json();
            return {
                athlete: athleteData,
                stats: athleteStatData
            };
        });

        const playerStats = await Promise.all(playerPromises);
        resolve(playerStats);
    } catch (error) {
        reject(new Error('Error fetching player stats'));
    }
});
}



document.addEventListener('DOMContentLoaded', async function() {
  const liveData = await Promise.all([getLiveGames()]);
  console.log("Live Game Data: ", liveData);
  try {
    const loadElement = document.getElementById("logoContainer");
    const gamesElement = document.getElementById("liveGamesCardContainer");
    var step = (100/liveGamesData.events.length);
      for (let i = 0; i < liveGamesData.events.length; i++) {
        
          loadElement.innerHTML=`<div class="radial-progress" style="--value:${i*step}; --size:12rem; --thickness: 5px;" role="progressbar">${Math.floor((i*step))+'%'}</div>`;
          const obj = liveGamesData.events[i];
          const teamData = await Promise.all([getTeamStats(liveGamesData.events[i].id)]);
          let playerDataTeam1;
          let playerDataTeam2;
          if(liveGamesData.events[i].status.type.state === "post" || liveGamesData.events[i].status.type.state === "in"){
            var playerDataTeam1Url = teamData[0].competitions[0].competitors[0].statistics.$ref;
            var playerDataTeam2Url = teamData[0].competitions[0].competitors[1].statistics.$ref;
            var securePlayerDataTeam1Url = playerDataTeam1Url.replace('http:', 'https:');
            var securePlayerDataTeam2Url = playerDataTeam2Url.replace('http:', 'https:');
            playerDataTeam1 = await Promise.all([getPlayerStats(securePlayerDataTeam1Url)]);
            playerDataTeam2 = await Promise.all([getPlayerStats(securePlayerDataTeam2Url)]);
          }
          displayLiveGames(obj, playerDataTeam1, playerDataTeam2);
      }
      loadElement.innerHTML=``;
      loadElement.style.opacity="0";
      loadElement.style.zIndex="-999";
      fadeMain();
  } catch (error) {
      console.error('Error:', error);
  }
});


document.addEventListener('DOMContentLoaded', function() {
  // Attach event listener to the document body
  document.body.addEventListener('click', function(event) {
    const target = event.target;

    // Check if the clicked element is the modal toggle or the close button
    if (target.matches('.modal-toggle')) {
      const modal = document.querySelector('.modal'); // Assuming .modal is the class of your modal
      const gamesContainer = document.getElementById("liveGamesCardContainer");
      const gamesTitleContainer = document.getElementById("titleHeader");
      
      // Toggle modal open/close
      if (modal.style.zIndex === "999") {
        gamesTitleContainer.style.opacity = "1"; 
        gamesContainer.style.top = "10vh"; 
        gamesTitleContainer.style.height = "fit-content";
        modal.style.zIndex = "-999";
        console.log("closed");
      } else {
        gamesContainer.style.top = "0"; 
        gamesTitleContainer.style.opacity = "0";
        gamesTitleContainer.style.height = "0";
        modal.style.zIndex = "999"; // Adjust the z-index as needed
        console.log("modal open");
      }
    }
  });
});



const liveGamesMachine = (obj, DataTeam1, DataTeam2) => {
  var gameID = obj.id;
  let allGamesOver = false;
  for(let i = 0; i<liveGamesData.events.length; i++){
    if(liveGamesData.events[i].status.type.state === "post"){
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
    var name1 = obj.competitions[0].competitors[0].team.abbreviation;
    var name2 = obj.competitions[0].competitors[1].team.abbreviation;
    var gameTeams = obj.shortName;
    var isGameActive = obj.status.type.state == "in";
    var isGamePre = obj.status.type.state == "pre";
    var isGameOver = obj.status.type.state == "post";
    var score1 = obj.competitions[0].competitors[0].score;
    var score2 = obj.competitions[0].competitors[1].score;
    var preRebStatName = obj.competitions[0].competitors[0].statistics[0].abbreviation;
    var preRebStatAvg1 = obj.competitions[0].competitors[0].statistics[1].displayValue;
    var preRebStatRank1 = obj.competitions[0].competitors[0].statistics[0].rankDisplayValue;
    var preRebStatAvg2 = obj.competitions[0].competitors[1].statistics[1].displayValue;
    var preRebStatRank2 = obj.competitions[0].competitors[1].statistics[0].rankDisplayValue;
    var preAstStatName = obj.competitions[0].competitors[0].statistics[2].abbreviation;
    var preAstStatAvg1 = obj.competitions[0].competitors[0].statistics[14].displayValue;
    var preAstStatRank1 = obj.competitions[0].competitors[0].statistics[2].rankDisplayValue;
    var preAstStatAvg2 = obj.competitions[0].competitors[1].statistics[14].displayValue;
    var preAstStatRank2 = obj.competitions[0].competitors[1].statistics[2].rankDisplayValue;
    var prePtsStatName = obj.competitions[0].competitors[0].statistics[13].abbreviation;
    var prePtsStatAvg1 = obj.competitions[0].competitors[0].statistics[13].displayValue;
    var prePtsStatRank1 = obj.competitions[0].competitors[0].statistics[9].rankDisplayValue;
    var prePtsStatAvg2 = obj.competitions[0].competitors[1].statistics[13].displayValue;
    var prePtsStatRank2 = obj.competitions[0].competitors[1].statistics[9].rankDisplayValue;

    if(isGameActive || isGameOver){
      var gameQtr1Team1 = obj.competitions[0].competitors[0].linescores[0]?.value || 0;
      var gameQtr2Team1 = obj.competitions[0].competitors[0].linescores[1]?.value || 0;
      var gameQtr3Team1 = obj.competitions[0].competitors[0].linescores[2]?.value || 0;
      var gameQtr4Team1 = obj.competitions[0].competitors[0].linescores[3]?.value || 0;
  
      var gameQtr1Team2 = obj.competitions[0].competitors[1].linescores[0]?.value || 0;
      var gameQtr2Team2 = obj.competitions[0].competitors[1].linescores[1]?.value || 0;
      var gameQtr3Team2 = obj.competitions[0].competitors[1].linescores[2]?.value || 0;
      var gameQtr4Team2 = obj.competitions[0].competitors[1].linescores[3]?.value || 0;
    }
    

    var team1PtsLeaderImg = obj.competitions[0].competitors[0].leaders[0].leaders[0].athlete.headshot;
    var team1PtsLeader = obj.competitions[0].competitors[0].leaders[0].leaders[0].athlete.shortName;
    var team1PtsLeaderValue = obj.competitions[0].competitors[0].leaders[0].leaders[0].displayValue;


    var team1AstLeaderImg = obj.competitions[0].competitors[0].leaders[1].leaders[0].athlete.headshot;
    var team1AstLeader = obj.competitions[0].competitors[0].leaders[1].leaders[0].athlete.shortName;
    var team1AstLeaderValue = obj.competitions[0].competitors[0].leaders[1].leaders[0].displayValue;

    var team1RebLeaderImg = obj.competitions[0].competitors[0].leaders[2].leaders[0].athlete.headshot;
    var team1RebLeader = obj.competitions[0].competitors[0].leaders[2].leaders[0].athlete.shortName;
    var team1RebLeaderValue = obj.competitions[0].competitors[0].leaders[2].leaders[0].displayValue;

    var team2PtsLeaderImg = obj.competitions[0].competitors[1].leaders[0].leaders[0].athlete.headshot;
    var team2PtsLeader = obj.competitions[0].competitors[1].leaders[0].leaders[0].athlete.shortName;
    var team2PtsLeaderValue = obj.competitions[0].competitors[1].leaders[0].leaders[0].displayValue;


    var team2AstLeaderImg = obj.competitions[0].competitors[1].leaders[1].leaders[0].athlete.headshot;
    var team2AstLeader = obj.competitions[0].competitors[1].leaders[1].leaders[0].athlete.shortName;
    var team2AstLeaderValue = obj.competitions[0].competitors[1].leaders[1].leaders[0].displayValue;

    var team2RebLeaderImg = obj.competitions[0].competitors[1].leaders[2].leaders[0].athlete.headshot;
    var team2RebLeader = obj.competitions[0].competitors[1].leaders[2].leaders[0].athlete.shortName;
    var team2RebLeaderValue = obj.competitions[0].competitors[1].leaders[2].leaders[0].displayValue;

    var record1 = obj.competitions[0].competitors[0].records[0].summary;
    var record2 = obj.competitions[0].competitors[1].records[0].summary;
    var date = obj.competitions[0].status.type.shortDetail;

    const makeGame = `
    <div class="collapse w-full">
      <input type="checkbox" name="my-accordion-1"/>
      <div class="collapse-title text-l font-medium flex flex-col justify-center">
        <p class="text-center">${date}</p>
        <div class="flex gap-4 justify-center text-center">
        ${isGamePre ? // Check if game is pre
            `<h2 class="card-title text-base">${record2}</h2>
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
          <h2 class="card-title text-base">${record1}</h2>` :
            (isGameActive ? // Check if game is active
              `<h2 class="card-title text-xl">${score2}</h2>
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
            <h2 class="card-title text-xl">${score1}</h2>` :
              (isGameOver ? // Check if game is over
                `<h2 class="card-title text-xl">${score2}</h2>
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
            <h2 class="card-title text-xl">${score1}</h2>` :
                `<div class="stat place-items-center">
                  <div class="stat-title text-base">Game Status Unknown</div>
                </div>`
              )
            )
          }
        </div>
        <div class="divider w-full"></div>
      </div>
      <div class="collapse-content text-center">
        <div class="collapse-title text-l font-medium flex flex-col justify-center">
        ${isGamePre ? // Check if game is pre
        `<p class="text-center" id="liveStatsTitle">Team Stats</p>
        <div class="stats shadow w-full bg-neutral">
          <div role="tablist" class="tabs tabs-bordered justify-center">
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto">
            <table class="table-xs">
              <!-- head -->
              <thead>
                <tr>
                  <th></th>
                  <th>AVG</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                <!-- row 1 -->
                <tr>
                  <th>${prePtsStatName}</th>
                  <td>${prePtsStatAvg2}</td>
                  <td>${prePtsStatRank2}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                <th>${preAstStatName}</th>
                <td>${preAstStatAvg2}</td>
                <td>${preAstStatRank2}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                <th>${preRebStatName}</th>
                <td>${preRebStatAvg2}</td>
                <td>${preRebStatRank2}</td>
                </tr>
              </tbody>
            </table>
          </div>
            </div>
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                    <th></th>
                    <th>AVG</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  <tr>
                  <th>${prePtsStatName}</th>
                  <td>${prePtsStatAvg1}</td>
                  <td>${prePtsStatRank1}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                <th>${preAstStatName}</th>
                <td>${preAstStatAvg1}</td>
                <td>${preAstStatRank1}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                <th>${preRebStatName}</th>
                <td>${preRebStatAvg1}</td>
                <td>${preRebStatRank1}</td>
                </tr>
                </tbody>
              </table>
              </div>
              </div>
              </div>
              </div>
              <p class="text-center" id="liveStatsTitle">Team Leaders</p>
        <div class="stats shadow w-full bg-neutral">
          <div role="tablist" class="tabs tabs-bordered justify-center">
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto w-full">
            <table class="table-xs">
              <!-- head -->
              <thead>
                <tr>
                  <th></th>
                  <th>Player</th>
                  <th>AVG</th>
                </tr>
              </thead>
              <tbody>
                <!-- row 1 -->
                <!-- row 1 -->
                  <tr>
                  <th class="text-base">${prePtsStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team2PtsLeaderImg}" />
                      </div>
                    </div>
                    ${team2PtsLeader}</td>
                  <td class="text-base">${team2PtsLeaderValue}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                  <th class="text-base">${preAstStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team2AstLeaderImg}" />
                      </div>
                    </div>
                    ${team2AstLeader}</td>
                  <td class="text-base">${team2AstLeaderValue}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                  <th class="text-base">${preRebStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team2RebLeaderImg}" />
                      </div>
                    </div>
                    ${team2RebLeader}</td>
                  <td class="text-base">${team2RebLeaderValue}</td>
                </tr>
              </tbody>
            </table>
          </div>
            </div>
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                    <th></th>
                    <th>Player</th>
                    <th>AVG</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  <tr>
                  <th class="text-base">${prePtsStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team1PtsLeaderImg}" />
                      </div>
                    </div>
                    ${team1PtsLeader}</td>
                  <td class="text-base">${team1PtsLeaderValue}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                  <th class="text-base">${preAstStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team1AstLeaderImg}" />
                      </div>
                    </div>
                    ${team1AstLeader}</td>
                  <td class="text-base">${team1AstLeaderValue}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                  <th class="text-base">${preRebStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team1RebLeaderImg}" />
                      </div>
                    </div>
                    ${team1RebLeader}</td>
                  <td class="text-base">${team1RebLeaderValue}</td>
                </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>
          </div>` :
            (isGameActive ? // Check if game is active
              `<p class="text-center" id="liveStatsTitle">Game Stats</p>
              <div class="stats shadow w-full bg-neutral">
              <div class="overflow-x-auto w-full">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                  <th></th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  <tr>
                    <th>${name2}</th>
                    <td>${gameQtr1Team2}</td>
                    <td>${gameQtr2Team2}</td>
                    <td>${gameQtr3Team2}</td>
                    <td>${gameQtr4Team2}</td>
                    <td>${score2}</td>
                  </tr>
                  <!-- row 2 -->
                  <tr>
                    <th>${name1}</th>
                    <td>${gameQtr1Team1}</td>
                    <td>${gameQtr2Team1}</td>
                    <td>${gameQtr3Team1}</td>
                    <td>${gameQtr4Team1}</td>
                    <td>${score1}</td>
                  </tr>
                  <!-- row 3 -->
                </tbody>
              </table>
              </div>
            </div>
            <p class="text-center" id="liveStatsTitle">Team Leaders</p>
      <div class="stats shadow w-full bg-neutral">
        <div role="tablist" class="tabs tabs-bordered justify-center">
          <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" />
          <div role="tabpanel" class="tab-content">
          <div class="overflow-x-auto w-full">
          <table class="table-xs">
            <!-- head -->
            <thead>
              <tr>
                <th></th>
                <th>Player</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <!-- row 1 -->
              <!-- row 1 -->
              <tr>
              <th>${prePtsStatName}</th>
              <td class="text-sm" id="playerNameGamesContainer">
                <div class="avatar">
                  <div class="w-10 rounded-full">
                    <img src="${team2PtsLeaderImg}" />
                  </div>
                </div>
                ${team2PtsLeader}</td>
              <td class="text-base">${team2PtsLeaderValue}</td>
            </tr>
            <!-- row 2 -->
            <tr>
              <th>${preAstStatName}</th>
              <td class="text-sm" id="playerNameGamesContainer">
                <div class="avatar">
                  <div class="w-10 rounded-full">
                    <img src="${team2AstLeaderImg}" />
                  </div>
                </div>
                ${team2AstLeader}</td>
              <td class="text-base">${team2AstLeaderValue}</td>
            </tr>
            <!-- row 3 -->
            <tr>
              <th>${preRebStatName}</th>
              <td class="text-sm" id="playerNameGamesContainer">
                <div class="avatar">
                  <div class="w-10 rounded-full">
                    <img src="${team2RebLeaderImg}" />
                  </div>
                </div>
                ${team2RebLeader}</td>
              <td class="text-base">${team2RebLeaderValue}</td>
            </tr>
            </tbody>
          </table>
        </div>
          </div>
          <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
          <div role="tabpanel" class="tab-content">
          <div class="overflow-x-auto">
            <table class="table-xs">
              <!-- head -->
              <thead>
                <tr>
                  <th></th>
                  <th>Player</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <!-- row 1 -->
                <tr>
                <th>${prePtsStatName}</th>
                <td class="text-sm" id="playerNameGamesContainer">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="${team1PtsLeaderImg}" />
                    </div>
                  </div>
                  ${team1PtsLeader}</td>
                <td class="text-base">${team1PtsLeaderValue}</td>
              </tr>
              <!-- row 2 -->
              <tr>
                <th>${preAstStatName}</th>
                <td class="text-sm" id="playerNameGamesContainer">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="${team1AstLeaderImg}" />
                    </div>
                  </div>
                  ${team1AstLeader}</td>
                <td class="text-base">${team1AstLeaderValue}</td>
              </tr>
              <!-- row 3 -->
              <tr>
                <th>${preRebStatName}</th>
                <td class="text-sm" id="playerNameGamesContainer">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="${team1RebLeaderImg}" />
                    </div>
                  </div>
                  ${team1RebLeader}</td>
                <td class="text-base">${team1RebLeaderValue}</td>
              </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
        </div>
        <label for="my_modal_${gameID}" class="btn m-4 btn-outline">Full Game Stats</label>
        <input type="checkbox" id="my_modal_${gameID}" class="modal-toggle" />
        <div class="modal" role="dialog">
          <div class="modal-box">
          <div class="modal-action" id="close-toggle">
            <label for="my_modal_${gameID}" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" />
            </svg>          
            </label>
          </div>
          <div class="flex gap-4 justify-around text-center">
              <h2 class="card-title text-2xl">${score2}</h2>
              <div class="avatar">
              <div class="w-16 rounded-xl">
                <img src="${team2.logo}" />
              </div>
            </div>
            <h2 class="card-title text-base"></h2>
            <div class="avatar">
              <div class="w-16 rounded-xl">
                <img src="${team1.logo}" />
              </div>
            </div>
            <h2 class="card-title text-2xl">${score1}</h2>
          </div>
            <p class="text-center" id="liveStatsTitle">Game Stats</p>
              <div class="stats shadow w-full bg-neutral">
              <div class="overflow-x-auto w-full">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                  <th></th>
                  <th>1</th>
                  <th>2</th>
                  <th>3</th>
                  <th>4</th>
                  <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  <tr>
                    <th>${name2}</th>
                    <td>${gameQtr1Team2}</td>
                    <td>${gameQtr2Team2}</td>
                    <td>${gameQtr3Team2}</td>
                    <td>${gameQtr4Team2}</td>
                    <td>${score2}</td>
                  </tr>
                  <!-- row 2 -->
                  <tr>
                    <th>${name1}</th>
                    <td>${gameQtr1Team1}</td>
                    <td>${gameQtr2Team1}</td>
                    <td>${gameQtr3Team1}</td>
                    <td>${gameQtr4Team1}</td>
                    <td>${score1}</td>
                  </tr>
                  <!-- row 3 -->
                </tbody>
              </table>
              </div>
            </div>
          <p class="text-center" id="liveStatsTitle">Team Players</p>
          <div class="stats shadow w-full bg-neutral">
            <div role="tablist" class="tabs tabs-bordered justify-center">
              <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" checked="checked" />
              <div role="tabpanel" class="tab-content">
              <div class="overflow-x-auto" id="playerStatsContainer">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                  <th></th>
                  <th>Player</th>
                  <th>Pts</th>
                  <th>Ast</th>
                  <th>Reb</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  ${generateTeamPlayerRows(DataTeam2)}
                    
                </tbody>
              </table>
            </div>
              </div>
              <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
              <div role="tabpanel" class="tab-content">
              <div class="overflow-x-auto" id="playerStatsContainer">
                <table class="table-xs">
                  <!-- head -->
                  <thead>
                    <tr>
                      <th></th>
                      <th>Player</th>
                      <th>Pts</th>
                      <th>Ast</th>
                      <th>Reb</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- row 1 -->
                    ${generateTeamPlayerRows(DataTeam1)}
                    
                  </tbody>
                </table>
              </div>
              </div>
            </div>
            </div>
          </div>
        </div>`:
              (isGameOver ? // Check if game is over
                `<p class="text-center" id="liveStatsTitle">Game Stats</p>
                <div class="stats shadow w-full bg-neutral">
                <div class="overflow-x-auto w-full">
                <table class="table-xs">
                  <!-- head -->
                  <thead>
                    <tr>
                    <th></th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- row 1 -->
                    <tr>
                      <th>${name2}</th>
                      <td>${gameQtr1Team2}</td>
                      <td>${gameQtr2Team2}</td>
                      <td>${gameQtr3Team2}</td>
                      <td>${gameQtr4Team2}</td>
                      <td>${score2}</td>
                    </tr>
                    <!-- row 2 -->
                    <tr>
                      <th>${name1}</th>
                      <td>${gameQtr1Team1}</td>
                      <td>${gameQtr2Team1}</td>
                      <td>${gameQtr3Team1}</td>
                      <td>${gameQtr4Team1}</td>
                      <td>${score1}</td>
                    </tr>
                    <!-- row 3 -->
                  </tbody>
                </table>
                </div>
              </div>
              <p class="text-center" id="liveStatsTitle">Team Leaders</p>
        <div class="stats shadow w-full bg-neutral">
          <div role="tablist" class="tabs tabs-bordered justify-center">
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto w-full">
            <table class="table-xs">
              <!-- head -->
              <thead>
                <tr>
                  <th></th>
                  <th>Player</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <!-- row 1 -->
                <!-- row 1 -->
                <tr>
                <th>${prePtsStatName}</th>
                <td class="text-sm" id="playerNameGamesContainer">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="${team2PtsLeaderImg}" />
                    </div>
                  </div>
                  ${team2PtsLeader}</td>
                <td class="text-base">${team2PtsLeaderValue}</td>
              </tr>
              <!-- row 2 -->
              <tr>
                <th>${preAstStatName}</th>
                <td class="text-sm" id="playerNameGamesContainer">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="${team2AstLeaderImg}" />
                    </div>
                  </div>
                  ${team2AstLeader}</td>
                <td class="text-base">${team2AstLeaderValue}</td>
              </tr>
              <!-- row 3 -->
              <tr>
                <th>${preRebStatName}</th>
                <td class="text-sm" id="playerNameGamesContainer">
                  <div class="avatar">
                    <div class="w-10 rounded-full">
                      <img src="${team2RebLeaderImg}" />
                    </div>
                  </div>
                  ${team2RebLeader}</td>
                <td class="text-base">${team2RebLeaderValue}</td>
              </tr>
              </tbody>
            </table>
          </div>
            </div>
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                    <th></th>
                    <th>Player</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  <tr>
                  <th>${prePtsStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team1PtsLeaderImg}" />
                      </div>
                    </div>
                    ${team1PtsLeader}</td>
                  <td class="text-base">${team1PtsLeaderValue}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                  <th>${preAstStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team1AstLeaderImg}" />
                      </div>
                    </div>
                    ${team1AstLeader}</td>
                  <td class="text-base">${team1AstLeaderValue}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                  <th>${preRebStatName}</th>
                  <td class="text-sm" id="playerNameGamesContainer">
                    <div class="avatar">
                      <div class="w-10 rounded-full">
                        <img src="${team1RebLeaderImg}" />
                      </div>
                    </div>
                    ${team1RebLeader}</td>
                  <td class="text-base">${team1RebLeaderValue}</td>
                </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>
          </div>
          <label for="my_modal_${gameID}" class="btn m-4 btn-outline">Full Game Stats</label>
          <input type="checkbox" id="my_modal_${gameID}" class="modal-toggle" />
          <div class="modal" role="dialog">
            <div class="modal-box">
            <div class="modal-action" id="close-toggle">
              <label for="my_modal_${gameID}" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-10">
                  <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" />
                </svg>            
              </label>
            </div>
            <div class="flex gap-4 justify-around text-center">
                <h2 class="card-title text-2xl">${score2}</h2>
                <div class="avatar">
                <div class="w-16 rounded-xl">
                  <img src="${team2.logo}" />
                </div>
              </div>
              <h2 class="card-title text-base"></h2>
              <div class="avatar">
                <div class="w-16 rounded-xl">
                  <img src="${team1.logo}" />
                </div>
              </div>
              <h2 class="card-title text-2xl">${score1}</h2>
            </div>
              <p class="text-center" id="liveStatsTitle">Game Stats</p>
                <div class="stats shadow w-full bg-neutral">
                <div class="overflow-x-auto w-full">
                <table class="table-xs">
                  <!-- head -->
                  <thead>
                    <tr>
                    <th></th>
                    <th>1</th>
                    <th>2</th>
                    <th>3</th>
                    <th>4</th>
                    <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- row 1 -->
                    <tr>
                      <th>${name2}</th>
                      <td>${gameQtr1Team2}</td>
                      <td>${gameQtr2Team2}</td>
                      <td>${gameQtr3Team2}</td>
                      <td>${gameQtr4Team2}</td>
                      <td>${score2}</td>
                    </tr>
                    <!-- row 2 -->
                    <tr>
                      <th>${name1}</th>
                      <td>${gameQtr1Team1}</td>
                      <td>${gameQtr2Team1}</td>
                      <td>${gameQtr3Team1}</td>
                      <td>${gameQtr4Team1}</td>
                      <td>${score1}</td>
                    </tr>
                    <!-- row 3 -->
                  </tbody>
                </table>
                </div>
              </div>
            <p class="text-center" id="liveStatsTitle">Team Players</p>
            <div class="stats shadow w-full bg-neutral">
              <div role="tablist" class="tabs tabs-bordered justify-center">
                <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" checked="checked" />
                <div role="tabpanel" class="tab-content">
                <div class="overflow-x-auto" id="playerStatsContainer">
                <table class="table-xs">
                  <!-- head -->
                  <thead>
                    <tr>
                    <th></th>
                    <th>Player</th>
                    <th>Pts</th>
                    <th>Ast</th>
                    <th>Reb</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- row 1 -->
                    ${generateTeamPlayerRows(DataTeam2)}
                      
                  </tbody>
                </table>
              </div>
                </div>
                <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
                <div role="tabpanel" class="tab-content">
                <div class="overflow-x-auto" id="playerStatsContainer">
                  <table class="table-xs">
                    <!-- head -->
                    <thead>
                      <tr>
                        <th></th>
                        <th>Player</th>
                        <th>Pts</th>
                        <th>Ast</th>
                        <th>Reb</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- row 1 -->
                      ${generateTeamPlayerRows(DataTeam1)}
                      
                    </tbody>
                  </table>
                </div>
                </div>
              </div>
              </div>
            </div>
          </div>` :
                `<div class="stat place-items-center">
                  <div class="stat-title text-base">Game Status Unknown</div>
                </div>`
              )
            )
          }
        <div class="divider w-full"></div>
      </div>
    </div>
    </div>`;
    return makeGame;
  }

  const generateTeamPlayerRows = (playerData) => {
    // Get the first array from playerData to iterate over
    var playerStatIndex = playerData[0];
    const playerArray = Object.values(playerStatIndex);

    
    playerArray.sort((a,b) => b.stats.splits.categories[2].stats[10].value - a.stats.splits.categories[2].stats[10].value);

    console.log(playerArray);

    var playerRows = '';
    

    for (let i = 0; i < playerArray.length; i++) {
        const obj = playerArray[i];
          if (typeof obj.athlete.headshot === 'undefined') {
            continue; // Skip this iteration and move to the next one
        }
        const makePlayer = `
        <tr>
        <th class="text-sm">${obj.athlete.jersey}</th>
        <td class="text-sm" id="playerNameGamesContainer">
          <div class="avatar">
            <div class="w-7 rounded-full">
              <img src="${obj.athlete.headshot.href}" />
            </div>
          </div>
          ${obj.athlete.shortName} 
        </td>
        <td class="text-sm">${obj.stats.splits.categories[2].stats[10].displayValue}</td>
        <td class="text-sm">${obj.stats.splits.categories[2].stats[0].displayValue}</td>
        <td class="text-sm">${obj.stats.splits.categories[1].stats[6].displayValue}</td>
      </tr>
        `;

      
        playerRows += makePlayer;
    }
   
    return playerRows;
  }

function displayLiveGames(obj, playerDataTeam1, playerDataTeam2){
    let parentNode = document.getElementById('liveGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', liveGamesMachine(obj, playerDataTeam1, playerDataTeam2));
}

function fadeMain(){
  const mainElement = document.getElementById("liveGamesCardContainer");
  mainElement.classList.add("fadein");
}