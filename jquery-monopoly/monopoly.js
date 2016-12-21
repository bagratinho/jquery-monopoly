var spile = {
	field_count: 0,
	dice: 6,
	dice_count: 2,
	start_benefit: 10,
	fieldw: 0,
	fields: [
		{
			name: "start",
			is_ownable: false
		}
	],
	turn: 0,
	players: []
}

function start(p,f,c){
	createPlayers(p,c);
	createFields(f);
	drawFields();
	drawPlayers();
	message("Game started.");
	getRandomTurn(p);
}

function createPlayers(p,c){
	for(var i=0; i<p; i++){
		var name = (i==0) ? "player" : "bot"+i;
		spile.players.push({
			name: name,
			id: i+1,
			color: "#"+Math.random().toString(16).slice(2, 8).toUpperCase(),
			position: 0,
			capital: parseInt(c)
		})
	}	
}

function createFields(f){
	for (var i=1; i<f; i++) {
		spile.fields.push({
			name: String(i),
			is_ownable: true,
			price: 30,
			rent: 15
		})
	}
}

function drawFields(){
	var rows = spile.fields.length/4+1;
	spile.fieldw = 1/rows;
	var field_wh = 100/rows;
	for (var i=0; i<rows; i++) {
		for (var j=0; j<rows;j++) {
			$("#spile").append("<div class='field' style='width:"+field_wh+"%;height:"+field_wh+"%'></div>")
		}
	}
	for (var i=0; i<rows; i++) {
		var f_id1 = "f"+i;
		var f_id2 = "f"+(i+rows-1);
		var f_id3 = "f"+(i+2*(rows-1));
		var f_id4 = "f"+(i+3*(rows-1));
		$("#spile").find("div").eq(i).attr("id",f_id1)
		$("#spile").find("div").eq(i).addClass("act")
		$("#spile").find("div").eq(i).html("<p>Property: "+spile.fields[i].name+"<br/>Price: "+spile.fields[i].price+"<br/>Rent: "+spile.fields[i].rent+"</div>")
		$("#spile").find("div").eq(((i+1)*rows)-1).attr("id",f_id2)	
		$("#spile").find("div").eq(((i+1)*rows)-1).addClass("act")
		$("#spile").find("div").eq(((i+1)*rows)-1).html("<p>Property: "+spile.fields[i+rows-1].name+"<br/>Price: "+spile.fields[i+rows-1].price+"<br/>Rent: "+spile.fields[i+rows-1].rent+"</p>")
		$("#spile").find("div").eq((rows*rows)-i-1).attr("id",f_id3)	
		$("#spile").find("div").eq((rows*rows)-i-1).addClass("act")
		$("#spile").find("div").eq((rows*rows)-i-1).html("<p>Property: "+spile.fields[i+2*(rows-1)].name+"<br/>Price: "+spile.fields[i+2*(rows-1)].price+"<br/>Rent: "+spile.fields[i+2*(rows-1)].rent+"</p>")	
		if(i!=rows-1){
			$("#spile").find("div").eq(rows*(rows-i-1)).attr("id",f_id4)	
			$("#spile").find("div").eq(rows*(rows-i-1)).addClass("act")
			$("#spile").find("div").eq(rows*(rows-i-1)).html("<p>Property: "+spile.fields[i+3*(rows-1)].name+"<br/>Price: "+spile.fields[i+3*(rows-1)].price+"<br/>Rent: "+spile.fields[i+3*(rows-1)].rent+"</p>")
		}
	}		
}

function drawPlayers(){
	for(var i=0; i<spile.players.length; i++){
		$("#spile").append("<div class='player' id='p"+i+"'>"+spile.players[i].name+"</div>");
		var posL = Math.random()*parseInt($("#spile").css("width"))*spile.fieldw;
		var posT = Math.random()*parseInt($("#spile").css("height"))*spile.fieldw;
		$("#p"+i).css("left",posL)
		$("#p"+i).css("top",posT)
		$("#p"+i).css("border-color",spile.players[i].color);
		$("#players-data").append("<div id='pd"+i+"'' style='border-color: "+spile.players[i].color+"'>"+spile.players[i].name+": <span>"+spile.players[i].capital+"</span> coins</div>")
	}
} 

function getRandomTurn(p){
	spile.turn = Math.ceil(Math.random() * p)-1;
	if(spile.turn == 0){
		unfreez();
	} else {
		simulateAI(spile.turn)
	}
}

function changeTurn(){
	console.log(spile)
	if(spile.turn==spile.players.length-1){
		spile.turn = 0;
		if(typeof spile.players[spile.turn].lost === "undefined"){
			unfreez();
		} else {
			changeTurn();
		}		
	} else {
		spile.turn++;
		if(typeof spile.players[spile.turn].lost === "undefined"){
			simulateAI();
		} else {
			changeTurn();
		}		
	}
}

function simulateAI(){
	var id = spile.turn;
	var d = getNewDices();
	message(spile.players[id].name+"'s turn.");
	showDices(d,id);
	updatePosition(id,d);
	redrawPlayer(id);
	var newP = spile.players[id].position;
	if(spile.fields[newP].is_ownable && typeof spile.fields[newP].owner_id === "undefined"){
		buyOrNo_Ai(newP,id);
	} else if (!spile.fields[newP].is_ownable){
		message(spile.players[id].name+" reached "+spile.fields[newP].name+", change of turn.");
		changeTurn();		
	} else if(spile.fields[newP].owner_id==id){
		message(spile.players[id].name+" reached property "+spile.fields[newP].name+" and it already belongs to him, change of turn.");
		changeTurn();		
	} else {
		spile.players[id].capital -= spile.fields[newP].rent;
		spile.players[spile.fields[newP].owner_id].capital += spile.fields[newP].rent;
		$("#pd"+id).find("span").html(spile.players[id].capital)
		$("#pd"+spile.fields[newP].owner_id).find("span").html(spile.players[spile.fields[newP].owner_id].capital)
		if(spile.players[id].capital<0){
			message(spile.players[id].name+" cant pay for rent of property "+spile.fields[newP].name+" , unsufficient ballance.");
			message(spile.players[id].name+" lost - bankrupt.");
			for(var i = 0; i<spile.fields.length; i++){
				if(spile.fields[i].owner_id==id){
					delete spile.fields[i].owner_id;
					$("#f"+i).css("background","#d4e8cd");
				}
			}	
			$("#p"+id).addClass("lost");
			spile.players[id].lost = 1;
			var j = 0;
			var player = {};
			for(var i = 0; i<spile.players.length; i++){
				if(typeof spile.players[i].lost==="undefined"){
					j++;
					player = spile.players[i];
				}
			}	
			if(j==1){
				message(player.name+" won.");
				return;
			}		
		} else {
			message(spile.players[id].name+" payed "+spile.fields[newP].rent+" coins rent for property "+spile.fields[newP].name+", change of turn.");
		}	
		changeTurn();	
	}
}

function play(){
	freez();
	var id = spile.turn;
	var d = getNewDices();
	showDices(d,id);
	updatePosition(id,d);
	redrawPlayer(id);
	var newP = spile.players[id].position;
	if(spile.fields[newP].is_ownable && typeof spile.fields[newP].owner_id === "undefined"){
		buyOrNo_Player(newP,id);
	} else if (!spile.fields[newP].is_ownable){
		message(spile.players[id].name+" reached "+spile.fields[newP].name+", change of turn.");
		changeTurn();		
	} else if(spile.fields[newP].owner_id==id){
		message(spile.players[id].name+" reached property "+spile.fields[newP].name+" and it already belongs to him, change of turn.");
		changeTurn();		
	} else {
		spile.players[id].capital -= spile.fields[newP].rent;
		spile.players[spile.fields[newP].owner_id].capital += spile.fields[newP].rent;
		$("#pd"+id).find("span").html(spile.players[id].capital)
		$("#pd"+spile.fields[newP].owner_id).find("span").html(spile.players[spile.fields[newP].owner_id].capital)
		if(spile.players[id].capital<0){
			message(spile.players[id].name+" cant pay for rent of property "+spile.fields[newP].name+" , unsufficient ballance.");
			message(spile.players[id].name+" lost - bankrupt.");
			for(var i = 0; i<spile.fields.length; i++){
				if(spile.fields[i].owner_id==id){
					delete spile.fields[i].owner_id;
					$("#f"+i).css("background","#d4e8cd");
				}
			}
			$("#p"+id).addClass("lost");
			spile.players[id].lost = 1;
			var j = 0;
			var player = {};
			for(var i = 0; i<spile.players.length; i++){
				if(typeof spile.players[i].lost==="undefined"){
					j++;
					player = spile.players[i];
				}
			}	
			if(j==1){
				message(player.name+" won.");
				return;
			}	
		} else {
			message(spile.players[id].name+" payed "+spile.fields[newP].rent+" coins rent for property "+spile.fields[newP].name+", change of turn.");
		}	
		changeTurn();		
	}
}	

function buyOrNo_Ai(p,id){
	if(spile.players[id].capital>=spile.fields[p].price &&
		Math.ceil(Math.random()*5)!=3){
		spile.players[id].capital -= spile.fields[p].price;
		$("#pd"+id).find("span").html(spile.players[id].capital)
		spile.fields[p].owner_id = id;
		$("#f"+p).css("background-color",spile.players[id].color);
		message(spile.players[id].name+" bought property "+spile.fields[p].name+" for "+spile.fields[p].price+" coins.");
		changeTurn();
	} else if(spile.players[id].capital<spile.fields[p].price){
		message(spile.players[id].name+" have not enough coins to buy property "+spile.fields[p].name);
		changeTurn();		
	} else{
		message(spile.players[id].name+" decided not to buy property "+spile.fields[p].name);
		changeTurn();
	}		
}

function buyOrNo_Player(p,id){
	if(spile.players[id].capital>=spile.fields[p].price){
		activatePrompt(p);
	} else if(spile.players[id].capital<spile.fields[p].price){
		message(spile.players[id].name+" have not enough coins to buy property "+spile.fields[p].name+".");
		changeTurn();		
	}		
}

function activatePrompt(p){
	$("#buy-prompt button").removeAttr("disabled");
	$("#buy-prompt").show();
	$("#propid").html(spile.fields[p].name);
	spile.current_prop = p;
}

function buy(){
	var id = spile.turn;
	var p = spile.current_prop;
	spile.players[id].capital -= spile.fields[p].price;
	$("#pd"+id).find("span").html(spile.players[id].capital)
	spile.fields[p].owner_id = id;
	$("#f"+p).css("background-color",spile.players[id].color);
	message(spile.players[id].name+" bought property "+spile.fields[p].name+" for "+spile.fields[p].price+" coins.");
	delete spile.current_prop;
	$("#buy-prompt").hide();
	$("#buy-prompt button").attr("disabled","disabled");
	changeTurn();	
}

function pass(){
	var id = spile.turn;
	var p = spile.current_prop;
	message(spile.players[id].name+"decided not to buy property "+spile.fields[p].name+".");
	delete spile.current_prop;
	$("#buy-prompt").hide();
	$("#propid").html("");
	$("#buy-prompt button").attr("disabled","disabled");
	changeTurn();	
}

function unfreez(){
	window.setTimeout(function(){
		$("#joystick button").removeAttr("disabled");
		message(spile.players[0].name+"'s turn. Please throw the dices");
	}, 1000)
}

function freez(){
	$("#joystick button").attr("disabled","disabled");
}

function redrawPlayer(id){
	var posL = Math.random()*parseInt($("#spile").css("width"))*spile.fieldw+$("#f"+spile.players[id].position).position().left;
	var posT = Math.random()*parseInt($("#spile").css("height"))*spile.fieldw+$("#f"+spile.players[id].position).position().top;
	$("#p"+id).css("left",posL)
	$("#p"+id).css("top",posT)	
}

function updatePosition(id,d){
	var cd = 0;	
	for(var i=0;i<d.length;i++){
		cd+=d[i]
	}	
	var oldP = spile.players[id].position;
	if( oldP+cd > spile.fields.length-1){
		spile.players[id].capital+=spile.start_benefit;		
		$("#pd"+id).find("span").html(spile.players[id].capital)
		spile.players[id].position = (oldP+cd) % spile.fields.length;
		message(spile.players[id].name+" collected "+spile.start_benefit+" from bank by reaching start.")
	} else {
		spile.players[id].position = oldP+cd;
	}
	
}

function getNewDices(){
	var dices = [];
	for(var i=0;i<spile.dice_count;i++){
		dices.push(Math.ceil(Math.random()*spile.dice))
	}
	return dices
}

function showDices(d, id){
	$("#diceplate").html("");
	$("#diceplate").append("<div class='dice-message'>"+spile.players[id].name+"is throwing the dices...</div>");
	var str = "";
	$("#diceplate").html("");
	for(var i=0;i<d.length;i++){
		$("#diceplate").append("<div class='dice dice-"+d[i]+"'>"+d[i]+"</div>");
		$("div.dice-"+d[i]).addClass("thrown");
		if(i==d.length-1){
			str+=d[i];
		} else {	
			str+=d[i]+" and ";
		}
	}	
	message(spile.players[id].name+" has thrown "+str);
	$("#diceplate").html("");
}

function message(msg){
	var d =  new Date().toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric"});
	$("#log tbody").prepend("<tr><td>"+d+"</td><td>"+msg+"</td></tr>");	
}

$(document).ready(function(){
	$("#init").click(function(){
		let p = $("#players").val();
		let f = $("#fields").val();
		let c = $("#capital").val();
		start(p,f,c)
		$(".modal").hide()
	})

	$("#joystick button").click(function(){
		play()
	})

	$("#buy-prompt #buy").click(function(){
		buy()
	})

	$("#buy-prompt #pass").click(function(){
		pass()
	})
})