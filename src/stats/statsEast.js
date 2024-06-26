let teamData;
let teamStatData;

async function getTeamStats() {
  const apiUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/groups/5/teams';

  try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error('Error fetching NBA Teams');
      }
      const data = await response.json();

      const teamPromises = data.items.map(async teams => {
          const teamUrl = teams.$ref;
          const safeTeamUrl = teamUrl.replace('http:', 'https:');
          const teamResponse = await fetch(safeTeamUrl);
          if (!teamResponse.ok) {
              throw new Error('Error fetching team data');
          }
          const teamData = await teamResponse.json();

          const teamStatsUrl = teamData.statistics.$ref.replace('http:', 'https:');
          const teamRecordUrl = teamData.record.$ref.replace('http:', 'https:');
          const teamPlayersUrl = teamData.athletes.$ref.replace('http:', 'https:');

          const [teamStatsResponse, teamRecordResponse, teamPlayersResponse] = await Promise.all([
              fetch(teamStatsUrl),
              fetch(teamRecordUrl),
              fetch(teamPlayersUrl)
          ]);

          if (!teamStatsResponse.ok || !teamRecordResponse.ok || !teamPlayersResponse.ok) {
              throw new Error('Error fetching team data');
          }

          const [teamStats, teamRecord, teamPlayers] = await Promise.all([
              teamStatsResponse.json(),
              teamRecordResponse.json(),
              teamPlayersResponse.json()
          ]);

          const playerPromises = teamPlayers.items.map(async athlete => {
              const athleteUrl = athlete.$ref;
              const secureAthleteUrl = athleteUrl.replace('http:', 'https:');
              const athleteResponse = await fetch(secureAthleteUrl);
              if (!athleteResponse.ok) {
                  throw new Error('Error fetching player data');
              }
              const athleteData = await athleteResponse.json();
              if (!athleteData.statistics) {
                  return null;
              }
              const athleteStatUrl = athleteData.statistics.$ref;
              const secureAthleteStatUrl = athleteStatUrl.replace('http:', 'https:');
              const athleteStatResponse = await fetch(secureAthleteStatUrl);
              if (!athleteStatResponse.ok) {
                  throw new Error('Error fetching player stats data');
              }
              const athleteStatData = await athleteStatResponse.json();

              return {
                  players: athleteData,
                  stats: athleteStatData
              };
          });

          const players = await Promise.all(playerPromises);
          const filteredPlayers = players.filter(player => player && player.players && player.players.headshot);

          filteredPlayers.sort((a, b) => {
              const statA = a.stats?.splits?.categories[2]?.stats[11]?.value || Number.MIN_SAFE_INTEGER;
              const statB = b.stats?.splits?.categories[2]?.stats[11]?.value || Number.MIN_SAFE_INTEGER;
              return statB - statA;
          });

          return {
              teams: teamData,
              stats: teamStats,
              record: teamRecord,
              athletes: filteredPlayers
          };
      });

      const teamStats = await Promise.all(teamPromises);
      return teamStats;
  } catch (error) {
      console.error(error);
      throw new Error('Error fetching NBA Teams');
  }
}


document.addEventListener('DOMContentLoaded', async function(){
    const teams = await Promise.all([getTeamStats()]);
    console.log(teams);
    try{
        const loadElement = document.getElementById("logoContainer");
        const step = (100/teams[0].length);
        for(let i=0; i<teams[0].length; i++){
            loadElement.innerHTML=`<div class="radial-progress" style="--value:${i*step}; --size:12rem; --thickness: 5px;" role="progressbar">${Math.floor((i*step))+'%'}</div>`;
            let obj = teams[0][i];
            displayTeams(obj);
    
        }
        loadElement.innerHTML=``;
        loadElement.style.zIndex="-999";
        loadElement.style.opacity="0";
        fadeMain();
    }catch(error){
        console.error('Error:', error);
    }
    
});

document.addEventListener('DOMContentLoaded', function() {
  document.body.addEventListener('click', function(event) {
    let target = event.target;

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
        console.log("close");
      } else {
        gamesContainer.style.top = "0"; 
        gamesTitleContainer.style.opacity = "0";
        gamesTitleContainer.style.height = "0";
        modal.style.zIndex = "999"; // Adjust the z-index as needed
        console.log("open");
      }
    }
  });
});

const teamsMachine = (obj) => {
    let teamName = obj.teams.displayName;
    let id = obj.teams.abbreviation;
    let teamImg = obj.teams.logos[0].href;
    let record = obj.record.items[0].displayValue;
    let homeRecord = obj.record.items[1].displayValue;
    let awayRecord = obj.record.items[2].displayValue;
  
    let playoffSeedItem = obj.record.items.find(item => item.stats.some(stat => stat.name === "playoffSeed"));

    // Extract the playoffSeed value if found
    let playoffSeed = playoffSeedItem ? playoffSeedItem.stats.find(stat => stat.name === "playoffSeed").value : null;
    let rank = playoffSeed;
    const makeTeam = `
                <div class="card lg bg-neutral shadow-xl">
                <label for="my_modal_${id}" >
                    <div class="card-body p-0">
                      <div class="w-full">
                        <div class="text-l font-medium flex flex-col justify-center">
                            <div class="flex p-2 place-items-center align-center w-full">
                                <div class="avatar pl-2">
                                    <div class="w-14 rounded">
                                    <img src="${teamImg}" />
                                    </div>
                                </div>
                                <div class="flex flex-col px-2 text-center">
                                  <p class="text-primary text-lg">#${rank}</p>
                                  <p class="text-sm">${record}</p>
                              </div>
                              <div class="flex flex-col px-2 text-center">
                                <p class="text-primary text-md p-1">${teamName}</p>
                                  <div class="avatar-group -space-x-5 rtl:space-x-reverse">
                                  ${generateTeamPlayers(obj.athletes)}
                                  </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </label>
                      </div>
                        <input type="checkbox" id="my_modal_${id}" class="modal-toggle" />
                        <div class="modal" role="dialog">
                          <div class="modal-box min-h-fit">
                            <div class="flex flex-col w-full justify-center">
                              <div class="flex justify-center p-1">
                                <div class="hero min-h-fit w-11/12 shadow-xl" style="background-image: url(${obj.teams.venue.images[0].href});">
                                  <div class="hero-overlay bg-opacity-60"></div>
                                      <div class="hero-content text-neutral-content">
                                        <div class="avatar p-1">
                                          <div class="w-16 rounded">
                                            <img src="${teamImg}" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                </div>
                                </div>
                                <div class="flex justify-center p-1">
                                  <div class="stats bg-neutral shadow w-11/12">
                                    <div class="stat place-items-center">
                                      <div class="stat-title text-sm">OVR</div>
                                      <div class="stat-value text-base">${record}</div>
                                    </div>
                                    
                                    <div class="stat place-items-center">
                                      <div class="stat-title text-sm">HOME</div>
                                      <div class="stat-value text-base">${homeRecord}</div>
                                    </div>
                                    
                                    <div class="stat place-items-center">
                                      <div class="stat-title text-sm">AWAY</div>
                                      <div class="stat-value text-base">${awayRecord}</div>
                                    </div>
                                  </div>
                                </div>
                                <div class="flex justify-center p-1">
                                <div class="stats shadow bg-neutral w-11/12">
                                    <div class="overflow-x-auto" id="playerStatsContainer">
                                      <table class="table-xs player-list-container">
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
                                          ${generateTeamPlayerRows(obj.athletes)}
                                            
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                              </div>
                            <div class="modal-action">
                              <label for="my_modal_${id}" class="btn btn-sm btn-circle btn-ghost">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                                </svg>
                              </label>
                              </div>
                            </div>
                          </div>
                        `;

    return makeTeam;
}


const generateTeamPlayerRows = (playerList) => {
  let playerRows = '';
  for (let i = 0; i < playerList.length; i++) {
    let obj = playerList[i];
    playerRows += generatePlayerRow(obj);
  }
  return playerRows;
}

const generatePlayerRow = (obj) => {
  return `
      <tr>
      <th class="text-sm">${obj.players.jersey}</th>
      <td class="text-sm" id="playerNameGamesContainer">
        <div class="avatar">
          <div class="w-7 rounded-full">
            <img src="${obj.players.headshot.href}" loading="lazy"/>
          </div>
        </div>
        ${obj.players.shortName} 
      </td>
      <td class="text-sm">${obj.stats.splits.categories[2].stats[30].displayValue}</td>
      <td class="text-sm">${obj.stats.splits.categories[2].stats[32].displayValue}</td>
      <td class="text-sm">${obj.stats.splits.categories[1].stats[15].displayValue}</td>
    </tr>
  `;
};

const generateTeamPlayers = (players) => {
  let playerHtml = '';
  for (let i = 0; i <= 4; i++){
    let obj = players[i];
    if (!obj.players.headshot) {
      continue; // Skip this iteration and move to the next one
    }
    playerHtml+= `
    <div class="avatar border-neutral">
      <div class="w-12">
        <img src="${obj.players.headshot.href}" loading="lazy"/>
      </div>
    </div>
        `;
  }
  return playerHtml;
}
function displayTeams(obj){
    const parentNode = document.getElementById('liveGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', teamsMachine(obj));
}

function fadeMain(){
    const mainElement = document.getElementById("liveGamesCardContainer");
    mainElement.classList.add("fadein");
}

function updateCheckboxState() {
  var checkboxes = document.querySelectorAll('.theme-controller');
  checkboxes.forEach(function(checkbox) {
    if (localStorage.getItem(checkbox.value) === 'checked') {
      checkbox.checked = true;
    } else {
      checkbox.checked = false;
    }
  });
}

// Function to store checkbox state in localStorage
function storeCheckboxState() {
  var checkbox = this;
  if (checkbox.checked) {
    localStorage.setItem(checkbox.value, 'checked');
  } else {
    localStorage.setItem(checkbox.value, 'unchecked');
  }
}

// Call updateCheckboxState when the page loads
document.addEventListener('DOMContentLoaded', function () {
  updateCheckboxState();
});

// Attach an event listener to the checkbox for changes
var checkboxes = document.querySelectorAll('.theme-controller');
checkboxes.forEach(function(checkbox) {
  checkbox.addEventListener('change', storeCheckboxState);
});