import Animation from "../../../../lib/Animation.js";
import Input from "../../../../lib/Input.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";
import Room from "../../../objects/Room.js";

/**
 * State where the player carries a pot above their head.
 * Can walk around but can't swing sword. Press Enter to throw.
 */
export default class PlayerPotCarryingState extends State {
  constructor(player) {
    super();

    this.player = player;
    this.pot = null;

    // Walking animations for each direction
    this.walkingAnimation = {
      [Direction.Up]: new Animation([8, 9, 10, 11], 0.2),
      [Direction.Down]: new Animation([0, 1, 2, 3], 0.2),
      [Direction.Left]: new Animation([12, 13, 14, 15], 0.2),
      [Direction.Right]: new Animation([4, 5, 6, 7], 0.2),
    };

    // Idle animations when standing still
    this.idleAnimation = {
      [Direction.Up]: new Animation([8], 1),
      [Direction.Down]: new Animation([0], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  /**
   * Switches to carrying sprite and starts with idle pose.
   * @param {Object} parameters Contains the pot being carried
   */
  enter(parameters) {
    this.pot = parameters.pot;
    this.player.positionOffset = { x: 0, y: 0 };
    this.player.sprites = this.player.carryingSprites;
    this.player.currentAnimation = this.idleAnimation[this.player.direction];
    this.player.currentAnimation.refresh();
    this.player.isCarryingPot = true;
  }

  /**
   * Clean up when done carrying.
   */
  exit() {
    this.player.isCarryingPot = false;
  }

  /**
   * Handles player movement and input for throwing.
   */
  update(dt) {
    this.handleMovement(dt);
    this.handlePotThrow();
  }

  /**
   * Moves player with WASD keys and switches between walk/idle animations.
   * Can't go through walls even while carrying.
   */
  handleMovement(dt) {
    let isMoving = false;

    // Check each direction and move if key is pressed
    if (input.isKeyPressed(Input.KEYS.S)) {
      this.player.direction = Direction.Down;
      this.player.position.y += this.player.speed * dt;
      isMoving = true;

      // Don't let player leave room bounds
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

    // Use walking animation if moving, idle if standing still
    if (isMoving) {
      this.player.currentAnimation =
        this.walkingAnimation[this.player.direction];
    } else {
      this.player.currentAnimation = this.idleAnimation[this.player.direction];
    }
  }

  /**
   * Checks if player pressed Enter to throw the pot.
   */
  handlePotThrow() {
    if (input.isKeyPressed(Input.KEYS.ENTER)) {
      this.player.changeState(PlayerStateName.PotThrowing, { pot: this.pot });
    }
  }
}
