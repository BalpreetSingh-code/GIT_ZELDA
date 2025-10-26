import {
  getRandomPositiveInteger,
  pickRandomElement,
} from "../../lib/Random.js";
import Sprite from "../../lib/Sprite.js";
import Vector from "../../lib/Vector.js";
import EnemyFactory from "../services/EnemyFactory.js";
import Player from "../entities/Player.js";
import Direction from "../enums/Direction.js";
import EnemyType from "../enums/EnemyType.js";
import ImageName from "../enums/ImageName.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, images } from "../globals.js";
import Doorway from "./Doorway.js";
import Switch from "./Switch.js";
import Tile from "./Tile.js";
import Pot from "./Pot.js";

/**
 * Represents one room in the dungeon.
 * Contains walls, floor, enemies, objects, and doorways.
 */
export default class Room {
  // Room dimensions in tiles
  static WIDTH = CANVAS_WIDTH / Tile.TILE_SIZE - 2;
  static HEIGHT = Math.floor(CANVAS_HEIGHT / Tile.TILE_SIZE) - 2;
  static RENDER_OFFSET_X = (CANVAS_WIDTH - Room.WIDTH * Tile.TILE_SIZE) / 2;
  static RENDER_OFFSET_Y = (CANVAS_HEIGHT - Room.HEIGHT * Tile.TILE_SIZE) / 2;

  // Bounds for entity movement
  static TOP_EDGE = Room.RENDER_OFFSET_Y + Tile.TILE_SIZE;
  static BOTTOM_EDGE =
    CANVAS_HEIGHT - Room.RENDER_OFFSET_Y - Tile.TILE_SIZE - 5;
  static LEFT_EDGE = Room.RENDER_OFFSET_X + Tile.TILE_SIZE - 5;
  static RIGHT_EDGE = CANVAS_WIDTH - Tile.TILE_SIZE * 2 + 5;
  static CENTER_X = Math.floor(
    Room.LEFT_EDGE + (Room.RIGHT_EDGE - Room.LEFT_EDGE) / 2
  );
  static CENTER_Y = Math.floor(
    Room.TOP_EDGE + (Room.BOTTOM_EDGE - Room.TOP_EDGE) / 2
  );

  // Tile sprite indices
  static TILE_TOP_LEFT_CORNER = 3;
  static TILE_TOP_RIGHT_CORNER = 4;
  static TILE_BOTTOM_LEFT_CORNER = 22;
  static TILE_BOTTOM_RIGHT_CORNER = 23;
  static TILE_EMPTY = 18;
  static TILE_TOP_WALLS = [57, 58, 59];
  static TILE_BOTTOM_WALLS = [78, 79, 80];
  static TILE_LEFT_WALLS = [76, 95, 114];
  static TILE_RIGHT_WALLS = [77, 96, 115];
  static TILE_FLOORS = [
    6, 7, 8, 9, 10, 11, 12, 25, 26, 27, 28, 29, 30, 31, 44, 45, 46, 47, 48, 49,
    50, 63, 64, 65, 66, 67, 68, 69, 87, 88, 106, 107,
  ];

  /**
   * Creates a new room with random layout.
   * @param {Player} player The player character
   * @param {boolean} isShifting Whether camera is transitioning
   */
  constructor(player, isShifting = false) {
    this.player = player;
    this.player.room = this;
    this.dimensions = new Vector(Room.WIDTH, Room.HEIGHT);
    
    // Load tile sprites
    this.sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Tiles),
      Tile.TILE_SIZE,
      Tile.TILE_SIZE
    );
    
    // Generate room contents
    this.tiles = this.generateWallsAndFloors();
    this.entities = this.generateEntities();
    this.doorways = this.generateDoorways();
    this.objects = this.generateObjects();
    this.renderQueue = this.buildRenderQueue();

    // For drawing when shifting between rooms
    this.adjacentOffset = new Vector();

    this.isShifting = isShifting;
  }

  /**
   * Updates all entities and objects in the room.
   */
  update(dt) {
    this.renderQueue = this.buildRenderQueue();
    this.cleanUpEntities();
    this.cleanUpObjects();
    this.updateEntities(dt);
    this.updateObjects(dt);
  }

  /**
   * Renders tiles, then all entities and objects in correct order.
   */
  render() {
    this.renderTiles();

    this.renderQueue.forEach((elementToRender) => {
      elementToRender.render(this.adjacentOffset);
    });
  }

  /**
   * Sorts entities and objects by their Y position for proper layering.
   * Things lower on screen appear in front of things higher up.
   * @returns {Array} Sorted array of things to render
   */
  buildRenderQueue() {
    return [...this.entities, ...this.objects].sort((a, b) => {
      let order = 0;
      const bottomA = a.hitbox.position.y + a.hitbox.dimensions.y;
      const bottomB = b.hitbox.position.y + b.hitbox.dimensions.y;

      // First sort by render priority
      if (a.renderPriority < b.renderPriority) {
        order = -1;
      } else if (a.renderPriority > b.renderPriority) {
        order = 1;
      } 
      // Then by Y position (for depth illusion)
      else if (bottomA < bottomB) {
        order = -1;
      } else {
        order = 1;
      }

      return order;
    });
  }

  /**
   * Removes dead enemies from the room.
   */
  cleanUpEntities() {
    this.entities = this.entities.filter((entity) => !entity.isDead);
  }

  /**
   * Updates all entities - handles combat and collision.
   */
  updateEntities(dt) {
    this.entities.forEach((entity) => {
      // Kill entity if health is 0
      if (entity.health <= 0) {
        if (!entity.isDead && entity.onDeath) {
          entity.onDeath(); // Might drop items
        }
        entity.isDead = true;
      }

      // Don't update player while room is transitioning
      if (!this.isShifting || (this.isShifting && entity !== this.player)) {
        entity.update(dt);
      }

      // Check collisions with all objects
      this.objects.forEach((object) => {
        if (object.didCollideWithEntity(entity.hitbox)) {
          if (object.isCollidable) {
            object.onCollision(entity);
          }
          // Let player pick up consumable items
          if (
            object.isConsumable &&
            !object.wasConsumed &&
            entity instanceof Player
          ) {
            object.onConsume(entity);
            object.cleanUp = true;
          }
        }
      });
      
      // Don't check player against itself
      if (entity === this.player) {
        return;
      }

      // Check if enemy was hit by sword
      if (entity.didCollideWithEntity(this.player.swordHitbox)) {
        entity.receiveDamage(this.player.damage);
      }

      // Check if enemy hit player
      if (
        !entity.isDead &&
        this.player.didCollideWithEntity(entity.hitbox) &&
        !this.player.isInvulnerable
      ) {
        this.player.receiveDamage(entity.damage);
        this.player.becomeInvulnerable();
      }
    });
  }

  /**
   * Updates all objects like switches and pots.
   */
  updateObjects(dt) {
    this.objects.forEach((object) => {
      object.update(dt);
    });
  }

  /**
   * Renders all floor and wall tiles.
   */
  renderTiles() {
    this.tiles.forEach((tileRow) => {
      tileRow.forEach((tile) => {
        tile.render(this.adjacentOffset);
      });
    });
  }

  /**
   * Creates the walls and floor for the room.
   * Uses random tiles for variety.
   * @returns {Array} 2D array of tile objects
   */
  generateWallsAndFloors() {
    const tiles = new Array();

    for (let y = 0; y < this.dimensions.y; y++) {
      tiles.push([]);

      for (let x = 0; x < this.dimensions.x; x++) {
        let tileId = Room.TILE_EMPTY;

        // Place corners
        if (x === 0 && y === 0) {
          tileId = Room.TILE_TOP_LEFT_CORNER;
        } else if (x === 0 && y === this.dimensions.y - 1) {
          tileId = Room.TILE_BOTTOM_LEFT_CORNER;
        } else if (x === this.dimensions.x - 1 && y === 0) {
          tileId = Room.TILE_TOP_RIGHT_CORNER;
        } else if (x === this.dimensions.x - 1 && y === this.dimensions.y - 1) {
          tileId = Room.TILE_BOTTOM_RIGHT_CORNER;
        }
        // Place walls with gaps for doorways
        else if (x === 0) {
          // Left wall - leave space for door
          if (
            y === Math.floor(this.dimensions.y / 2) ||
            y === Math.floor(this.dimensions.y / 2) + 1
          ) {
            tileId = Room.TILE_EMPTY;
          } else {
            tileId =
              Room.TILE_LEFT_WALLS[
                Math.floor(Math.random() * Room.TILE_LEFT_WALLS.length)
              ];
          }
        } else if (x === this.dimensions.x - 1) {
          // Right wall - leave space for door
          if (
            y === Math.floor(this.dimensions.y / 2) ||
            y === Math.floor(this.dimensions.y / 2) + 1
          ) {
            tileId = Room.TILE_EMPTY;
          } else {
            tileId =
              Room.TILE_RIGHT_WALLS[
                Math.floor(Math.random() * Room.TILE_RIGHT_WALLS.length)
              ];
          }
        } else if (y === 0) {
          // Top wall - leave space for door
          if (x === this.dimensions.x / 2 || x === this.dimensions.x / 2 - 1) {
            tileId = Room.TILE_EMPTY;
          } else {
            tileId =
              Room.TILE_TOP_WALLS[
                Math.floor(Math.random() * Room.TILE_TOP_WALLS.length)
              ];
          }
        } else if (y === this.dimensions.y - 1) {
          // Bottom wall - leave space for door
          if (x === this.dimensions.x / 2 || x === this.dimensions.x / 2 - 1) {
            tileId = Room.TILE_EMPTY;
          } else {
            tileId =
              Room.TILE_BOTTOM_WALLS[
                Math.floor(Math.random() * Room.TILE_BOTTOM_WALLS.length)
              ];
          }
        } else {
          // Random floor tile
          tileId =
            Room.TILE_FLOORS[
              Math.floor(Math.random() * Room.TILE_FLOORS.length)
            ];
        }

        tiles[y].push(
          new Tile(
            x,
            y,
            Room.RENDER_OFFSET_X,
            Room.RENDER_OFFSET_Y,
            this.sprites[tileId]
          )
        );
      }
    }

    return tiles;
  }

  /**
   * Creates enemies to populate the room.
   * All enemies in a room are the same type.
   * @returns {Array} Array of enemy entities
   */
  generateEntities() {
    const entities = new Array();
    const sprites = Sprite.generateSpritesFromSpriteSheet(
      images.get(ImageName.Enemies),
      Tile.TILE_SIZE,
      Tile.TILE_SIZE
    );

    // Pick one enemy type for this room
    const enemyType = EnemyType[pickRandomElement(Object.keys(EnemyType))];

    // Spawn 10 enemies
    for (let i = 0; i < 10; i++) {
      const enemy = EnemyFactory.createInstance(enemyType, sprites);
      enemy.room = this;
      entities.push(enemy);
    }

    entities.push(this.player);

    return entities;
  }

  /**
   * Creates interactive objects like switches and pots.
   * @returns {Array} Array of game objects
   */
  generateObjects() {
    const objects = [];

    // Add switch to open doors
    objects.push(
      new Switch(
        new Vector(Switch.WIDTH, Switch.HEIGHT),
        new Vector(
          getRandomPositiveInteger(
            Room.LEFT_EDGE + Switch.WIDTH,
            Room.RIGHT_EDGE - Switch.WIDTH * 2
          ),
          getRandomPositiveInteger(
            Room.TOP_EDGE + Switch.HEIGHT,
            Room.BOTTOM_EDGE - Switch.HEIGHT * 2
          )
        ),
        this
      )
    );

    // Add 3-5 pots randomly placed
    const potCount = getRandomPositiveInteger(3, 5);
    const MIN_DISTANCE = 32; // Pots must be at least 2 tiles apart
    let attempts = 0;
    const MAX_ATTEMPTS = 50; // Prevent infinite loop

    for (let i = 0; i < potCount && attempts < MAX_ATTEMPTS; i++) {
      attempts++;

      // Try a random position
      const newPosition = new Vector(
        getRandomPositiveInteger(
          Room.LEFT_EDGE + Pot.WIDTH,
          Room.RIGHT_EDGE - Pot.WIDTH * 2
        ),
        getRandomPositiveInteger(
          Room.TOP_EDGE + Pot.HEIGHT,
          Room.BOTTOM_EDGE - Pot.HEIGHT * 2
        )
      );

      // Check if this spot is too close to other pots
      let tooClose = false;
      for (let obj of objects) {
        if (obj instanceof Pot) {
          const distance = Math.sqrt(
            Math.pow(newPosition.x - obj.position.x, 2) +
              Math.pow(newPosition.y - obj.position.y, 2)
          );

          if (distance < MIN_DISTANCE) {
            tooClose = true;
            i--; // Try this pot again
            break;
          }
        }
      }

      // Only add pot if it's not too close to others
      if (!tooClose) {
        objects.push(new Pot(newPosition));
      }
    }

    // Add doorways last
    objects.push(...this.doorways);

    return objects;
  }

  /**
   * Creates doorways on all four sides of the room.
   * @returns {Array} Array of doorway objects
   */
  generateDoorways() {
    const doorways = [];

    doorways.push(
      new Doorway(
        Doorway.getDimensionsFromDirection(Direction.Up),
        Doorway.getPositionFromDirection(Direction.Up),
        Direction.Up,
        this
      )
    );
    doorways.push(
      new Doorway(
        Doorway.getDimensionsFromDirection(Direction.Down),
        Doorway.getPositionFromDirection(Direction.Down),
        Direction.Down,
        this
      )
    );
    doorways.push(
      new Doorway(
        Doorway.getDimensionsFromDirection(Direction.Left),
        Doorway.getPositionFromDirection(Direction.Left),
        Direction.Left,
        this
      )
    );
    doorways.push(
      new Doorway(
        Doorway.getDimensionsFromDirection(Direction.Right),
        Doorway.getPositionFromDirection(Direction.Right),
        Direction.Right,
        this
      )
    );

    return doorways;
  }

  /**
   * Opens all doorways in the room.
   */
  openDoors() {
    this.doorways.forEach((doorway) => {
      doorway.open();
    });
  }

  /**
   * Closes all doorways in the room.
   */
  closeDoors() {
    this.doorways.forEach((doorway) => {
      doorway.close();
    });
  }

  /**
   * Removes objects marked for cleanup (like picked up hearts).
   */
  cleanUpObjects() {
    this.objects = this.objects.filter((object) => !object.cleanUp);
  }
}
