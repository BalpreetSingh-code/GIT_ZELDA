import Animation from "../../../../lib/Animation.js";
import State from "../../../../lib/State.js";
import Player from "../../../entities/Player.js";
import Direction from "../../../enums/Direction.js";
import PlayerStateName from "../../../enums/PlayerStateName.js";
import { input } from "../../../globals.js";
import Input from "../../../../lib/Input.js";

/**
 * State where the player is standing still.
 * From here they can walk, swing sword, or lift a pot.
 */
export default class PlayerIdlingState extends State {
  constructor(player) {
    super();

    this.player = player;
    
    // Single frame for each direction
    this.animation = {
      [Direction.Up]: new Animation([8], 1),
      [Direction.Down]: new Animation([0], 1),
      [Direction.Left]: new Animation([12], 1),
      [Direction.Right]: new Animation([4], 1),
    };
  }

  /**
   * Sets up idle animation based on player's direction.
   */
  enter() {
    this.player.sprites = this.player.walkingSprites;
    this.player.currentAnimation = this.animation[this.player.direction];
  }

  /**
   * Checks for player input each frame.
   */
  update() {
    this.checkForMovement();
    this.checkForSwordSwing();
    this.checkForPotLift();
  }

  /**
   * Checks if player pressed WASD to start walking.
   */
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

  /**
   * Checks if player pressed Space to swing sword.
   */
  checkForSwordSwing() {
    if (input.isKeyPressed(Input.KEYS.SPACE)) {
      this.player.changeState(PlayerStateName.SwordSwinging);
    }
  }

  /**
   * Checks if player pressed Enter to lift a nearby pot.
   * Finds the closest pot in the direction player is facing.
   */
  checkForPotLift() {
    // Only lift if not already carrying something
    if (input.isKeyPressed(Input.KEYS.ENTER) && !this.player.isCarryingPot) {
      // Look through all objects in the room for a liftable pot
      const pot = this.player.room?.objects.find((object) => {
        // Skip if not a pot or already being carried
        if (!object.isLiftable || object.isBeingCarried) {
          return false;
        }

        // Calculate center points for distance checking
        const potCenter = {
          x: object.position.x + object.dimensions.x / 2,
          y: object.position.y + object.dimensions.y / 2,
        };

        const playerCenter = {
          x: this.player.position.x + this.player.dimensions.x / 2,
          y: this.player.position.y + this.player.dimensions.y / 2,
        };

        const distance = 20; // How close player needs to be

        // Check if pot is in front of player based on direction
        switch (this.player.direction) {
          case Direction.Up:
            // Pot should be above player
            return (
              potCenter.y < playerCenter.y &&
              Math.abs(potCenter.x - playerCenter.x) < 10 &&
              playerCenter.y - potCenter.y < distance
            );
          case Direction.Down:
            // Pot should be below player
            return (
              potCenter.y > playerCenter.y &&
              Math.abs(potCenter.x - playerCenter.x) < 10 &&
              potCenter.y - playerCenter.y < distance
            );
          case Direction.Left:
            // Pot should be to the left
            return (
              potCenter.x < playerCenter.x &&
              Math.abs(potCenter.y - playerCenter.y) < 10 &&
              playerCenter.x - potCenter.x < distance
            );
          case Direction.Right:
            // Pot should be to the right
            return (
              potCenter.x > playerCenter.x &&
              Math.abs(potCenter.y - playerCenter.y) < 10 &&
              potCenter.x - playerCenter.x < distance
            );
          default:
            return false;
        }
      });

      // If we found a pot in range, start lifting it
      if (pot) {
        this.player.changeState(PlayerStateName.PotLifting, { pot });
      }
    }
  }
}
