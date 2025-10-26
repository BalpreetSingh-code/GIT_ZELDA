import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import ThrownPot from "../../../objects/ThrownPot.js";
import { timer } from "../../../globals.js";

/**
 * State where the player throws the pot they're carrying.
 * Quick animation then back to idle state.
 */
export default class PlayerPotThrowingState extends State {
  static THROW_DURATION = 0.2; // How long throw animation lasts

  constructor(player) {
    super();

    this.player = player;
    this.pot = null;

    // Throwing animation is the lifting animation played backwards
    this.animation = {
      [Direction.Up]: new Animation([11, 10, 9, 8], 0.05, 1),
      [Direction.Down]: new Animation([3, 2, 1, 0], 0.05, 1),
      [Direction.Left]: new Animation([15, 14, 13, 12], 0.05, 1),
      [Direction.Right]: new Animation([7, 6, 5, 4], 0.05, 1),
    };
  }

  /**
   * Starts throw animation and creates the thrown pot projectile.
   * @param {Object} parameters Contains the pot to throw
   */
  enter(parameters) {
    this.pot = parameters.pot;
    this.player.positionOffset = { x: 0, y: 0 };
    this.player.sprites = this.player.liftingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];

    // Create a new thrown pot object going in player's direction
    if (this.pot && this.player.room) {
      const thrownPot = new ThrownPot(
        this.pot.position.x,
        this.pot.position.y,
        this.player.direction,
        this.player.room
      );
      this.player.room.objects.push(thrownPot);

      // Remove the pot the player was carrying
      this.pot.cleanUp = true;
      this.pot.isBeingCarried = false;
      this.pot.carrier = null;
    }

    this.startTimer();
  }

  /**
   * Just wait for animation to finish, no player control during throw.
   */
  update(dt) {
    // Stay in this state until animation completes
  }

  /**
   * Return to idle state after throw is done.
   */
  async startTimer() {
    await timer.wait(PlayerPotThrowingState.THROW_DURATION);

    this.player.changeState(PlayerStateName.Idle);
  }
}
