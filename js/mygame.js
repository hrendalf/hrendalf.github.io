/*
 * Author: Sergey Bushkov; 2015.
 *
 * Start a game in the parent (div) container:
 * set the initial state, add images to the container, add event handlers, etc.
 *
 * Parameters:
 *     parent - container (div) which will contain the game images;
 *     numCats - number of different cat images (cat1.png, cat2.png, ...);
 *     numCards - number of displayed images. For the classic game,
 *                numCards should be (numCats * 2); for the "match 3 images"
 *                mode, it should be (numCats * 3), etc. If the multiplier
 *                is not an integer number, some cats will be more frequent,
 *                and some less frequent. 
 */
function startGame(parent, numCats, numCards) {

    /* Images are added to the parent div as a sequence; the layout does not
       matter here in the script. For example, 12 cards can be presented as
       2 rows x 6 cards, or 3x4, or even (2 rows x5 + 2 cards in extra row) */

    /* the "deck" array contains shuffled cat numbers for the current game
       (initialized here, and _not changed_ during the game). 
       Values = numbers from the range 1..numCats */
    var deck = [];
    for (i = 0; i < numCards; i++) {
        deck.push(i % numCats +1);
    }
    deck = shuffle(deck);

    /* The game state (state is initialized here, and changed by user actions):
       flipped[i] is true if card #i is currently flipped (the image is open);
       cleared[i] is true if card #i is guessed and not active anymore;
       initially no cards are flipped, no cards are cleared */
    flipped = [];
    cleared = [];
    for (i = 0; i < numCards; i++) {
        flipped[i] = false;
        cleared[i] = false;
    }

    /* remove old stuff from parent div, since game is restarted */
    $(parent).empty();

    /* add image tags to the parent container (display "back" of the cards) */
    for (i = 0; i < numCards; i++) {
        $(parent).append('<img class="gameimage" id="cat' + i + '" src="knit_texture.png" onclick="flip(this)"/>'); 
    }

    /* the "game" object is javaScript object which keeps all game state data.
       It is initialized here, and will be used in "flip" handler below. */
    var game = {
        numCats: numCats, 
        numCards: numCards,
        deck: deck,
        flipped: flipped,
        cleared: cleared,
        lastFlippedCat: 0, /* last cat number; or 0 when sequence restarts */
        unflipOnNextClick: false, /* set when guessed wrong cat */
        turns: 0 /* number of turns */
    }

    /* the following line attaches the state object to the parent div element.
       Then, the "flip" handler below will get this data back from div.        
       I'm not familiar with javascript; maybe there is better way to preserve
       such state data when methods do not share the scope (and I do not 
       want to use global variables). If you know better way - please let me
       know. For more information about this method - search for jQuery "data" 
       function */ 
    $(parent).data('game', game);
}


/*
 * Handle image clicks: check the current game state, find out if card can be
 * flipped, and if it's flipped - what's next, how it affects the game state.
 */
function flip(img) {
    /* get the "game" state object from parent div (jQuery) */
    var parentDiv = $(img).closest('div');
    var game = $(parentDiv).data('game');
    
    /* get image id and then index. For example, if the game
       was created with 12 images, the index will be fro the range 0..11 */
    var id = $(img).attr('id');       /* image "id" attribute: 'cat0', ... */
    var index = parseInt(id.slice(3)) /* remove 3 letters and convert to int */

    /* the previous click opened "unmatched" images; user had some time to
       memorize; now he clicked again - flip the "unmatched" images back,
       change css class back to normal, and return */
    if (game.unflipOnNextClick) {
        for (i = 0; i < game.deck.length; i++) {
            if (game.flipped[i]) {
                game.flipped[i] = false;
                $('#cat' + i).attr('src', 'knit_texture.png');
                $('#cat' + i).attr('class', 'gameimage');
            }
        }
        game.lastFlippedCat = 0;
        game.unflipOnNextClick = false;
        return;
    }

    /* clicked already "cleared" or open image - nothing interesting; just return */
    if (game.cleared[index] || game.flipped[index]) {
        return;
    }

    /* here is the main "matching images" logic */
    game.turns += 1;
    var currentCat = game.deck[index]; /* the cat type number */
    if (game.lastFlippedCat == 0) {
        /* just started - flipped the first cat; show the image and update state */
        game.lastFlippedCat = currentCat;
        game.flipped[index] = true;
        $(img).attr('src', 'cat_' + currentCat + '.png');

    } else if (currentCat == game.lastFlippedCat) {
        /* flipped another card, and it matched the last one. Show the image,
           and check if more cats of this type left closed (remember, it can 
           be "match 2", but also "match 3", and more */
        var moreLeft = false;
        for (i = 0; i < game.deck.length; i++) {
            if (game.deck[i] == currentCat && i != index && !game.flipped[i]) {
                moreLeft = true;
            }
        }
        if (moreLeft) {
            /* here are more images of the same cat to find; show the current one
               and continue the play */ 
            game.lastFlippedCat = currentCat;
            game.flipped[index] = true;
            $(img).attr('src', 'cat_' + currentCat + '.png');
        } else {
            /* that was the last one - mark them all as "cleared", and go next */
            $(img).attr('src', 'cat_' + currentCat + '.png');
            for (i = 0; i < game.deck.length; i++) {
                if (i == index || game.flipped[i]) {
                    game.flipped[i] = false;
                    game.cleared[i] = true;
                    /*$('#cat' + i).attr('src', 'linen_paper.png');*/
                    $('#cat' + i).attr('class', 'gameimagematched');
                }
            }
            game.lastFlippedCat = 0; /* next click will start differnt matching sequence */

            /* check - if all cards are "cleared", user just finished the game */
            var finished = true;
            for (i = 0; i < game.deck.length; i++) {
                finished = finished && game.cleared[i]; /* boolean AND _all_ cleared[i] */
            } 

            /* if finished, write congratulation message, add "restart" button, etc.
               All cards are already open with green border, if user clicks those
               cards later - the clicks will do nothing; no need to modify state here.
               Note, that "restart" button calls "startGame" function with the same
               numCats and numCards parameters, which were used to start the current game */
            if (finished) {
                /* form the "button" html string; should look like this:
                   <button type="button" class="easybutton" onclick="startGame($('#gamecontainer'), 6, 12);">Play again?</button> */

                var onclickString = "startGame($('#gamecontainer'), " + game.numCats + ", " + game.numCards + ");"
                var buttonString = '<button type="button" class="easybutton" onclick="' + onclickString + '">Play again?</button>';
                $(parentDiv).append('<p>Congratulations, you beat the game in ' + game.turns + ' turns!</p>');
                rhe = happyendings[Math.floor(Math.random() * happyendings.length)];
                $(parentDiv).append('<p>Here is your random happy end:</p>');
                $(parentDiv).append('<blockquote class="blockquote-reverse">'
                    +'<p>' + rhe.quote + '</p>'
                    +'<small>' + rhe.author + ' in <cite title="' + rhe.title + '">'+rhe.title +'</cite></small>'
                    +'</blockquote>');
                $(parentDiv).append(buttonString);
            }
        }
    } else {
        /* did not match the last image. Show the image; change css class of all
           last images to "wrong" style; and set the "unflip on next click" flag */
        game.flipped[index] = true;
        $(img).attr('src', 'cat_' + currentCat + '.png');
        for (i = 0; i < game.deck.length; i++) {
            if (game.flipped[i]) {
                $('#cat' + i).attr('class', 'gameimagewrong');
            }
        }
        game.unflipOnNextClick = true;
    }
}


/*
 * Shuffle array of numbers; code taken from here:
 * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
 */
function shuffle(array) {
    var counter = array.length;
    var temp, index;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

