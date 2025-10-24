import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import ThrownPot from "../../../objects/ThrownPot.js";
import { timer } from "../../../globals.js";

export default class PlayerPotThrowingState extends State {
  static THROW_DURATION = 0.2; // Duration of throw animation

  /**
   * In this state, the player throws the pot they're carrying.
   *
   * @param {Player} player
   */
  constructor(player) {
    super();

    this.player = player;
    this.pot = null;

    // Throwing animation (reverse of lifting)
    this.animation = {
      [Direction.Up]: new Animation([11, 10, 9, 8], 0.05, 1),
      [Direction.Down]: new Animation([3, 2, 1, 0], 0.05, 1),
      [Direction.Left]: new Animation([15, 14, 13, 12], 0.05, 1),
      [Direction.Right]: new Animation([7, 6, 5, 4], 0.05, 1),
    };
  }

  enter(parameters) {
    this.pot = parameters.pot;
    this.player.sprites = this.player.liftingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];

    // Create a thrown pot projectile
    if (this.pot && this.player.room) {
      const thrownPot = new ThrownPot(
        this.pot.position.x,
        this.pot.position.y,
        this.player.direction,
        this.player.room
      );
      this.player.room.objects.push(thrownPot);

      // Remove the carried pot
      this.pot.cleanUp = true;
      this.pot.isBeingCarried = false;
      this.pot.carrier = null;
    }

    this.startTimer();
  }

  update(dt) {
    // Stay in this state until animation completes
  }

  async startTimer() {
    await timer.wait(PlayerPotThrowingState.THROW_DURATION);

    this.player.changeState(PlayerStateName.Idle);
  }
}
