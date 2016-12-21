number of players
number of fields
number of start money

function init(){
	openInitPrompt()
}
function submitInitPrompt(){
	createPlayers()
	createFields()
	getRandomTurn()
}
function throwDice(){
	freez()
	getThrowValue();
	movePlayer()
	promtOrInform()
}
function promtOrInform(){
	if(){
		prompt()	
	} else {
		inform()
	}
}
function finishTurn(){
	
	changeTurn()
}
function buyProperty(){
	
}
function changeTurn(){
	if(){
		simulateAI()
	} else {
		unfreez();
	}
}
function showThrow(){
	
}