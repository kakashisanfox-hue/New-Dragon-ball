/*:
 *
 * 
 * @plugindesc Give an animation to all enemy battle sprites
 * @author sparacios
 * 
 * @param isAnimated
 * @type boolean
 * @desc if enemy will have animation or not by default
 * OFF - false  ON - true
 * Default: ON
 * @default false
 * 
 * @param columns
 * @type number
 * @desc how many sprites in a animation
 * @min 1
 * Default: 1
 * @default 1
 * 
 * @param rows
 * @type number
 * @desc this feature is currently implemented so it should be set to 1 by default, however this feature is meant to add more animations like attack, etc. currently only 1 animations is allowed(idle)
 * @min 1
 * Default: 1
 * @default 1
 * 
 * @param speed
 * @type number
 * @desc how fast animation will go, lower the number the faster. rpg maker runs at 60 frames per second so if set to 60 you get 1 frame of animation per tick of the game
 * @min 1
 * Default: 12
 * @default 12
 * 
 * @param reversable
 * @type number
 * @desc if 1 the animation will play back once then restarts from begining, if 0 sequential animation
 * Default: 1
 * @default 1
 * 
 * @help
 * 
 * <Animated>  enables animation
 * <Col: #> how many sprites in animations
 * <Row: #> how many different animations for rows
 * <Speed: #> how fast the animation goes, higher the number slower. Rpg maker runs at 60 frames, so if you put 60 it will be 1 frame of animation for 1 frame in game
 * <Reverse: 0 (false), 1 (true)> if true the animation will play back once then restarts from begining
 *  
 */


/*
Todo list
=================================================================================================

got to update these functions
    - updateFrame(make it similar to sprite Actors) (updateMain) done
    - updateStateSprite done
    - startBossCollapse done
    
got to make these functions
    - startMotion CANCEL
    - updateMotionCount CANCEL 
    - refreshMotion CANCEL
    - updateMotion CANCEL
    - startEntryMotion CANCEL
    - updateAnimationCount   new animation method that will handle the speed DONE

===================================================================================================
*/

var aniEny = aniEny || {};
aniEny.AE = aniEny.AE || {};

aniEny.params = aniEny.params || {};
aniEny.parameters = PluginManager.parameters('animatedEnemies');

aniEny.params.IsAnimated = JSON.parse(aniEny.parameters['isAnimated']);
aniEny.params.Columns = Number(aniEny.parameters['columns']);
aniEny.params.Rows = Number(aniEny.parameters['rows']);
aniEny.params.Speeds = Number(aniEny.parameters['speed']);
aniEny.params.Reverable = Number(aniEny.parameters['reversable']);

(function() {
    aniEny.AE.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!aniEny.AE.DataManager_isDatabaseLoaded.call(this)) return false;
        this.processAENoteTag($dataEnemies);
        return true;
    };

    DataManager.processAENoteTag = function(group) {
        for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);

            obj.animatedSprite = aniEny.params.IsAnimated;
            obj.columnAnimation = aniEny.params.Columns;
            obj.rowAnimation = aniEny.params.Rows;
            obj.animationSpd = aniEny.params.Speeds;
            if(aniEny.params.Reverable == 0) {
                obj.reverable = false;
            }else {
                obj.reverable = true;
            }

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                if (line.match(/<(?:ANIMATED|animated)>/i)) {
                    obj.animatedSprite = true;
                }else if (line.match(/<(?:ROW|row):[ ](\d+)>/i)) {
                    obj.rowAnimation = Math.max(1, parseInt(RegExp.$1));
                }else if (line.match(/<(?:COL|col):[ ](\d+)>/i)) {
                    obj.columnAnimation = Math.max(1, parseInt(RegExp.$1));
                }else if (line.match(/<(?:SPEED|speed):[ ](\d+)>/i)) {
                    obj.animationSpd = Math.max(1, parseInt(RegExp.$1));
                }else if (line.match(/<(?:REVERSE|reverse):[ ](\d+)>/i)) {
                    var check = parseInt(RegExp.$1);

                    if(check == 0) {
                        obj.reverable = false;
                    }else {
                        obj.reverable = true;
                    }
                }
            }
        }
    };

    Game_Enemy.prototype.AnimatedIs = function() {
        return this.enemy().animatedSprite;
    };

    Game_Enemy.prototype.getRows = function() {
        return this.enemy().rowAnimation;
    };

    Game_Enemy.prototype.getCols = function() {
        return this.enemy().columnAnimation;
    };

    Game_Enemy.prototype.getSpeed = function() {
        return this.enemy().animationSpd;
    };

    Game_Enemy.prototype.isReversable = function() {
        return this.enemy().reverable;
    };

    // didnt end up using this method for motions but remove it if it causes bugs
    // but i will add it back when i introduce more animations
    Sprite_Enemy.MOTIONS = {
        idle: {index: 0, loop: true}
    };

    aniEny.AE.enemySpriteInit = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        aniEny.AE.enemySpriteInit.call(this);
        this._animationIndex = 0;
        this._animationCount = 0;
        this._reverse = false;
    };

    aniEny.AE.updateSprites = Sprite_Enemy.prototype.update;
    Sprite_Enemy.prototype.update = function() {
        if(this._enemy) {
            this.updateAnimationCounts();
        }

        aniEny.AE.updateSprites.call(this);
    };

    aniEny.AE.Sprite_Enemy_updateFrame = Sprite_Enemy.prototype.updateFrame;
    Sprite_Enemy.prototype.updateFrame = function() {
        if(this._enemy.AnimatedIs()) {
            if(this.bitmap) {
                var cw = this.bitmap.width / this._enemy.getCols();
                var ch = this.bitmap.height / this._enemy.getRows();
                var cx = this._animationIndex;
                var cy = 0;
                if(this._effectType === 'bossCollapse') {
                    this.setFrame(0, 0, this.bitmap.width, this._effectDuration);
                }else if(this._enemy.isActing()) {
                    this.setFrame(0, 0, cw, ch);
                }else {
                    this.setFrame(cw * cx, ch * cy, cw, ch);
                }
            }

        }else {
            aniEny.AE.Sprite_Enemy_updateFrame.call(this);
        }
    };

    Sprite_Enemy.prototype.updateAnimationCounts = function() {
        if(++this._animationCount > this._enemy.getSpeed()) {
            if(this._enemy.isReversable()) {
                if(this._animationIndex < this._enemy.getCols() - 1 && !this._reverse) {
                    this._animationIndex = (this._animationIndex + 1) % this._enemy.getCols();
                }else {
                    this._reverse = true;
                    this._animationIndex--;
                    if(this._animationIndex <= 0) {
                        this._reverse = false;
                        this._animationIndex = 0;
                    }
                }
            }else {
                this._animationIndex = (this._animationIndex + 1) % this._enemy.getCols();
            }
            this._animationCount = 0;
        }
    };

    aniEny.AE.Sprite_enemyStateSpriteUpdates = Sprite_Enemy.prototype.updateStateSprite;
    Sprite_Enemy.prototype.updateStateSprite = function() {
        if(!this._enemy.AnimatedIs()) {
            aniEny.AE.Sprite_enemyStateSpriteUpdates.call(this);
        }else {
            this._stateIconSprite.y = -Math.round(((this.bitmap.height / 1) + 40) * 0.9);
            if (this._stateIconSprite.y < 20 - this.y) {
                this._stateIconSprite.y = 20 - this.y;
            }
        }
    };

    aniEny.AE.bossCollapse = Sprite_Enemy.prototype.startBossCollapse;
    Sprite_Enemy.prototype.startBossCollapse = function() {
        if(!this._enemy.AnimatedIs()) {
            aniEny.AE.prototype.bossCollapse.call(this);
        }else {
            this._effectDuration = this.bitmap.height / 1;
            this._appeared = false;
        }

    };
})();