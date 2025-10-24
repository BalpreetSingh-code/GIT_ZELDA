import Animation from "../../../../lib/Animation.js";
import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";
import Room from "../../../objects/Room.js";

export default class PlayerPotCarryingState extends State {
  /**
   * In this state, the player carries a pot above their head.
   * They can move around but cannot swing their sword.
   *
   * @param {Player} player
   */
  constructor(player) {
    super();

    this.player = player;
    this.pot = null;

    // Carrying animation
    this.animation = {
      [Direction.Up]: new Animation([8, 9, 10, 11], 0.2),
      [Direction.Down]: new Animation([0, 1, 2, 3], 0.2),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.2),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.2),
    };
  }

  enter(parameters) {
    this.pot = parameters.pot;
    this.player.sprites = this.player.carryingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
    this.player.isCarryingPot = true;
  }

  exit() {
    this.player.isCarryingPot = false;
  }

  update(dt) {
    this.handleMovement(dt);
    this.handlePotThrow();
  }

  handleMovement(dt) {
    let isMoving = false;

    if (input.isKeyPressed(Input.KEYS.S)) {
      this.player.direction = Direction.Down;
      this.player.position.y += this.player.speed * dt;
      isMoving = true;

      if (
        this.player.position.y + this.player.dimensions.y >=
        Room.BOTTOM_EDGE
      ) {
        this.player.position.y = Room.BOTTOM_EDGE - this.player.dimensions.y;
      }
    } else if (input.isKeyPressed(Input.KEYS.D)) {
      this.player.direction = Direction.Right;
      this.player.position.x += this.player.speed * dt;
      isMoving = true;

      if (
        this.player.position.x + this.player.dimensions.x >=
        Room.RIGHT_EDGE
      ) {
        this.player.position.x = Room.RIGHT_EDGE - this.player.dimensions.x;
      }
    } else if (input.isKeyPressed(Input.KEYS.W)) {
      this.player.direction = Direction.Up;
      this.player.position.y -= this.player.speed * dt;
      isMoving = true;

      if (this.player.position.y <= Room.TOP_EDGE - this.player.dimensions.y) {
        this.player.position.y = Room.TOP_EDGE - this.player.dimensions.y;
      }
    } else if (input.isKeyPressed(Input.KEYS.A)) {
      this.player.direction = Direction.Left;
      this.player.position.x -= this.player.speed * dt;
      isMoving = true;

      if (this.player.position.x <= Room.LEFT_EDGE) {
        this.player.position.x = Room.LEFT_EDGE;
      }
    }

    if (isMoving) {
      this.player.currentAnimation = this.animation[this.player.direction];
    }
  }

  handlePotThrow() {
    if (input.isKeyPressed(Input.KEYS.ENTER)) {
      this.player.changeState(PlayerStateName.PotThrowing, { pot: this.pot });
    }
  }
}
