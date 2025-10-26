import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { timer } from "../../../globals.js";

/**
 * State where the player is lifting a pot above their head.
 * This is a short animation that transitions to carrying state.
 */
export default class PlayerPotLiftingState extends State {
  static LIFT_DURATION = 0.4; // How long the lift animation takes

  constructor(player) {
    super();

    this.player = player;
    this.pot = null;

    // Single frame for each direction during lift
    this.animation = {
      [Direction.Up]: new Animation([8], 1),
      [Direction.Down]: new Animation([0], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  /**
   * Sets up the lifting animation and pot behavior.
   * @param {Object} parameters Contains the pot being lifted
   */
  enter(parameters) {
    this.pot = parameters.pot;

    // Use lifting sprite sheet
    this.player.positionOffset = { x: 0, y: 0 };
    this.player.sprites = this.player.liftingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
    this.player.currentAnimation.refresh();

    if (this.pot) {
      // Mark pot as being carried
      this.pot.isBeingCarried = true;
      this.pot.carrier = this.player;
      this.pot.isSolid = false; // Player can walk through it now

      // Smoothly tween pot up to above player's head
      timer.tween(
        this.pot.position,
        {
          x:
            this.player.position.x +
            this.player.dimensions.x / 2 -
            this.pot.dimensions.x / 2,
          y: this.player.position.y - this.pot.dimensions.y + 10,
        },
        PlayerPotLiftingState.LIFT_DURATION
      );
    }

    this.startTimer();
  }

  /**
   * Reset any position offsets when leaving this state.
   */
  exit() {
    this.player.positionOffset = { x: 0, y: 0 };
  }

  /**
   * Just waits for animation to finish, no player input here.
   */
  update(dt) {
    // Stay in this state until animation completes
  }

  /**
   * Transitions to carrying state after lift is done.
   */
  async startTimer() {
    await timer.wait(PlayerPotLiftingState.LIFT_DURATION);
    this.player.changeState(PlayerStateName.PotCarrying, { pot: this.pot });
  }
}
