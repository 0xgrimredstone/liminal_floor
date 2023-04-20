// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/// @title LiminalFloor
/// @notice This contract handles the token management and experience logic for the Liminal Floor game
/// @notice Version 1.0.2
/// @author Raphaele Guillemot

contract LiminalFloor is ERC1155, Ownable, ERC1155Supply {
    string public baseURI; // baseURI where token metadata is stored
    uint256 public totalSupply; // Total number of tokens minted

    enum GameStatus {
        PENDING,
        STARTED,
        ENDED
    }

    /// @dev GameToken struct to store player token info
    struct GameToken {
        string name; /// @param name game card name; set by player
        uint256 id; /// @param id room model token id; will be randomly generated
    }

    /// @dev Player struct to store player info
    struct Player {
        address playerAddress; /// @param playerAddress player wallet address
        string playerName; /// @param playerName player name; set by player during registration
        bool inGame; /// @param inGame boolean to indicate if a player is in game
    }

    /// @dev Game struct to store game info
    struct Game {
        GameStatus GameStatus; /// @param GameStatus enum to indicate game status
        bytes32 codeHash; /// @param codeHash a hash of the game name
        string code; /// @param code room code; set randomly generated
        address[2] players; /// @param players address  representing player in this game
        uint8 level; /// @param level int8 representing the level of the game
        uint8[2] position; /// @param position uint array representing players' coordinates
        uint8[5][5] gameRotationMap; /// @param map the whole gameMap
        bool[2] moves; /// @param move whether players moved this round
        bool win;
    }

    mapping(address => uint256) public playerInfo; // Mapping of player addresses to player index in the players array
    mapping(address => uint256) public playerTokenInfo; // Mapping of player addresses to player token index in the gameTokens array
    mapping(string => uint256) public gameInfo; // Mapping of game name to game index in the games array

    Player[] public players; // Array of players
    GameToken[] public gameTokens; // Array of game tokens
    Game[] public games; // Array of games

    function isPlayer(address addr) public view returns (bool) {
        if (playerInfo[addr] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getPlayer(address addr) public view returns (Player memory) {
        require(isPlayer(addr), "Player doesn't exist!");
        return players[playerInfo[addr]];
    }

    function getAllPlayers() public view returns (Player[] memory) {
        return players;
    }

    function isPlayerToken(address addr) public view returns (bool) {
        if (playerTokenInfo[addr] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getPlayerToken(
        address addr
    ) public view returns (GameToken memory) {
        require(isPlayerToken(addr), "Game token doesn't exist!");
        return gameTokens[playerTokenInfo[addr]];
    }

    function getAllPlayerTokens() public view returns (GameToken[] memory) {
        return gameTokens;
    }

    // Game getter function
    function isGame(string memory _gameCode) public view returns (bool) {
        if (gameInfo[_gameCode] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getGame(
        string memory _gameCode
    ) public view returns (Game memory) {
        require(isGame(_gameCode), "Game doesn't exist!");
        return games[gameInfo[_gameCode]];
    }

    function getAllGames() public view returns (Game[] memory) {
        return games;
    }

    function updateGame(string memory _gameCode, Game memory _newGame) private {
        require(isGame(_gameCode), "Game doesn't exist");
        games[gameInfo[_gameCode]] = _newGame;
    }

    // Events
    event NewPlayer(address indexed owner, string name);
    event NewGame(
        string gameName,
        address indexed player1,
        address indexed player2
    );
    event RoundEnded();
    event GameEnded(string gameName, bool win);
    event GameMove(string indexed gameName);
    event NewGameToken(address indexed owner, uint256 id);

    /// @dev Initializes the contract by setting a `metadataURI` to the token collection
    /// @param _metadataURI baseURI where token metadata is stored
    constructor(string memory _metadataURI) ERC1155(_metadataURI) {
        baseURI = _metadataURI; // Set baseURI
        initialize();
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function initialize() private {
        gameTokens.push(GameToken("", 0));
        players.push(Player(address(0), "", false));
        games.push(
            Game(
                GameStatus.PENDING,
                bytes32(0),
                "",
                [address(0), address(0)],
                0,
                [0, 2],
                [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0]
                ],
                [false, false],
                false
            )
        );
    }

    /// @dev Registers a player
    /// @param _gameCode player name; set by player
    function registerPlayer(
        string memory _gameCode,
        string memory _gameTokenName
    ) external {
        require(!isPlayer(msg.sender), "Player already registered"); // Require that player is not already registered

        uint256 _id = players.length;
        players.push(Player(msg.sender, _gameCode, false)); // Adds player to players array
        playerInfo[msg.sender] = _id; // Creates player info mapping

        createRandomGameToken(_gameTokenName);

        emit NewPlayer(msg.sender, _gameCode); // Emits NewPlayer event
    }

    /// @dev internal function to create a new Game Card
    function _createGameToken(
        string memory _gameCode
    ) internal returns (GameToken memory) {
        // TODO: get data from map
        uint8 randId = 1;

        GameToken memory newGameToken = GameToken(
            _gameCode, // owner
            randId // id
        );

        uint256 _id = gameTokens.length;
        gameTokens.push(newGameToken);
        playerTokenInfo[msg.sender] = _id;

        _mint(msg.sender, randId, 1, "0x0");
        totalSupply++;

        emit NewGameToken(msg.sender, randId);
        return newGameToken;
    }

    /// @dev Creates a new game token
    /// @param _gameCode game token name; set by player
    function createRandomGameToken(string memory _gameCode) public {
        require(!getPlayer(msg.sender).inGame, "Player is in a game"); // Require that player is not already in a game
        require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered

        _createGameToken(_gameCode); // Creates game token
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    /// @dev Creates a new game
    /// @param _gameCode game name; set by player
    function createGame(
        string memory _gameCode,
        uint8 _level,
        uint8[2] memory _positon
    ) external returns (Game memory) {
        require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered
        require(!isGame(_gameCode), "Game already exists!"); // Require game with same name should not exist

        bytes32 gameHash = keccak256(abi.encode(_gameCode));

        Game memory _game = Game(
            GameStatus.PENDING, // Game pending
            gameHash, // Game hash
            _gameCode, // Game name
            [msg.sender, address(0)], // player addresses
            _level,
            _positon, // current coordinate
            [
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            [false, false], // move bool, default false
            false
        );

        uint256 _id = games.length;
        gameInfo[_gameCode] = _id;
        games.push(_game);

        return _game;
    }

    function startGame(string memory _gameCode) external returns (Game memory) {
        Game memory _game = getGame(_gameCode);
        require(
            _game.GameStatus == GameStatus.PENDING,
            "Game already started!!"
        ); // Require that game has not started
        require(!getPlayer(msg.sender).inGame, "Already in a game"); // Require that player is not already in a game

        _game.GameStatus = GameStatus.STARTED;

        players[playerInfo[_game.players[0]]].inGame = true;
        if (_game.players[1] != address(0)) {
            players[playerInfo[_game.players[1]]].inGame = true;
        }

        emit NewGame(_gameCode, _game.players[0], msg.sender); // Emits NewGame event
        updateGame(_gameCode, _game);
        return _game;
    }

    /// @dev Player joins game
    /// @param _gameCode game name; name of game player wants to join
    function joinGame(string memory _gameCode) external returns (Game memory) {
        Game memory _game = getGame(_gameCode);

        require(
            _game.GameStatus == GameStatus.PENDING,
            "Game already started!"
        ); // Require that game has not started
        require(
            _game.players[0] != msg.sender,
            "Only player two can join a game"
        ); // Require that player 2 is joining the game
        require(!getPlayer(msg.sender).inGame, "Already in game"); // Require that player is not already in a game

        _game.gameStatus = GameStatus.STARTED;
        _game.players[1] = msg.sender;
        updateGame(_gameCode, _game);

        players[playerInfo[_game.players[0]]].inGame = true;
        players[playerInfo[_game.players[1]]].inGame = true;

        emit NewGame(_game.name, _game.players[0], msg.sender); // Emits NewGame event
        return _game;
    }

    // Read game map
    function getCurrentCoord(
        string memory _gameCode
    ) public view returns (uint8[2] memory coord) {
        Game memory _game = getGame(_gameCode);
        return _game.position;
    }

    function _registerPlayer1Move(
        string memory _gameCode,
        uint8[2] memory _choice
    ) internal {
        // Game memory _game = getGame(_gameCode);
        games[gameInfo[_gameCode]].position = _choice;
        games[gameInfo[_gameCode]].moves[0] = true;
        // updateGame(_gameCode, _game);
    }

    function _registerPlayer2Move(
        string memory _gameCode,
        uint8[2] memory _choice,
        uint8 _toChange
    ) internal {
        // Game memory _game = getGame(_gameCode);
        games[gameInfo[_gameCode]].gameRotationMap[_choice[0]][
            _choice[1]
        ] = _toChange;
        games[gameInfo[_gameCode]].moves[1] = true;
        // updateGame(_gameCode, _game);
    }

    // User chooses attack or defense move for game card
    // _toChange (P1 : whether player wins (4,5), P2 : what to rotate to (0,1,2,3))
    function GameProgress(
        uint8[2] memory _choice,
        uint8 _toChange,
        string memory _gameCode
    ) external {
        Game memory _game = getGame(_gameCode);

        require(_game.GameStatus == GameStatus.STARTED, "Game not started."); // Require that game has started
        require(
            msg.sender == _game.players[0] || msg.sender == _game.players[1],
            "You are not in this game"
        ); // Require that player is in the game
        require(
            msg.sender == _game.players[0]
                ? _game.moves[0] == false
                : _game.moves[1] == false,
            "You have already made a move!"
        );

        if (msg.sender == _game.players[1]) {
            _registerPlayer2Move(_gameCode, _choice, _toChange);
            emit RoundEnded();
        } else {
            _registerPlayer1Move(_gameCode, _choice);
            emit GameMove(_gameCode);
            _game = getGame(_gameCode);
            _resolveGame(_game, _toChange);
        }
    }

    struct P {
        uint index;
        uint move;
        uint depth;
    }

    /// @dev Resolve game function to determine winner and loser of game
    /// @param _game game; game to resolve
    function _resolveGame(Game memory _game, uint8 end) internal {
        if (end >= 4) {
            // 4 - LOSE || 5 - WIN
            _endGame(end, _game);
        }
        // Reset moves to 0
        _game.moves = [false, false];
        updateGame(_game.code, _game);
        emit RoundEnded();
    }

    function quitGame(string memory _gameCode) public {
        Game memory _game = getGame(_gameCode);
        require(
            msg.sender == _game.players[0] || msg.sender == _game.players[1],
            "You are not in this game!"
        );

        _endGame(4, _game);
    }

    /// @dev internal function to end the game
    /// @param _type win/lose
    /// @param _game game; taken from attackOrDefend function
    function _endGame(
        uint8 _type,
        Game memory _game
    ) internal returns (Game memory) {
        require(_game.GameStatus != GameStatus.ENDED, "Game already ended"); // Require that game has not ended

        _game.GameStatus = GameStatus.ENDED;
        _game.win = _type == 4 ? false : true;
        updateGame(_game.code, _game);

        players[playerInfo[_game.players[0]]].inGame = false;
        players[playerInfo[_game.players[1]]].inGame = false;

        emit GameEnded(_game.code, _type == 4 ? false : true); // Emits GameEnded event

        return _game;
    }

    // Turns uint256 into string
    function uintToStr(
        uint256 _i
    ) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - (_i / 10) * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    // Token URI getter function
    function tokenURI(uint256 tokenId) public view returns (string memory) {
        return
            string(abi.encodePacked(baseURI, "/", uintToStr(tokenId), ".json"));
    }

    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
