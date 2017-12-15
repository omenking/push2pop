import game from 'core/game'
import blank                  from 'components/panel_blank'
import ComponentBaubleChain   from 'components/bauble'
import ComponentPanelGarbage  from 'components/panel_garbage'
import ComponentPanelParticle from 'components/panel_particle'
import ComponentPlayfield     from 'components/playfield'
import * as ss from 'shuffle-seed'
import { out_of_bounds } from 'core/filters';
import {
  UNIT,
  SWAP_L,
  SWAP_R,
  SWAPPING_L,
  SWAPPING_R,
  STATIC,
  HANG,
  FALL,
  LAND,
  GARBAGE,
  CLEAR,
  PANELS,
  COLS,
  ROWS_INV,
  ROWS,
  FRAME_LAND,
  FRAME_CLEAR,
  FRAME_LIVE,
  FRAME_DANGER,
  FRAME_DEAD,
  FRAME_NEWLINE,
  TIME_SWAP,
  TIME_CLEAR,
  TIME_POP,
  TIME_FALL,
  TIME_PARTICLE
} from 'core/data';

/**
 *
 */
export default class ComponentPanel {
  get [Symbol.toStringTag](){ return 'Panel' }

  private _kind         : number
  private _counter      : number
  private _state        : Symbol
  private _chain        : number
  private bauble_chain  : ComponentBaubleChain
  public garbage        : ComponentPanelGarbage
  public playfield      : ComponentPlayfield
  public x              : number
  public y              : number
  private sprite        : Phaser.Sprite
  private group         : number
  public time_cur       : number
  private time_pop      : number
  private particles     : Array<ComponentPanelParticle>
  public clear_i        : number
  public clear_len      : number
  private _state_timer   : number
  private state_enter   : any
  private state_execute : any
  private state_exit    : any


  get kind ()   { return this._kind }
  set kind (val){ this._kind = val }

  /**
   *  The panel's counter does two things
   *
   *  1. It keeps track of the index of a panel's animation in `animate()`
   *  2. It's the timer used to determine when to change a panel's state in `update()`
   *
   *  @type {number}
   */
  get counter()    {return this._counter }
  set counter(val) {       this._counter = val }

  get state()    {
    return this._state 
  }
  set state(val) {
    this._state = val 
  }

  get state_timer() { return this._state_timer }
  set state_timer(val) { this._state_timer = val }

  get chain()    {return this._chain }
  set chain(val) { this._chain = val }

  get  left() { return out_of_bounds(this.x-1,this.y)   ? blank : this.playfield.stack_xy(this.x-1,this.y)   }
  get right() { return out_of_bounds(this.x+1,this.y)   ? blank : this.playfield.stack_xy(this.x+1,this.y)   }
  get under() { return out_of_bounds(this.x  ,this.y+1) ? blank : this.playfield.stack_xy(this.x  ,this.y+1) }
  get above() { return out_of_bounds(this.x  ,this.y-1) ? blank : this.playfield.stack_xy(this.x  ,this.y-1) }

  get  left2() { return out_of_bounds(this.x-2,this.y) ? blank : this.playfield.stack_xy(this.x-2,this.y)  }
  get right2() { return out_of_bounds(this.x+2,this.y) ? blank : this.playfield.stack_xy(this.x+2,this.y)  }
  get under2() { return out_of_bounds(this.x,this.y+2) ? blank : this.playfield.stack_xy(this.x  ,this.y+2)}
  get above2() { return out_of_bounds(this.x,this.y-2) ? blank : this.playfield.stack_xy(this.x  ,this.y-2)}

  /** */
  constructor() {
    this.bauble_chain  = new ComponentBaubleChain()
    this.garbage       = new ComponentPanelGarbage()

    // each panel has 5 particles - in create these are set to follow a circular path!
    this.particles = [];
    for (let i = 0; i < 5; i++)
      this.particles[i] = new ComponentPanelParticle();
  }

  /** */
  get snap() {
    let snap_particles = []
    this.particles.forEach((particle, i) => {
      snap_particles[i] = particle.snap
    })

    return [
      this.x,
      this.y,
      this.kind,
      this.state,
      this.counter,
      this.chain,
      this.garbage.snap,
      this.group,
      snap_particles
    ]
  }

  /** */
  load(data) {
    this.x       = data[0]
    this.y       = data[1]
    this.kind    = data[2]
    this.state   = data[3]
    this.counter = data[4]
    this.chain   = data[5]
    this.garbage.load(data[6])
    this.group   = data[7]
    if (data[8]){
      this.particles.forEach((particle, i) => {
        particle = data[8][i]
      })
    }
  }

  /** */
  create(playfield, x, y) {
    /************************************************
    * STATE MACHINE
    ************************************************/
    this.state_enter   = new Map()
    this.state_execute = new Map()
    this.state_exit    = new Map()

    this.state_execute.set(SWAP_L    , this.swap_l_execute.bind(this))
    this.state_execute.set(SWAP_R    , this.swap_r_execute.bind(this))
    this.state_enter.set(  SWAPPING_L, this.swapping_l_enter.bind(this))
    this.state_execute.set(SWAPPING_L, this.swapping_l_execute.bind(this))
    this.state_enter.set(  SWAPPING_R, this.swapping_r_enter.bind(this))
    this.state_execute.set(SWAPPING_R, this.swapping_r_execute.bind(this))
    this.state_execute.set(STATIC    , this.static_execute.bind(this))
    this.state_enter.set(  HANG      , this.hang_enter.bind(this))
    this.state_execute.set(HANG      , this.hang_execute.bind(this))
    this.state_execute.set(FALL      , this.fall_execute.bind(this))
    this.state_enter.set(  CLEAR     , this.clear_enter.bind(this))
    this.state_execute.set(CLEAR     , this.clear_execute.bind(this))
    this.state_exit.set(   CLEAR     , this.clear_exit.bind(this))
    this.state_enter.set(  LAND      , this.land_enter.bind(this))
    this.state_execute.set(LAND      , this.land_execute.bind(this))

    this.playfield = playfield
    this.counter   = 0
    this.kind = null
    this.x = x;
    this.y = y;
    this.state = STATIC
    this.chain = 0

    this.sprite = game.make.sprite(this.x * UNIT, this.y * UNIT, 'panels',0);
    this.playfield.layer_block.add(this.sprite)
    // shouldn't have to call visible false
    // here as it should be taken care of in render
    // but without it here, it causes a flicker at
    // start of match. If we can find someone way to
    // move this in the render that would be ideal.
    this.sprite.visible = false

    this.garbage.create(this,this.playfield)
    this.bauble_chain.create(this)

    // circular path is getting set,
    // angle needs to be defined so the particles know where to start properly
    // if type: "normal" you should only define 4 ComponentParticles, not more not less,
    // if type: "rotate" the amount of particles doesnt matter
    let angle = 0;
    let step = (2 * Math.PI) / this.particles.length;
    this.particles.forEach((particle, i) => {
      particle.create({panel: this, type: "rotate", id: i, angle: angle});
      angle += step;
    });
  }

  swap_l_execute    () { if (this.counter <= 0) { this.change_state(SWAPPING_L) } }
  swap_r_execute    () { if (this.counter <= 0) { this.change_state(SWAPPING_R) } }
  land_execute      () { if (this.counter <= 0) { this.change_state(STATIC) } }
  swapping_l_execute() { if (this.counter <= 0) { this.state = STATIC /*TODO: use FSM here*/ } }
  swapping_r_execute() { if (this.counter <= 0) { this.state = STATIC /*TODO: use FSM here*/ } }
  hang_execute      () { if (this.counter <= 0) { this.change_state(FALL) } }

  swapping_r_enter() {
    this.counter = TIME_SWAP
  }

  hang_enter() {
    this.counter = 0
  }

  swapping_l_enter() {
    const i1 = this.kind
    const i2 = this.right.kind
    this.kind       = i2
    this.right.kind = i1
    this.counter = TIME_SWAP
  }

  static_execute() {
    if ((this.under.empty && !this.empty) || this.under.state === HANG) {
      this.change_state(HANG);
    } else if (this.danger && this.counter === 0) {
      // we add 1 otherwise we will miss out on one frame
      // since counter can never really hit zero and render
      this.chain = 0
      this.counter = FRAME_DANGER.length+1
    } else {
      this.chain = 0
    }
  }

  land_enter() {
    this.counter = FRAME_LAND.length
  }

  fall_execute() {
    if (this.counter > 0) { return }
      if (this.under.empty) {
        this.under.kind    = this.kind
        this.under.state   = this.state
        this.under.counter = this.counter
        this.under.chain   = this.chain

        this.kind    = null
        this.state   = STATIC
        this.counter = 0
        this.chain   = 0
      } else {
        this.change_state(LAND);
      }
      //} else if (this.under.state === CLEAR) {
        //this.state = STATIC
      //} else {
        //this.state   = this.under.state
        //this.counter = this.under.counter
        //this.chain   = this.under.chain
      //}
        //this.state   = LAND
        //this.counter = FRAME_LAND.length
  }

  clear_enter() {
    this.chain += 1
    this.playfield.clearing.push(this)
    this.group = this.playfield.stage.tick
  }
  clear_execute() {
    if (this.counter > 0) {
      const [xi,xlen] = this.clear_index
      this.clear_i    = xi
      this.clear_len  = xlen

      const time_max = TIME_CLEAR + (TIME_POP*this.clear_len) + TIME_FALL
      this.time_pop = TIME_CLEAR + (TIME_POP*this.clear_i)
      this.time_cur = time_max - this.counter

      if (this.time_cur === this.time_pop) {
        this.particles.forEach((particle) => {
          particle.counter = TIME_PARTICLE
        });

        game.sounds.pop(this.clear_i)
      }
    } else {
      if (this.above && !this.above.hidden && this.above.state === STATIC)
        this.above.chain += 1
      this.change_state(STATIC)
    }
  }
  clear_exit() {
    this.kind    = null
    this.counter = 0
    this.chain   = 0
    this.group   = null
  }



  set_garbage(group){
    this.state = GARBAGE
    this.garbage.group = group
    this.garbage.state = FALL
  }

  /** resets this panel to a normal state - stops animation usefull for stack resets */
  soft_reset() {
    this.counter = 0;
    this.state = STATIC;
  }

  /** */
  get swappable() {
    return  this.above.state !== HANG &&
            (this.state === STATIC ||
            // LAND will swap but will play must at play least 1 frame.
            (this.state === LAND && this.counter < FRAME_LAND.length)
    )
  }
  /** */
  get support() {  return this.state !== FALL && !this.hidden }
  /** */
  get clearable() {  return this.swappable && this.under.support && !this.hidden }
  /** */
  get comboable() {  return this.clearable || (this.state === CLEAR && this.playfield.clearing.indexOf(this)) && this.state_timer === 0 }
  /** */
  get empty() {      return  this.state === STATIC && this.hidden }
  /** */
  get hidden() {      return (this.kind === null && this.state !== GARBAGE) }

  log() {
    const k = (this.kind === null) ? 'N' : this.kind
    return `${k}`
  }

  /** */
  matched(kind){
    return ((this.left.kind  === kind) && (this.right.kind  === kind)) ||
           ((this.above.kind === kind) && (this.under.kind  === kind)) ||
           ((this.above.kind === kind) && (this.above2.kind === kind)) ||
           ((this.under.kind === kind) && (this.under2.kind === kind)) ||
           ((this.left.kind  === kind) && (this.left2.kind  === kind)) ||
           ((this.right.kind === kind) && (this.right2.kind === kind))
  }
  /** */
  get frame() { return this.sprite.frame }
  /**
   * Sets the current frame based on panel kind
   *
   * We use a spritesheet for all the panels graphics.
   * Each panel kind eg. green, red, blue takes up one row in the spritespeet.
   *
   */
  set frame(i : any) {
    // should not have to parseInt, something is passing in string
    this.sprite.frame = (this.kind * 8) + parseInt(i)
  }
  /** */
  set_kind(i) {
    switch (i) {
      case 'unique':
        this.kind = this.nocombo();
        break;
      default:
        this.kind = i;
        break;
    }
  }

  /**
   * `update(i)` handles the states and its transition to other states.
   * A panel's state will usually change when the panel's `counter`
   * reaches zero.
   *
   */
  update() {
    this.particles.forEach(particle => particle.update())

    if (this.state === GARBAGE) {
      this.garbage.update()
    } else {
      if (this.newline){ return; }
      if (this.counter > 0) { this.counter--}
      this.state_execute.get(this.state)()
    }
    ++this.state_timer
  }

  /**
   * Determines whether a panel should be visible or not
   * at the time of render
   */
  render_visible() {
    if (this.hidden){
      this.sprite.visible = false
    } else if (this.state === CLEAR && this.time_cur >= this.time_pop) {
      this.sprite.visible = false
    } else {
      this.sprite.visible = true
    }
  }
  /**
   * Swaps the this panel with the panel to it's right.
   */
  swap() {
    if (this.hidden && this.right.hidden) { return }

    this.counter        = 0
    this.right.counter  = 0

    this.chain       = 0
    this.right.chain = 0

    this.state       = SWAP_L
    this.right.state = SWAP_R

    game.sounds.swap()
  }
  /**
    Calculates and set the counter for the panel to pop
    @param {{number}} i
  */
  popping(i) {
    this.counter = TIME_CLEAR + (TIME_POP*i) + TIME_FALL
  }

  /**
   * `nocombo()` will return a number that represents a kind of panel
   * that will not result in a combo or the same number above.
   *
   *  eg. Lets say we have the following stack
   * ```js
   *  // 2 0 2
   *  // 1 3 1
   *  // 4 4 *
   * ```
   * Then we expect `nocombo()` to
   * * return either `0,2,3`
   * * and it should not return `4` because that would result in a match
   * * and it should not return `1` because above it there is a `1` above
   *
   * @returns {number} new kind to be set to!
  */
  nocombo() {
    const arr = [0, 1, 2, 3, 4]
    if (this.above.kind){ arr.splice(arr.indexOf(this.above.kind), 1)}
    let values = ss.shuffle(arr,this.playfield.stage.rng())
    return this.kind = values.find((i)=> {
      return this.matched(i) === false
    })
  }

  /**
  * `danger()` will check if the this panel's column
  *  contains any active panel's a few panels from the top.
  *  and if it does it should return true, because this column
  *  in the stack is in danger.
  */
  get danger() {
    return !this.playfield.stack_xy(this.x,1+ROWS_INV).hidden
  }
  /**
  * `dead()` will check if the this panel's column contains
  * an active panel in the first row. If this is the case
  * then the this panel should be considered dead.
  */
  get dead() {
    return !this.playfield.stack_xy(this.x,0+ROWS_INV).hidden
  }
  /**
  * `newline()` checks if this panel is a newline.
  *  A panel is considered a newline when its the last
  *  row in the stack and the playfield should push panels,
  *  When a playfield should push panels it will add an extra
  *  row to the end of stack which for newline.
  */
  get newline() {
    return this.playfield.should_push && this.y === ROWS
  }
  /**
  * `clear()` will change a panel's state to clear.
  * it will also on the same tick push this panel to
  * an array called `clearing`. This clearing array is used
  * to help set the counter time for the entire duration of the clear.
  * You can see this in `Playfield.chain_and_combo` where it will then
  * call `Panel.popping` to set the counter.
  */
  clear() {
    this.change_state(CLEAR)
  }
  /**
   * Checks above and under and then left and right from the current panel.
   * Panels will be added to playfield.clearing to determine combo and chain
   *
   * */
  chain_and_combo() {
    if (!this.comboable) { return }

    if (this.left.comboable  && this.left.kind  === this.kind &&
        this.right.comboable && this.right.kind === this.kind) {
      this.left.clear()
      this.clear()
      this.right.clear()
    }

    if (this.above.comboable  && this.above.kind  === this.kind &&
        this.under.comboable  && this.under.kind  === this.kind) {
      this.above.clear()
      this.clear()
      this.under.clear()
    }
  }

  /**
   * exit old state, enter new state, reset state_timer
   */
  change_state(state) {
    if (this.state === state) { return; }
    this.state_timer = 0
    if (this.state_exit.has(this.state))
      this.state_exit.get(this.state)()
    this.state = state
    if (this.state_enter.has(this.state))
      this.state_enter.get(this.state)()
  }

  /**
   *
   Returns the index of the current panel clearing and amount of panels clearing
   @returns {array} - [index,length]
   */
  get clear_index(){
    if (this.state !== CLEAR) {
      throw(new Error('clear_index called on none CLEAR panel'))
    }
    let panels = []
    for (let p of this.playfield.stack){
      if (p.group === this.group &&
          p.state === CLEAR) {
        panels.push(p)
      }
    }
    return [panels.indexOf(this),panels.length]
  }

  /**
   * `animate()` is responsible for setting the panel's current sprite frame
   *  and in the case of swapping adjusting the sprite's `x` and `y`
   *
   * * newline  - when a panel is on a new line and appears greyed out
   * * dead     - when a panel shows a dead face
   * * danger   - when a panel is in danger it bounces
   * * clear    - when a panel is clearing it flashes and then vanishes
   * * land     - when a panel lands
   * * swapping - when two panels swap
   * * live     - the panel's normal state
   *
   */
  animate(){
    if (this.newline) {
      this.frame = FRAME_NEWLINE
    } else if (this.dead === true && this.playfield.stage.state === 'gameover'){
      this.frame = FRAME_DEAD
    } else if (this.state === CLEAR){
      if (FRAME_CLEAR.length > this.time_cur){
        this.frame = FRAME_CLEAR[this.time_cur]
      }
    } else if (this.state === LAND){
      this.frame = FRAME_LAND[FRAME_LAND.length-this.counter]
    } else if (this.state === SWAPPING_L || this.state === SWAPPING_R){
      let v = (UNIT / TIME_SWAP) * this.counter
      switch (this.state) {
        case SWAPPING_L:
          this.sprite.x += v
          break
        case SWAPPING_R:
          this.sprite.x -= v
          break
      }
      this.frame = FRAME_LIVE
    } else if (this.danger){
      const i = FRAME_DANGER[FRAME_DANGER.length - this.counter+1]
      this.frame = i
    } else {
      this.frame = FRAME_LIVE
    }
  }
  /** */
  render(){
    this.particles.forEach(particle => particle.render())

    this.sprite.x = this.x * UNIT
    this.sprite.y = this.y * UNIT
    this.animate()
    this.render_visible()
    this.bauble_chain.render()
    this.garbage.render()
  }
  /** */
  shutdown(){}
} // klass
