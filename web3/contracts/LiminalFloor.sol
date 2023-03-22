// SPDX-License-Identifier: MIT

pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/// @title LiminalFloor
/// @notice This contract handles the token management and experience logic for the Liminal Floor game. uses AvaxGods as base
/// @notice Version 1.0.0
/// @author Raphaele Guillemot
/// @author Julian Martinez
/// @author Gabriel Cardona
/// @author Raj Ranjan

contract LiminalFloor is ERC1155, Ownable, ERC1155Supply {
    string public baseURI; // baseURI where token metadata is stored
    uint256 public totalSupply; // Total number of tokens minted
    uint256 public constant DEVIL = 0;
    uint256 public constant GRIFFIN = 1;
    uint256 public constant FIREBIRD = 2;
    uint256 public constant KAMO = 3;
    uint256 public constant KUKULKAN = 4;
    uint256 public constant CELESTION = 5;

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
        address player; /// @param players address  representing player in this game
        uint8[2] currentCoord; /// @param currentCoord uint array representing players' coordinates
        uint8 depth; /// @param depth how far in the player is in the game
        uint8[5][5] gameMap; /// @param map the whole gameMap
        bool win; /// @param win whether player won
        bool move; /// @param move whether player moved this round
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
    function isGame(string memory _code) public view returns (bool) {
        if (gameInfo[_code] == 0) {
            return false;
        } else {
            return true;
        }
    }

    function getGame(string memory _code) public view returns (Game memory) {
        require(isGame(_code), "Game doesn't exist!");
        return games[gameInfo[_code]];
    }

    function getAllGames() public view returns (Game[] memory) {
        return games;
    }

    function updateGame(string memory _code, Game memory _newGame) private {
        require(isGame(_code), "Game doesn't exist");
        games[gameInfo[_code]] = _newGame;
    }

    // Events
    event NewPlayer(address indexed owner, string name);
    event NewGame(string gameName, address indexed player);
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
                address(0),
                [0, 1],
                uint8(0),
                [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0]
                ],
                false,
                false
            )
        );
    }

    /// @dev Registers a player
    /// @param _name player name; set by player
    function registerPlayer(
        string memory _name,
        string memory _gameTokenName
    ) external {
        require(!isPlayer(msg.sender), "Player already registered"); // Require that player is not already registered

        uint256 _id = players.length;
        players.push(Player(msg.sender, _name, false)); // Adds player to players array
        playerInfo[msg.sender] = _id; // Creates player info mapping

        createRandomGameToken(_gameTokenName);

        emit NewPlayer(msg.sender, _name); // Emits NewPlayer event
    }

    /// @dev internal function to create a new Game Card
    function _createGameToken(
        string memory _name
    ) internal returns (GameToken memory) {
        // TODO: get data from map
        uint8 randId = 1;

        GameToken memory newGameToken = GameToken(
            _name, // owner
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
    /// @param _code game token name; set by player
    function createRandomGameToken(string memory _code) public {
        require(!getPlayer(msg.sender).inGame, "Player is in a game"); // Require that player is not already in a game
        require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered

        _createGameToken(_code); // Creates game token
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    /// @dev Creates a new game
    /// @param _code game name; set by player
    function createGame(string memory _code) external returns (Game memory) {
        require(isPlayer(msg.sender), "Please Register Player First"); // Require that the player is registered
        require(!isGame(_code), "Game already exists!"); // Require game with same name should not exist

        bytes32 gameHash = keccak256(abi.encode(_code));

        Game memory _game = Game(
            GameStatus.PENDING, // Game pending
            gameHash, // Game hash
            _code, // Game name
            msg.sender, // player addresses
            [0, 1], // current coordinate
            0, // depth count
            [
                [1, 1, 1, 0, 0],
                [1, 1, 1, 0, 0],
                [2, 0, 3, 0, 0],
                [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0]
            ],
            false, // win bool, default false
            false // move bool, default false
        );

        uint256 _id = games.length;
        gameInfo[_code] = _id;
        games.push(_game);

        return _game;
    }

    function startGame(string memory _code) external returns (Game memory) {
        Game memory _game = getGame(_code);
        require(
            _game.GameStatus == GameStatus.PENDING,
            "Game already started!!"
        ); // Require that game has not started
        require(!getPlayer(msg.sender).inGame, "Already in a game"); // Require that player is not already in a game

        _game.GameStatus = GameStatus.STARTED;

        players[playerInfo[_game.player]].inGame = true;

        emit NewGame(_code, msg.sender); // Emits NewGame event
        updateGame(_code, _game);
        return _game;
    }

    // Read game map
    function checkInBound(
        string memory _gameName,
        int8[2] memory _toCheck
    ) public view returns (bool) {
        Game memory _game = getGame(_gameName);

        uint8[5][5] memory map = _game.gameMap;
        uint8[2] memory coord = _game.currentCoord;

        if (5 > uint8(int8(coord[0]) + _toCheck[0])) {
            if (5 > uint8(int8(coord[1]) + _toCheck[1])) {
                if (
                    map[uint8(int8(coord[0]) + _toCheck[0])][
                        uint8(int8(coord[1]) + _toCheck[1])
                    ] != 0
                ) return true;
            }
        } else return false;
    }

    // Read game map
    function getCurrentCoord(
        string memory _gameName
    ) public view returns (uint8[2] memory coord) {
        Game memory _game = getGame(_gameName);
        return _game.currentCoord;
    }

    function _registerPlayerMove(
        uint8 _choice,
        string memory _gameName
    ) internal {
        int8[2] memory choiceCoord = _choice == 1
            ? [int8(1), int8(0)]
            : _choice == 2
            ? [int8(0), int8(1)]
            : [int8(0), int8(-1)];
        require(
            _choice == 1 || _choice == 2 || _choice == 3,
            "Choice should be either 1 or 2 or 3!"
        );
        require(
            checkInBound(_gameName, choiceCoord),
            "Tile out of bounds or unavailable!"
        );
        uint8[2] memory c = games[gameInfo[_gameName]].currentCoord;
        games[gameInfo[_gameName]].currentCoord = [
            uint8(int8(c[0]) + choiceCoord[0]),
            uint8(int8(c[1]) + choiceCoord[1])
        ];
        games[gameInfo[_gameName]].depth++;
        games[gameInfo[_gameName]].move = true;
    }

    // User chooses attack or defense move for game card
    function GameProgress(uint8 _choice, string memory _gameName) external {
        Game memory _game = getGame(_gameName);

        require(_game.GameStatus == GameStatus.STARTED, "Game not started."); // Require that game has started
        require(_game.GameStatus != GameStatus.ENDED, "Game has already ended"); // Require that game has not ended
        require(msg.sender == _game.player, "You are not in this game"); // Require that player is in the game
        require(_game.move == false, "You have already made a move!");

        _registerPlayerMove(_choice, _gameName);
        _game = getGame(_gameName);
        emit GameMove(_gameName);
        _resolveGame(_game);
    }

    struct P {
        uint index;
        uint move;
        uint depth;
    }

    /// @dev Resolve game function to determine winner and loser of game
    /// @param _game game; game to resolve
    function _resolveGame(Game memory _game) internal {
        uint8 loc = _game.gameMap[_game.currentCoord[0]][_game.currentCoord[1]];
        if (loc == 2 || loc == 3) {
            // LOSE || WIN
            _endGame(loc, _game);
        }

        emit RoundEnded();

        // Reset moves to 0
        _game.move = false;
        updateGame(_game.code, _game);
    }

    function quitGame(string memory _gameName) public {
        Game memory _game = getGame(_gameName);
        require(_game.player == msg.sender, "You are not in this game!");

        _endGame(2, _game);
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
        _game.win = _type == 3 ? true : false;
        updateGame(_game.code, _game);

        players[playerInfo[_game.player]].inGame = false;

        emit GameEnded(_game.code, _type == 3 ? true : false); // Emits GameEnded event

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
