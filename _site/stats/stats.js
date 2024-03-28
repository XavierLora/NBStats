let teamData;
let teamStatData;

async function getTeamStats(){
    const apiUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/teams?limit=30';

    return new Promise(async (resolve, reject) => {
        try{
            const response = await fetch(apiUrl);
            if(!response.ok){
                throw new Error('Error fetching NBA Teams');
            }
            const data = await response.json();
            
            const teamPromises = data.items.map(async teams => {
                var teamUrl = teams.$ref;
                var safeTeamUrl = teamUrl.replace('http:', 'https:');
                const teamResponse = await fetch(safeTeamUrl);
                if(!teamResponse.ok){
                    throw new Error('Error fetching team data');
                }
                const teamData = await teamResponse.json();
                var teamStatsUrl = teamData.statistics.$ref;
                var teamRecordUrl = teamData.record.$ref;
                var teamPlayersUrl = teamData.athletes.$ref;
                var secureTeamStatsUrl = teamStatsUrl.replace('http:','https:');
                var secureTeamRecordUrl = teamRecordUrl.replace('http:','https:');
                var securePlayersUrl = teamPlayersUrl.replace('http:','https:');
                const teamStatsResponse = await fetch(secureTeamStatsUrl);
                const teamRecordResponse = await fetch(secureTeamRecordUrl);
                const teamPlayersResponse = await fetch(securePlayersUrl);
                if(!teamStatsResponse.ok || !teamRecordResponse.ok || !teamPlayersResponse.ok){
                    throw new Error('Error fetching team data');
                }
                const teamRecord = await teamRecordResponse.json();
                const teamStats = await teamStatsResponse.json();
                const teamPlayers = await teamPlayersResponse.json();
                
                const playerPromises = teamPlayers.items.map(async athlete => {
                  var athleteUrl = athlete.$ref;
                  var secureAthleteUrl = athleteUrl.replace('http:', 'https:');
                  const athleteResponse = await fetch(secureAthleteUrl);
                  if(!athleteResponse.ok){
                    throw new Error('Error fetching player data');
                  }
                  const athleteData = await athleteResponse.json();
                  if(!athleteData.statistics){
                    return null;
                  }
                  var athleteStatsUrl = athleteData.statistics.$ref || "";
                  var secureAthleteStatsUrl = athleteStatsUrl.replace('http:', 'https:');
                  const athleteStatResponse = await fetch(secureAthleteStatsUrl);
                  if(!athleteStatResponse.ok){
                    throw new Error('Error fetching player stats data');
                  }
                  const athleteStatData = await athleteStatResponse.json();
                  
                  return{
                    players: athleteData,
                    stats: athleteStatData
                  }
                });

                const player = await Promise.all(playerPromises);
                const playerArray = Object.values(player);
                playerArray.sort((a, b) => {
                  const statA = a?.stats?.splits?.categories[2]?.stats[11]?.value || Number.MIN_SAFE_INTEGER;
                  const statB = b?.stats?.splits?.categories[2]?.stats[11]?.value || Number.MIN_SAFE_INTEGER;
                  return statB - statA;
              });
                
                return{
                    teams: teamData,
                    stats: teamStats,
                    record: teamRecord,
                    athletes: playerArray
                };
            });
            const teamStats = await Promise.all(teamPromises);
            resolve(teamStats);
        }catch(error){
            reject(new Error('Promise Error NBA Teams'));
            console.error(error);
        }
    });
}

document.addEventListener('DOMContentLoaded', async function(){
    const teams = await Promise.all([getTeamStats()]);
    console.log(teams);
    try{
        const loadElement = document.getElementById("logoContainer");
        var step = (100/teams[0].length);
        for(let i=0; i<teams[0].length; i++){
            loadElement.innerHTML=`<div class="radial-progress" style="--value:${i*step}; --size:12rem; --thickness: 5px;" role="progressbar">${Math.floor((i*step))+'%'}</div>`;
            const obj = teams[0][i];
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

const teamsMachine = (obj) => {
    var teamCity = obj.teams.abbreviation;
    var teamName = obj.teams.name;
    var teamImg = obj.teams.logos[0].href;
    var record = obj.record.items[0].displayValue;
    var rank = obj.record.items[0].stats[10].value;
    const makeTeam = `
    <div class="collapse w-full">
    <input type="checkbox" name="my-accordion-1"/>
      <div class="collapse-title text-l font-medium flex flex-col justify-center">
          <div class="flex p-2 place-items-center align-center w-full">
              <div class="avatar pl-2">
                  <div class="w-14 rounded">
                  <img src="${teamImg}" />
                  </div>
              </div>
            <div class="flex flex-col px-2 text-left">
              <p class="text-primary text-sm">${teamCity} ${teamName}</p>
                <p class="text-sm">Rank: #${rank}</p>
                <p class="text-primary text-sm">${record}</p>
            </div>
              <div class="pr-4 avatar-group -space-x-5 rtl:space-x-reverse ml-auto">
                ${generateTeamPlayers(obj.athletes)}
              </div>
          </div>
          <div class="divider"></div> 
      </div>
      <div class="collapse-content text-center"> 
      </div>
  </div>`;

    return makeTeam;
}

const generateTeamPlayers = (players) => {
  var playerHtml = '';
  for (let i = 0; i <= 4; i++){
    const obj = players[i];
    if (typeof obj.players.headshot === 'undefined') {
      continue; // Skip this iteration and move to the next one
    }
    const makePlayer = `
    <div class="avatar">
    <div class="w-12">
      <img src="${obj.players.headshot.href}" />
    </div>
  </div>
        `;

      
    playerHtml += makePlayer;
  }
  return playerHtml;
}
function displayTeams(obj){
    let parentNode = document.getElementById('liveGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', teamsMachine(obj));
}

function fadeMain(){
    const mainElement = document.getElementById("liveGamesCardContainer");
    mainElement.classList.add("fadein");
}