import { ethers } from 'ethers';

// DB-only save of a match result. Returns the DB result (including lastInsertRowid).
export async function saveMatchResult(db, stats, winner, gameType) {
  const looser = winner === 'left' ? 'right' : 'left';
  const user_1 = dataToSave(stats, winner);
  const user_2 = dataToSave(stats, looser);

  // 1. First save to database (your existing logic)
  const stm = db.prepare(`INSERT INTO match_history (
    user_id_1,
    user_id_2,
    score_player_1,
    score_player_2,
    match_date,
    game_type,
    blockchain_tx
  ) VALUES (?,?,?,?,?,?,?)`);

  const dbResult = stm.run(
    user_1.id,
    user_2.id,
    user_1.score,
    user_2.score,
    getDate(),
    gameType,
    null, // blockchain_tx will be null initially
  );

  // Only save to blockchain for tournament matches
  if (gameType !== 'tournament') {
    return {
      dbResult,
      blockchainTx: null,
      blockchainStatus: 'skipped',
    };
  }

  // Return only the database result; blockchain is handled separately
  return { dbResult };
}

// Save a tournament match to the blockchain and optionally update the DB row with the tx hash.
// If dbRowId is provided, the corresponding match_history row will be updated.
export async function saveMatchToBlockchain(db, stats, winner, dbRowId) {
  const looser = winner === 'left' ? 'right' : 'left';
  const user_1 = dataToSave(stats, winner);
  const user_2 = dataToSave(stats, looser);

  try {
    // Get user nicknames with proper encoding
    const user1Nickname = await getUserNickname(db, user_1.id);
    const user2Nickname = await getUserNickname(db, user_2.id);

    const cleanNickname1 = sanitizeString(user1Nickname);
    const cleanNickname2 = sanitizeString(user2Nickname);

    console.log('Sending to blockchain:', {
      player1Nickname: cleanNickname1,
      player2Nickname: cleanNickname2,
      player1Score: user_1.score,
      player2Score: user_2.score,
    });

    const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

    console.log('Score debugging:', {
      user1Score: user_1.score,
      user1ScoreType: typeof user_1.score,
      user2Score: user_2.score,
      user2ScoreType: typeof user_2.score,
      user1ScoreParsed: parseInt(user_1.score, 10),
      user2ScoreParsed: parseInt(user_2.score, 10),
    });

    const contractABI = [
      'function recordMatch(string _player1Nickname, string _player2Nickname, uint8 _player1Score, uint8 _player2Score) external',
    ];
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      contractABI,
      wallet,
    );

    try {
      const gasEstimate = await contract.recordMatch.estimateGas(
        cleanNickname1,
        cleanNickname2,
        user_1.score,
        user_2.score,
      );
      console.log('Gas estimate:', gasEstimate.toString());
    } catch (gasError) {
      console.error('Gas estimation failed:', gasError);
    }

    const intScore1 = parseInt(user_1.score, 10);
    const intScore2 = parseInt(user_2.score, 10);
    if (!validateEncoding(cleanNickname1, cleanNickname2, intScore1, intScore2)) {
      throw new Error('Data encoding validation failed');
    }

    console.log('Nickname hex check:', {
      user1Hex: Buffer.from(cleanNickname1, 'utf8').toString('hex'),
      user2Hex: Buffer.from(cleanNickname2, 'utf8').toString('hex'),
    });

    const tx = await contract.recordMatch(
      cleanNickname1,
      cleanNickname2,
      Number(intScore1),
      Number(intScore2),
    );
    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.status === 1 ? 'success' : 'failed');

    if (dbRowId) {
      const updateStm = db.prepare(`
        UPDATE match_history 
        SET blockchain_tx = ? 
        WHERE id = ?
      `);
      updateStm.run(tx.hash, dbRowId);
    }

    return {
      blockchainTx: tx.hash,
      blockchainStatus: receipt.status === 1 ? 'success' : 'failed',
    };
  } catch (blockchainError) {
    console.error('Blockchain save failed:', blockchainError);
    return {
      blockchainTx: null,
      blockchainStatus: 'failed',
      blockchainError: blockchainError.message,
    };
  }
}

function sanitizeString(str) {
  return str
    .normalize('NFC') // normalize Unicode
    .replace(
      /[^\x20-\x7E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g,
      '',
    );
}

function validateEncoding(nickname1, nickname2, score1, score2) {
  try {
    // Test UTF-8 encoding
    const test1 = Buffer.from(nickname1, 'utf8').toString('utf8');
    const test2 = Buffer.from(nickname2, 'utf8').toString('utf8');

    if (test1 !== nickname1 || test2 !== nickname2) {
      throw new Error('UTF-8 encoding validation failed');
    }

    // Convert scores to integers and validate
    const intScore1 = parseInt(score1, 10);
    const intScore2 = parseInt(score2, 10);

    // Test score types and ranges
    if (isNaN(intScore1) || isNaN(intScore2)) {
      throw new Error('Scores must be valid numbers');
    }

    if (intScore1 < 0 || intScore1 > 255 || intScore2 < 0 || intScore2 > 255) {
      throw new Error('Scores must be between 0 and 255 (uint8)');
    }

    console.log('Encoding validation passed:', {
      nickname1: test1,
      nickname2: test2,
      score1: intScore1,
      score2: intScore2,
      originalScore1: score1,
      originalScore2: score2,
      score1Type: typeof score1,
      score2Type: typeof score2,
    });

    return true;
  } catch (error) {
    console.error('Encoding validation failed:', error);
    return false;
  }
}

// Helper function to get user nicknames with proper encoding
async function getUserNickname(db, userId) {
  const stm = db.prepare('SELECT username FROM users WHERE id = ?');
  const row = stm.get(userId);

  const username = row?.username || `user-${userId}`;

  // Ensure proper UTF-8 encoding
  return sanitizeString(username);
}

export async function getMatchResults(db, userId) {
  try {
    // Get match history for the user
    const matches = db
      .prepare(
        `
			SELECT 
				mh.*,
				u1.username as player1_username,
				u1.avatar as player1_avatar,
				u2.username as player2_username,
				u2.avatar as player2_avatar
			FROM match_history mh
			LEFT JOIN users u1 ON mh.user_id_1 = u1.id
			LEFT JOIN users u2 ON mh.user_id_2 = u2.id
			WHERE mh.user_id_1 = ? OR mh.user_id_2 = ?
			ORDER BY mh.match_date DESC
			LIMIT 50
		`,
      )
      .all(userId, userId);

    // Transform the data to match frontend expectations
    const transformedMatches = matches.map((match) => {
      const isPlayer1 = match.user_id_1 === userId;
      const opponent = isPlayer1
        ? {
          username: match.player2_username,
          avatar: match.player2_avatar,
        }
        : {
          username: match.player1_username,
          avatar: match.player1_avatar,
        };

      const playerScore = isPlayer1
        ? match.score_player_1
        : match.score_player_2;
      const opponentScore = isPlayer1
        ? match.score_player_2
        : match.score_player_1;

      // Determine winner
      let winner;
      if (playerScore > opponentScore) {
        winner = isPlayer1 ? match.player1_username : match.player2_username;
      } else if (opponentScore > playerScore) {
        winner = isPlayer1 ? match.player2_username : match.player1_username;
      } else {
        winner = 'Draw';
      }

      return {
        id: match.id,
        opponent: {
          username: opponent.username,
          avatar: opponent.avatar,
        },
        playerScore,
        opponentScore,
        score: `${playerScore} - ${opponentScore}`,
        winner,
        date: match.match_date,
        gameType: match.game_type,
        blockchainTx: match.blockchain_tx || null,
      };
    });

    return {
      success: true,
      matches: transformedMatches,
    };
  } catch (error) {
    console.error('Error fetching match results:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function getMatchStats(db, userId) {
  try {
    // Get match statistics
    const stats = db
      .prepare(
        `
			SELECT 
				COUNT(*) as totalMatches,
				SUM(CASE WHEN (user_id_1 = ? AND score_player_1 > score_player_2) OR 
							 (user_id_2 = ? AND score_player_2 > score_player_1) 
						 THEN 1 ELSE 0 END) as wins,
				SUM(CASE WHEN (user_id_1 = ? AND score_player_1 < score_player_2) OR 
							 (user_id_2 = ? AND score_player_2 < score_player_1) 
						 THEN 1 ELSE 0 END) as losses,
				SUM(CASE WHEN score_player_1 = score_player_2 THEN 1 ELSE 0 END) as draws
			FROM match_history 
			WHERE user_id_1 = ? OR user_id_2 = ?
		`,
      )
      .get(userId, userId, userId, userId, userId, userId);

    const winRate =
      stats.totalMatches > 0
        ? ((stats.wins / stats.totalMatches) * 100).toFixed(1)
        : 0;

    return {
      success: true,
      stats: {
        totalMatches: stats.totalMatches || 0,
        wins: stats.wins || 0,
        losses: stats.losses || 0,
        draws: stats.draws || 0,
        winRate: parseFloat(winRate),
      },
    };
  } catch (error) {
    console.error('Error fetching match stats:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

export function saveClosedMatch(db, looser, stats, gameType) {
  // Mark the loser (if structure supports it) and persist as a normal result
  try {
    const loserStats = stats?.get?.(looser);
    if (loserStats) loserStats.result = -1;
  } catch {
    // no-op if stats map doesn't have this shape
  }
  const winner = looser === 'left' ? 'right' : 'left';
  return saveMatchResult(db, stats, winner, gameType);
}

function dataToSave(stats, player) {
  return {
    id: stats.get(player).id,
    score: parseInt(stats.get(player).score, 10),
  };
}

function getDate() {
  // Return current date and time in ISO format (YYYY-MM-DD HH:MM:SS)
  const timestamp = new Date();
  return timestamp.toISOString().replace('T', ' ').substring(0, 19);
}
