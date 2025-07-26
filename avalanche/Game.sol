// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MatchHistory {
    // Struct to store match data
    struct Match {
        string player1Nickname;
        string player2Nickname;
        uint8 player1Score;
        uint8 player2Score;
        uint256 timestamp;
    }

    // Array to store all matches
    Match[] public matches;

    // Mapping from nickname to match IDs (for quick lookup)
    mapping(string => uint256[]) public nicknameToMatchIds;

    // Event emitted when a new match is recorded
    event MatchRecorded(
        string player1Nickname,
        string player2Nickname,
        uint8 player1Score,
        uint8 player2Score,
        uint256 timestamp
    );

    // Record a new match
    function recordMatch(
        string memory _player1Nickname,
        string memory _player2Nickname,
        uint8 _player1Score,
        uint8 _player2Score
    ) external {
        // Create the match
        Match memory newMatch = Match({
            player1Nickname: _player1Nickname,
            player2Nickname: _player2Nickname,
            player1Score: _player1Score,
            player2Score: _player2Score,
            timestamp: block.timestamp
        });

        // Store the match
        matches.push(newMatch);
        uint256 matchId = matches.length - 1;

        // Update the nickname mappings for quick lookup
        nicknameToMatchIds[_player1Nickname].push(matchId);
        nicknameToMatchIds[_player2Nickname].push(matchId);

        // Emit event
        emit MatchRecorded(
            _player1Nickname,
            _player2Nickname,
            _player1Score,
            _player2Score,
            block.timestamp
        );
    }

    // Get all match IDs for a nickname
    function getMatchIdsByNickname(string memory _nickname) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return nicknameToMatchIds[_nickname];
    }

    // Get total number of matches
    function getTotalMatches() external view returns (uint256) {
        return matches.length;
    }
}