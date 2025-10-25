import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { timer } from "../../../globals.js";

export default class PlayerPotLiftingState extends State {
  static LIFT_DURATION = 0.4;

  constructor(player) {
    super();

    this.player = player;
    this.pot = null;

    this.animation = {
      [Direction.Up]: new Animation([8], 1),
      [Direction.Down]: new Animation([0], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  enter(parameters) {
    this.pot = parameters.pot;

    // Set position offset and sprites
    this.player.positionOffset = { x: 0, y: 0 };
    this.player.sprites = this.player.liftingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
    this.player.currentAnimation.refresh();

    if (this.pot) {
      this.pot.isBeingCarried = true;
      this.pot.carrier = this.player;
      this.pot.isSolid = false;

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

  exit() {
    this.player.positionOffset = { x: 0, y: 0 };
  }

  update(dt) {
    // Stay in this state until animation completes
  }

  async startTimer() {
    await timer.wait(PlayerPotLiftingState.LIFT_DURATION);
    this.player.changeState(PlayerStateName.PotCarrying, { pot: this.pot });
  }
}
