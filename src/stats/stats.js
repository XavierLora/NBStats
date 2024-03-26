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
            teamData = await response.json();
        }catch(error){
            reject(new Error('Promise Error NBA Teams'))
        }
    });
}

document.addEventListener('DOMContentLoaded', async function(){
    const teams = await Promise.all([getTeamStats()]);
});