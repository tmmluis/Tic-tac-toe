$( document ).ready(function() {

  var playerMark = "";
  var computerMark = "";
  var computerFirst = false;
  var gameBoard = new Board();

  $("button").on("click", function() {
    var mark = $(this).data("mark");
    if (mark === "X") {
      playerMark = '<p class="blue">X</p>';
      computerMark = '<p class="red">O</p>';
    } else {
      playerMark = '<p class="red">O</p>';
      computerMark = '<p class="blue">X</p>';
      computerFirst = true;
      computerTurn(gameBoard);
    }
    $(".splash").fadeOut();
  });

  $("td").on("click", function() {
    var cell =  $(this).data("cell");
    var winner = "";

    if (gameBoard.play(cell, true)) {
      $(this).html(playerMark);
      winner = gameBoard.isGameOver();
      if (winner) {
        displayWinner(winner);
        window.setTimeout(resetBoard, 2000, winner);
      } else {
        computerTurn(gameBoard);
        winner = gameBoard.isGameOver();
        if (winner) {
          displayWinner(winner);
          window.setTimeout(resetBoard, 2000);
        }
      }
    }
  });

  function displayWinner(winner) {
    switch(winner) {
      case 'player':
        $('.score').text('You WIN!!');
        break;
      case 'computer':
        $('.score').text('Ouch! You lost miserably.');
        break;
      case 'draw':
        $('.score').text("Duh! It's a draw...");
        break;
    }
  }

  function resetBoard() {
    gameBoard.reset();
    for (var cellNum = 0; cellNum < 9; cellNum++) {
      $("." + cellNum).html("");
    }
    $('.score').text("");
    if (computerFirst) {
      computerTurn(gameBoard);
    }
  }

  function computerTurn(board) {
    // CPU turn. Get the index of next play.
    var computerPlay = perfectComputer(board);
    // Update the board with the play.
    gameBoard.play(computerPlay, false);
    // Update the HTML with the play.
    $("." + computerPlay).html(computerMark);
  }

  // Perfect CPU player. Returns the Array index of the best play.
  function perfectComputer(board) {
    var boardState = board.getState();
    // First move is hard coded. After that we use minimax algorithm.
    // If cpu goes first then pick a random corner.
    if (board.getPlayerMoves() + board.getComputerMoves() === 0) {
      var possible = [0, 2, 6, 8];
      return possible[Math.floor(Math.random() * 4)];
    } else if (board.getComputerMoves() === 0) {
      // If cpu goes second pick center spot if free.
      if (boardState[4] === '') {
        return 4;
      } else { // Or respond to center play with a random corner.
        var possible = [0, 2, 6, 8];
        return possible[Math.floor(Math.random() * 4)];
      }
    } else {
      return minimax(board, -100, 100, true)[1];
    }
  }

  // Minimax algorithm with Alpha-beta pruning.
  function minimax(gameNode, alpha, beta, maximizingPlayer) {
    var winner = gameNode.isGameOver();

    // Checking if it is a terminal node.
    if (winner) {
      switch (winner) {
        case 'player':
          return [-10, -1];
        case 'computer':
          return  [10, -1];
        case 'draw':
          return [0, -1];
      }
    } else {  // Maximizing player = computer.
      if (maximizingPlayer) {
        var bestValue = -100;
        var bestMove = -1;
        var nodeState = gameNode.getState();
        for (var i = 0; i < nodeState.length; i++) {
          if (nodeState[i] === '') {
            var newState = nodeState.slice();
            newState[i] = 'O';
            var value = minimax(new Board(newState), alpha, beta, false)[0];
            var temp = bestValue;
            bestValue = Math.max(bestValue, value);
            // If bestValue was updated keep the move.
            if (temp != bestValue) {
              bestMove = i;
            }
            alpha = Math.max(alpha, bestValue);
            if (beta <= alpha) {
              break;
            }
          }
        }
        return [bestValue, bestMove];
      } else { // Minimizing player = human.
        var bestValue = 100;
        var bestMove = -1;
        var nodeState = gameNode.getState();
        for (var i = 0; i < nodeState.length; i++) {
          if (nodeState[i] === '') {
            var newState = nodeState.slice();
            newState[i] = 'X';
            var value = minimax(new Board(newState), alpha, beta, true)[0];
            var temp = bestValue;
            bestValue = Math.min(bestValue, value);
            // If bestValue was updated keep the move.
            if (temp != bestValue) {
              bestMove = i;
            }
            beta = Math.min(beta, bestValue);
            if (beta <= alpha) {
              break;
            }
          }
        }
        return [bestValue, bestMove];
      }
    }
}

  // Random computer player. NOt in use.
  function pickRandom(board) {
    var possible = [];
    var boardState = board.getState();

    for (var i = 0; i < boardState.length; i++) {
      if (boardState[i] === "") {
        possible.push(i);
      }
    }
    return possible[Math.floor(Math.random() * (possible.length))];
  }
});

// Definition of the 'Board' class.
var Board = function(init) {

  // The board is just gonna be represented by an Array with length = 8.
  var state = init || ["", "", "", "", "", "", "", "", ""];
  var playerMoves = 0;
  var computerMoves = 0;
  var playerMark = 'X';
  var computerMark = 'O';

  if (init) {
    for (var i = 0; i < init.length; i++) {
      if (init[i] === playerMark) {
        playerMoves++;
      } else if (init[i] === computerMark) {
        computerMoves++;
      }
    }
  }

  this.getComputerMoves = function() {
    return computerMoves;
  };

  this.getPlayerMoves = function() {
    return playerMoves;
  };

  this.getState = function() {
    return state;
  };

  // Returns true or false depending if the move is allowed.
  this.play = function(cell, isPlayer) {
    if (state[cell] === "") {
      // On the backend the player is always represented by 'X' and cpu by 'O'.
      if (isPlayer) {
        state[cell] = playerMark;
        playerMoves++;
        return true;
      } else {
        state[cell] = computerMark;
        computerMoves++;
        return true;
      }
    } else {
      return false;
    }
  };

  // Returns false or the winner ('player' or 'computer'), if any, or 'draw'.
  this.isGameOver = function() {
    if (playerMoves < 3 && computerMoves < 3) {
      return false;
    } else {
      // Checking rows
      for (var i = 0; i < 7; i += 3) {
        if (state[i] === '') {
          continue;
        } else if (state[i] === state[i + 1] && state[i] === state[i + 2]) {
          if (state[i] === 'X') {
            return 'player';
          } else {
            return 'computer';
          }
        }
      }
      // Checking columns
      for (i = 0; i < 3; i++) {
        if (state[i] === '') {
          continue;
        } else if (state[i] === state[i + 3] && state[i] === state[i + 6]) {
          if (state[i] === 'X') {
            return 'player';
          } else {
            return 'computer';
          }
        }
      }
      // Checking diagonals
      if (state[0] != '' && state[0] === state[4] && state[0] === state[8]) {
        if (state[0] === 'X') {
          return 'player';
        } else {
          return 'computer';
        }
      } else if (state[2] != '' && state[2] === state[4] && state[2] === state[6]) {
        if (state[2] === 'X') {
          return 'player';
        } else {
          return 'computer';
        }
      }
    }
    // If the function did not exit by now it means it's either a draw or
    // game is not over.
    if (playerMoves + computerMoves === 9) {
      return 'draw';
    } else {
      return false;
    }
  };

  this.reset = function() {
    state = ["", "", "", "", "", "", "", "", ""];
    playerMoves = 0;
    computerMoves = 0;
  }
}
