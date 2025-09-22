import { ethers } from 'ethers';

export async function saveMatchResult(db, stats, winner, gameType) {
	const looser = winner === "left" ? "right" : "left";
	const user_1 = dataToSave(stats, winner);
	const user_2 = dataToSave(stats, looser);

	// 1. First save to database (your existing logic)
	const stm = db.prepare(`INSERT INTO match_history (
    user_id_1,
    user_id_2,
    score_player_1,
    score_player_2,
    match_date,
    game_type
  ) VALUES (?,?,?,?,?,?)`);

	const dbResult = stm.run(
		user_1.id,
		user_2.id,
		user_1.score,
		user_2.score,
		getDate(),
		gameType
	);

	// 2. Then save to blockchain
	try {
		// Setup Ethereum connection
		const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
		const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

		// Contract ABI (simplified version matching your Solidity contract)
		const contractABI = [
			"function recordMatch(string memory _player1Nickname, string memory _player2Nickname, uint8 _player1Score, uint8 _player2Score) external"
		];

		const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);

		// Get user nicknames from your database (you'll need to implement this)
		const user1Nickname = await getUserNickname(db, user_1.id);
		const user2Nickname = await getUserNickname(db, user_2.id);

		// Send transaction
		const tx = await contract.recordMatch(
			user1Nickname,
			user2Nickname,
			user_1.score,
			user_2.score
		);

		// Wait for confirmation (optional)
		const receipt = await tx.wait();

		return {
			dbResult,
			blockchainTx: tx.hash,
			blockchainStatus: receipt.status === 1 ? 'success' : 'failed'
		};
	} catch (blockchainError) {
		console.error('Blockchain save failed:', blockchainError);
		// Return database result even if blockchain save fails
		return { dbResult, blockchainError: blockchainError.message };
	}
}

// Helper function to get user nicknames (you'll need to implement based on your DB schema)
async function getUserNickname(db, userId) {
	const stm = db.prepare('SELECT username FROM users WHERE id = ?');
	const row = stm.get(userId);
	return row?.username || `user-${userId}`;
}

export function saveClosedMatch(db, looser, stats, gameType) {
	game.playerManager.stats.get(looser).result = -1;
	const winner = looser === "left" ? "right" : "left";
	saveMatchResult(db, stats, winner, gameType);
}
//return timestamp in right format
function getDate() {
	const timestamp = new Date(Date.now());
	return (`${timestamp.getFullYear()}-
	${formatDate(timestamp.getMonth() + 1)}-
	${formatDate(timestamp.getDate())}`)
}

//returns day/month in right format(1 => 01)
function formatDate(number) {
	return (number < 10 ? `0${number}` : `${number}`);
}

function dataToSave(stats, player) {
	return { id: stats.get(player).id, score: stats.get(player).score }
}
