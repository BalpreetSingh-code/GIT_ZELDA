import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";
import Input from "../../../../lib/Input.js";

export default class PlayerIdlingState extends State {
  /**
   * In this state, the player is stationary unless
   * a directional key or the spacebar is pressed.
   *
   * @param {Player} player
   */
  constructor(player) {
    super();

    this.player = player;
    this.animation = {
      [Direction.Up]: new Animation([8], 1),
      [Direction.Down]: new Animation([0], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  enter() {
    this.player.sprites = this.player.walkingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
  }

  update() {
    this.checkForMovement();
    this.checkForSwordSwing();
    this.checkForPotLift();
  }

  checkForMovement() {
    if (input.isKeyPressed(Input.KEYS.S)) {
      this.player.direction = Direction.Down;
      this.player.changeState(PlayerStateName.Walking);
    } else if (input.isKeyPressed(Input.KEYS.D)) {
      this.player.direction = Direction.Right;
      this.player.changeState(PlayerStateName.Walking);
    } else if (input.isKeyPressed(Input.KEYS.W)) {
      this.player.direction = Direction.Up;
      this.player.changeState(PlayerStateName.Walking);
    } else if (input.isKeyPressed(Input.KEYS.A)) {
      this.player.direction = Direction.Left;
      this.player.changeState(PlayerStateName.Walking);
    }
  }

  checkForSwordSwing() {
    if (input.isKeyPressed(Input.KEYS.SPACE)) {
      this.player.changeState(PlayerStateName.SwordSwinging);
    }
  }

  checkForPotLift() {
    if (input.isKeyPressed(Input.KEYS.ENTER) && !this.player.isCarryingPot) {
      const pot = this.player.room?.objects.find((object) => {
        if (!object.isLiftable || object.isBeingCarried) {
          return false;
        }

        const potCenter = {
          x: object.position.x + object.dimensions.x / 2,
          y: object.position.y + object.dimensions.y / 2,
        };

        const playerCenter = {
          x: this.player.position.x + this.player.dimensions.x / 2,
          y: this.player.position.y + this.player.dimensions.y / 2,
        };

        const distance = 20;

        switch (this.player.direction) {
          case Direction.Up:
            return (
              potCenter.y < playerCenter.y &&
              Math.abs(potCenter.x - playerCenter.x) < 10 &&
              playerCenter.y - potCenter.y < distance
            );
          case Direction.Down:
            return (
              potCenter.y > playerCenter.y &&
              Math.abs(potCenter.x - playerCenter.x) < 10 &&
              potCenter.y - playerCenter.y < distance
            );
          case Direction.Left:
            return (
              potCenter.x < playerCenter.x &&
              Math.abs(potCenter.y - playerCenter.y) < 10 &&
              playerCenter.x - potCenter.x < distance
            );
          case Direction.Right:
            return (
              potCenter.x > playerCenter.x &&
              Math.abs(potCenter.y - playerCenter.y) < 10 &&
              potCenter.x - playerCenter.x < distance
            );
          default:
            return false;
        }
      });

      if (pot) {
        this.player.changeState(PlayerStateName.PotLifting, { pot });
      }
    }
  }
}
