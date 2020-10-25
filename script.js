

function pageContent(team){
    fetch('http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard')
        .then(response => {
            if(!response.ok){
                throw new Error (`Error: ${response.status}`);
            }
        return response.json()
        })
        .then(data => {
            console.log(data);
            console.log(data.events);
            const week = data.week.number;
            $('#game-info').html(`<li>Week ${week} Games</li>`)
            for(let i = 0; i < data.events.length; i++){
            const game = data.events[i];
            const homeTeamScore = `${game.competitions[0].competitors[0].team.abbreviation} ${game.competitions[0].competitors[0].score}`
            const awayTeamScore = `${game.competitions[0].competitors[1].team.abbreviation} ${game.competitions[0].competitors[1].score}`
            let gameWeather = ''
            if(game.weather){
                gameWeather = `Temperature: ${game.weather['temperature']}&#8457;<br>Conditions: ${game.weather['displayValue']}<br>`
            }
            $('#game-info').append(`<li>${game.shortName}<br>${game.status.type.detail}<br>Channel: ${game.competitions[0].broadcasts[0].names[0]}<br>${gameWeather}${awayTeamScore}/${homeTeamScore}</li>`)
            }
        });
    fetch(`https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${team}`)
        .then(response => {
            if(!response.ok){
                throw new Error (`Error: ${response.status}`);
            }
        return response.json()
        })
        .then(data => {
            const teamInfo = data.teams[0];
            const teamID = teamInfo.idTeam
            $('#team-links').html(`<ul><li><a href="https://${teamInfo.strWebsite}" target="_blank"><img src="${teamInfo.strTeamBadge}" alt="${teamInfo.strTeam} Logo"></a></li><li><a href="https://${teamInfo.strFacebook}" target="_blank"><img src="facebook-logo.png"></a></li><li><a href="https://${teamInfo.strTwitter}" target="_blank"><img src="twitter-logo.png"></a></li><li><a href="https://${teamInfo.strInstagram}" target="_blank"><img src="instagram-logo.png"></a></li></ul><p></p>`)
    fetch(`https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${teamID}`)
        .then(response => {
            if(!response.ok){
                throw new Error (`Error: ${response.status}`)
                }
        return response.json()
        })
        .then(data => {
            $('#event-info').html('<li>Next Five Games</li>');
            for(let i = 0; i < data.events.length; i++){
            let event = data.events[i];
            let eventDate = data.events[i].dateEvent.split('-')
            let correctedDate = `${eventDate[1]}/${eventDate[2]}/${eventDate[0]}`
            $('#event-info').append(`<li>${correctedDate} ${event.strEventAlternate}</li>`)
            }
        })
        $('#team-links').removeClass('hidden')
        $('section').removeClass('hidden')
    })
    .catch(error => {
        $('#team-links').html(`<p>Something went wrong. Error: ${error}</p>`);
        $('#team-links').removeClass('hidden');
    })
}

function submitForm(){
    $('form').submit(e =>{
        e.preventDefault();
        selectedTeam = $('select').val();
        console.log(selectedTeam);
        pageContent(selectedTeam);
    })
}

$(submitForm());

