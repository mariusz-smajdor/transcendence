export function saveMatchResult(db, stats, winner, gameType)
{
	const looser = winner === "left" ? "right" : "left"
	const user_1 = dataToSave(stats, winner);
	const user_2 = dataToSave(stats, looser);
	const stm = db.prepare(`INSERT INTO match_history (
		user_id_1,
		user_id_2,
		score_player_1,
		score_player_2,
		match_date,
		game_type
	) VALUES (?,?,?,?,?,?)`);
	const result = stm.run(
		user_1.id,
		user_2.id,
		user_1.score,
		user_2.score,
		getDate(),
		gameType
	);
}
//return timestamp in right format
function getDate(){
	const timestamp = new Date(Date.now());
	return(`${timestamp.getFullYear()}-
	${formatDate(timestamp.getMonth() + 1)}-
	${formatDate(timestamp.getDate())}`)
}

//returns day/month in right format(1 => 01)
function formatDate(number){
	return(number < 10 ? `0${number}` : `${number}`);
}

//to do: if one of the players is not registered
function dataToSave(stats, player){
	return{id: stats.get(player).id, score: stats.get(player).score}
}
