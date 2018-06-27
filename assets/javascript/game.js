// World Cup Hangman

$(function(){
    $("#displayButton").click(function(){
        setup() 
     });
    $("#seeCardButton").click(function(){
        $("#scrapbook").modal();
    });
    $("#saveToBook").click(function(){ //copies card from GOAL popup and modifies it and adds to scrapbook
       saveToBook() 
    });
    $("#settingsButton").click(function(){
        $("#settings").modal();
    });

    game.chances = document.getElementById("chancesOption").value; //added here because it needs to wait until the html for chancesOption actually loads before setting the value

    $("#displayInfoBox").click(function(){
        $("#playerInfo").toggleClass("d-none")
    });
});
var alphabet = 'abcdefghijklmnopqrstuvwxyz-' //letters and symbols that exist in player names

var game = {
    difficulty: function(){
        var dif;
        if(document.getElementById('allCountriesRadio').checked){
            dif = "hard"
        }else{
            dif = "easy"
        }
        return dif
    },
    positions: function(){
        var checkboxes = document.getElementsByName("checkbox");
        var checked =[];
        for (var i in checkboxes){
            if (checkboxes[i].checked){
                checked.push(checkboxes[i].value);
            }
        }
        return checked
    },
    setIndex : function(){
        var posList = game.positions()
        var allPlayers;
        if (posList.length <4){
            allPlayers = filterPosition(posList)
        }
        else{
            allPlayers = players
        }

        if (game.difficulty() == "hard"){
            var playerIndex = Math.floor(Math.random() * allPlayers.length);
            game.index = playerIndex;
            game.player = allPlayers[game.index];
        }
        else{
            var topPlayers = topCountries(allPlayers);
            var playerIndex = Math.floor(Math.random() * topPlayers.length);
            game.index = playerIndex;
            game.player = topPlayers[playerIndex]
        }
    },
    userGuesses : [],
    correctGuessCount:0,
    winCount : 0,
    loseCount: 0,
    displayArr:[],
    display: function(){
        var display = "";
        for (var i = 0; i<game.displayArr.length; i++){
            display += game.displayArr[i]+" ";
        }
        return display;
    },
    scrapbook:[],
    active: true
}

//resets core game stats when the user continues on to the next player
function resetGame(){
    game.active=true;
    game.userGuesses=[];
    game.correctGuessCount=0;
    game.chances = document.getElementById("chancesOption").value;
    game.displayArr=[],

    $("#ballImageAI").css({
        "top":"50%"
    });
    $("#ballImageUser").css({
        "bottom":"50%"
    });
}

//update elements on screen including correct guesses, wrong guesses, score, player info 
function updateScreen(){
    $("#display").html(game.display())
    $("#guesses").html(game.userGuesses)
    $("#score").html('<p style= "float:left">Human</p>'+ game.winCount+ " - "+ game.loseCount+' <p style= "float:right">Computer</p>')
    $("#playerInfo").text(game.player.pos+ " from "+ game.player.nat)
}

//moves computer ball every time user picks a wrong guess
function aiBallMovement(){
    var ball = $("#ballImageAI")
    ball.css({
        "top": String(50 + (10 - Number(game.chances))*4.5)+"%"
    });
}

//moves user ball every time user picks a correct letter
function userBallMovement(){
    var ball = $("#ballImageUser")
    ball.css({
        "bottom": String(50 + (game.correctGuessCount/game.player.name.length)*45)+"%"
    });
}

//sets up game every time a user moves on to the next player
function setup(){
    resetGame()
    $(".col-12").removeClass("d-none") //only valid for first start
    game.setIndex();
    var displayArr = [];
    for(var i=0 ; i<game.player.name.length ; i++){ //creates the __ __ __ __ based on player names
        if (game.player.name[i] == " "){
            displayArr.push("<br>")
        }else{
            displayArr.push("__")
        }
    }
    game.displayArr = displayArr;
    $("#displayButton").text("Next Player")
    updateScreen()
}

function saveToBook(){
    if(game.scrapbook.indexOf(game.player) == -1){ //if the player doesn't already exist in the scrapbook
        var card = $("#win-modal-body").children().clone();
        card.addClass("float-left mx-1 my-1")
        card.css({
            "height":"250px",
            "width":"150px"
        });
        var body = card.children().first().next()
        body.addClass("pt-1")
        var title = body.children().first()
        title.addClass("mb-1 mt-0")
        title.css({
            "font-size":"15px",
            "font-weight":"bold"
        });
        var info = title.next()
        info.text(game.player.pos+" from "+game.player.nat);
        info.css({
            "font-size":"12px"
        });
        card.removeClass("mx-auto")
        $("#scrapbook-body").append(card);
        $("#winModal").modal('toggle');

        game.scrapbook.push(game.player)
    }
}

function getCharIndexAll(guess){ //returns a list of indexes for all occurences of a given character in player name
    charIndexList =[];
    for (var i in game.player.name){
        if (guess == game.player.name[i].toLowerCase()){
            charIndexList.push(i);
        };
    };
    return charIndexList
}

//checks if user won. if true, adds to win count, makes scrapbook visible after first win, and returns true
function didWin(){
    if (game.displayArr.indexOf("__") == -1) {
        $("#winModal").modal();
        
        //adds card html to winModal
        $("#win-modal-body").html(            
        '<div class="card d.block mx-auto text-center honoluluBlue shadow-lg" style="width: 18rem;">'+
            '<img class="card-img-top" src="'+game.player.image+'" alt="Player Image">'+
            '<div class="card-body">'+
                '<h5 class="card-title">'+game.player.name+'</h5>'+
                '<p class="card-text">Nationality: '+game.player.nat+'<br> Position: '+game.player.pos+'</p>'+
            '</div>'+
        '</div>'
        );

        game.winCount += 1
        $("#seeCardButton").removeClass('d-none'); //allows user to be able to open up the scrapbook after the first win
        return true;
    }else return false;
}

//checks if user lost based on remaining chances. if true shows lose modal and returns true
function didLose(){
    if(game.chances<=0){
        game.loseCount +=1
        $("#loseModal").modal();
        return true;
    }else return false;
}

//when game.active is true collects userInput from keyboard onkeyup event. if letter exists in target word 
document.onkeyup = function(event){

    var userInput = event.key;
    if (game.active){
        if (game.userGuesses.indexOf(userInput) ==-1 && alphabet.indexOf(userInput)>-1 && game.displayArr.indexOf(userInput)==-1 && game.displayArr.indexOf(userInput.toUpperCase())==-1){
            var charIndexList = getCharIndexAll(userInput)
            if(charIndexList.length >0){
                for (var n in charIndexList){
                    var activeIndex = charIndexList[n]
                    game.displayArr[activeIndex]=game.player.name[activeIndex]
                    game.correctGuessCount+=1
                }
                userBallMovement()
            }else{
                game.userGuesses.push(userInput)
                game.userGuesses.push(" ")
                game.chances -= 1
                aiBallMovement()
            }
            if (didWin()){
                game.active = false; //deactivates game so that keyboard buttons don't run this function until user moves on to the next player and game.active==true again
            }else{
                if (didLose()){
                game.active = false; //deactivates game so that keyboard buttons don't run this function until user moves on to the next player and game.active==true again
                }
            }
        }       
        updateScreen()
    }
}






// create game Object
//     game.setup(){
//         Randomly Select one player
//         Create "display" array
//             displayArr = ["_","_","_","_" ...]
//         game.display = displayArr
//     }
//     game.userGuess(guess){
//     }
//     game.chances
//     game.correctGuessCount


// isGoodGuess(){
//     player.name.indexOf(game.userGuess)>-1
// }
// didWin(){
//     game.correctGuessCount == player.name.length
// }

// jquery--> create visual representation of displayArr



