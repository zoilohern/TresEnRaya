

var env = {};
env.getNumStates = function() { return 19683; }
env.getMaxNumActions = function() { return 9; }
env.allowedActions = function(s){
	var stringnum = (s).toString(3);
	var tam = 9 - stringnum.length;
	if (tam>0){
		 stringnum = ('000000000'.slice(-tam)) + stringnum + "";
	}
	
	var res = [];
	for (var i = 0; i<stringnum.length;i++){
		if (stringnum.charAt(i)==='0'){
			res.push(i); 
		}
	}
	return res;
}
var spec = {}
spec.update = 'qlearn'; // 'qlearn' or 'sarsa'
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.1; // value function learning rate
spec.lambda = 0; // eligibility trace decay, [0,1). 0 = no eligibility traces
spec.replacing_traces = true; // use replacing or accumulating traces
spec.planN = 50; // number of planning steps per iteration. 0 = no planning

spec.smooth_policy_update = true; // non-standard, updates policy smoothly to follow max_a Q
spec.beta = 0.1; // learning rate for smooth policy update
var agent = new RL.TDAgent(env,spec);
var agent2 = new RL.TDAgent(env,spec);

export class gameScene extends Phaser.Scene{
	constructor(){
		super({key: 'gameScene'})
	}

	init(data){
		this.data = data;

	}

	create(){
		this.graphics = this.add.graphics();

		this.board = [
		    ['_', '_', '_'],
		    ['_', '_', '_'],
		    ['_', '_', '_']
		];

		this.event = new Phaser.Events.EventEmitter();

		this.event.on('changeTurn', this.changeTurn, this);
		this.event.on('gameFinished', this.gameFinished, this);

		this.player = this.data.player;
		this.computer = this.data.player == 'x' ? 'o' : 'x';


		if(Math.floor(Math.random()*2)==0){
			this.turn = this.player;
		}else{
			this.turn = this.computer;
		}
		console.log("el turno inicial es de: " + this.turn)

		this.drawBoard();
		this.event.emit('changeTurn', this.turn);
	}

	changeTurn(turn){
		console.log( this.board);
		if(this.isFinished()){
			this.event.emit('gameFinished');

		}else{
			if(turn==this.computer){
				this.computerTurn();
			}else if (turn == this.player){
				this.playerTurn();
			}
		}
		//console.log('se termina changeturn  ' + this.turn);
	}

	computerTurn(){
		if (!this.isFinished()&& this.turn == this.computer){
			var action = agent.act(this.mejorMovimiento(this.board));
			console.log("La accion del agnte es: " + action);
			let move = this.pasarFilasCol(action);
			this.board[move.row][move.col] = this.computer;
			if(this.computer == 'x'){
				this.drawX(move.row,move.col);

			}else if(this.computer == 'o'){
				this.drawO(move.row,move.col);
			}
			this.turn = this.player;
			this.event.emit('changeTurn',this.player);
		}
	/*let game = this
	console.log(this.mejorMovimiento(this.board));
		game.input.on('pointerdown', function(pointer){
			
			if(!game.isFinished() && game.turn == game.computer){
				let move = game.determineCoordinate(pointer.x, pointer.y)
				if(game.board[move.row][move.col] == '_'){
					game.board[move.row][move.col] = game.computer
					if(game.computer == 'x'){
						game.drawX(move.row, move.col)
					}else if(game.computer == 'o'){
						game.drawO(move.row, move.col)
					}
					game.turn = game.player
					game.event.emit('changeTurn', game.player)
				}
			}
		})*/
	}

	pasarFilasCol(s){
		let res = {row: -1, col: -1};
		if(s<3){
			res.row = 0;
			res.col = s;
		}else if (s<6){
			res.row = 1;
			res.col = s-3
		}else{
			res.row = 2;
			res.col = s-6;
		}
		return res;
	}

	playerTurn(){
		if (!this.isFinished()&& this.turn == this.player){
			var action = agent2.act(this.mejorMovimiento(this.board));
			console.log("La accion del agente es: " + action);
			let move = this.pasarFilasCol(action);
			this.board[move.row][move.col] = this.player;
			if(this.player == 'x'){
				this.drawX(move.row,move.col);

			}else if(this.player == 'o'){
				this.drawO(move.row,move.col);
			}
			this.turn = this.computer;
			this.event.emit('changeTurn',this.computer);
		}/*
		let game = this
		game.input.on('pointerdown', function(pointer){
			if(!game.isFinished() && game.turn == game.player){
				let move = game.determineCoordinate(pointer.x, pointer.y)
				if(game.board[move.row][move.col] == '_'){
					game.board[move.row][move.col] = game.player
					if(game.player == 'x'){
						game.drawX(move.row, move.col)
					}else if(game.player == 'o'){
						game.drawO(move.row, move.col)
					}
					game.turn = game.computer
					game.event.emit('changeTurn', game.computer)
				}
			}
		})*/
		
	}

	mejorMovimiento(tabla){
		var res = "";
		for(let i = 0;  i < tabla.length; i++){
			for(let j = 0; j < tabla[i].length; j++){
				if(tabla[i][j] == '_'){
					//var num = (3*i) + j + 1 ;
					var num = 0;
						
				}else if (tabla[i][j]=='x'){
					var num = 1;
				}else if (tabla[i][j]=='o'){
					var num = 2;
				}
				res += num; 	
			}
		}
		res = parseInt((res),3);
		return res;
	}
	
	showEndScene(){
		let message = ''
		if(this.gameStatus == 1){
			message = 'YOU WIN!'
		}else if(this.gameStatus == -1){
			message = 'YOU LOSE!'
		}else{
			message = 'TIE!'
		}
		this.scene.restart();
	}

	gameFinished(){
		let winner = this.checkWinner()
		if(winner == this.player){
			this.gameStatus = 1
		}else if(winner == this.computer){
			this.gameStatus = -1
		}else{
			this.gameStatus = 0
		}
		var rew = this.gameStatus*5;
		console.log("El premio para el jugador es: " + -rew)
		agent.learn(-rew*5);
		agent2.learn(rew);
		this.time.delayedCall(1500, this.showEndScene, [], this)
	}

	isFinished(){
		// Horizontal
		for(let row = 0; row < 3; row++){
			if(this.board[row][0] == this.board[row][1] && this.board[row][1] == this.board[row][2]){
				if(this.board[row][0] == 'x')
					return true
				else if(this.board[row][0] == 'o')
					return true
			}
		}

		// Vertical
		for(let col = 0; col < 3; col++){
			if(this.board[0][col] == this.board[1][col] && this.board[1][col] == this.board[2][col]){
				if(this.board[0][col] == 'x')
					return true
				else if(this.board[0][col] == 'o')
					return true
			}
		}

		// Diagonal
		if(this.board[0][0] == this.board[1][1] && this.board[1][1] == this.board[2][2]){
			if(this.board[0][0] == 'x')
				return true
			else if(this.board[0][0] == 'o')
				return true
		}

		if(this.board[2][0] == this.board[1][1] && this.board[1][1] == this.board[0][2]){
			if(this.board[1][1] == 'x')
				return true
			else if(this.board[1][1] == 'o')
				return true
		}

		// Fin?
		return this.noMoveLeft(this.board)
	}

	

	checkWinner(){

		// Horizontally check
		for(let row = 0; row < 3; row++){
			if(this.board[row][0] == this.board[row][1] && this.board[row][1] == this.board[row][2]){
				if(this.board[row][0] == 'x')
					return 'x'
				else if(this.board[row][0] == 'o')
					return 'o'
			}
		}

		// Vertically check
		for(let col = 0; col < 3; col++){
			if(this.board[0][col] == this.board[1][col] && this.board[1][col] == this.board[2][col]){
				if(this.board[0][col] == 'x')
					return 'x'
				else if(this.board[0][col] == 'o')
					return 'o'
			}
		}

		// Diagonally check
		if(this.board[0][0] == this.board[1][1] && this.board[1][1] == this.board[2][2]){
			if(this.board[1][1] == 'x')
				return 'x' 
			else if(this.board[1][1] == 'o')
				return 'o'
		}

		if(this.board[2][0] == this.board[1][1] && this.board[1][1] == this.board[0][2]){
			if(this.board[1][1] == 'x')
				return 'x' 
			else if(this.board[1][1] == 'o')
				return 'o'
		}
		return ''
	}

	determineCoordinate(x, y){
		let i = Math.floor((y - 15)/195)
		let j = Math.floor((x - 15)/195)

		return {row: i, col: j}
	}
	
	noMoveLeft(board){
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++){
				if(board[i][j] == '_') 
					return false
			}
		}
		return true
	}

	drawBoard(){
		this.graphics.lineStyle(3, 0xffffff, 1)
		this.graphics.beginPath()

		for(let i = 1; i < 3; i++){
			this.graphics.moveTo(15, i * 195 )
			this.graphics.lineTo(585, i * 195)

		}
		for(let j = 1; j < 3; j++){
			this.graphics.moveTo(j * 195, 15)
			this.graphics.lineTo(j * 195, 585)
		}
		this.graphics.closePath()
		this.graphics.strokePath()
	}

	drawX(i , j){
		this.graphics.lineStyle(5, 0xd50102, 1)
		this.graphics.beginPath()
		
		// Draw X
		this.graphics.moveTo(15 + j * 195, 15 + i * 195)
		this.graphics.lineTo((j + 1) * 195 - 15, (i + 1) * 195 - 15)
		this.graphics.moveTo((j + 1) * 195 - 15, 15 + i * 195)
		this.graphics.lineTo(15 + j * 195, (i + 1) * 195 - 15)
		this.graphics.closePath()
		this.graphics.strokePath()

	}

	drawO(i, j){
		this.graphics.lineStyle(5, 0xa6b401, 1)
		this.graphics.beginPath()

		const radius = 85
		
		// Draw O
		let centerX = (j * 195 + ( j + 1 ) * 195 ) / 2
		let centerY = (i * 195 + ( i + 1 ) * 195 ) / 2
		this.graphics.closePath()
		this.graphics.strokeCircle(centerX, centerY, radius)
	}


}
