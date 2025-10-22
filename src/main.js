/**
 * Zelda-5
 * The "Polish" Update
 *
 * Original Lua by: Colton Ogden (cogden@cs50.harvard.edu)
 * Adapted to JS by: Vikram Singh (vikram.singh@johnabbott.qc.ca)
 *
 * The Legend of Zelda is a top-down dungeon crawler where the player
 * controls a sword and shield wielding character named Link. The games
 * in this series generally all include elements of puzzles, action,
 * adventure, and exploration. Over the course of the game, Link will
 * acquire various items and upgrades that he can use to defeat enemies
 * and solve puzzles. The first game in the series was released in 1986
 * on Nintendo's Famicom Disk System and was revolutionary for its time.
 * It is widely considered to be one of the best game franchises to date.
 *
 * Art
 * @see https://opengameart.org/content/top-down-dungeon-tileset
 * @see https://opengameart.org/comment/50905
 * @see https://opengameart.org/content/zelda-like-tilesets-and-sprites
 *
 * Music
 * @see https://opengameart.org/content/rain-and-thunders
 */

import GameStateName from './enums/GameStateName.js';
import Game from '../lib/Game.js';
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	stateMachine,
} from './globals.js';
import PlayState from './states/game/PlayState.js';
import GameOverState from './states/game/GameOverState.js';
import TitleScreenState from './states/game/TitleScreenState.js';
import TransitionState from './states/game/TransitionState.js';

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1'); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.prepend(canvas);

// Add all the states to the state machine.
stateMachine.add(GameStateName.Transition, new TransitionState());
stateMachine.add(GameStateName.GameOver, new GameOverState());
stateMachine.add(GameStateName.Play, new PlayState());
stateMachine.add(GameStateName.TitleScreen, new TitleScreenState());

const game = new Game(stateMachine, context, canvas.width, canvas.height);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
