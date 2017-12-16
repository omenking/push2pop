import game                     from 'core/game'
import CoreGarbage              from 'core/garbage'
import CoreStage                from 'core/stage'

import ComponentPlayfieldCountdown from 'components/playfield_countdown'
import ComponentPlayfieldCursor    from 'components/playfield_cursor'
import ComponentPlayfieldWall      from 'components/playfield_wall'
import ComponentScore              from 'components/score'
import ComponentPanel              from 'components/panel'
import ComponentCharacter          from 'components/character'
import ComponentAi                 from 'components/ai'

import { i2xy, xy2i } from 'core/filters';

import {
  ROWS_INV,
  ROWS,
  COLS,
  PANELS,
  UNIT,
  TIME_PUSH,
  STOPTIME,
  GARBAGE_SHAKE
} from 'core/data';

export default class Playfield {
  get [Symbol.toStringTag](){ return 'Playfield' }

  public  pi                : number  // player number, used to detect input
  private rows              : number
  private cols              : number
  private combo             : number
  private chain             : number

  public  stage      : any //CoreStage
  private garbage    : CoreGarbage
  public  countdown  : ComponentPlayfieldCountdown
  public  cursor     : ComponentPlayfieldCursor
  private wall       : ComponentPlayfieldWall
  private score_lbl  : ComponentScore
  private ai         : ComponentAi
  public  character  : ComponentCharacter

  public  should_push      : boolean
  public  should_countdown : boolean
  private height : number
  private width : number
  public x : number
  public y : number
  public layer_block : Phaser.Group
  public layer_cursor : Phaser.Group

  public swap_counter : number

  public  clearing          : Array<ComponentPanel>
  /* array of panels grouped by number based on tick */
  public  clearing_garbage  : Array<number>
  private score             : number
  private has_ai            : boolean
  private land              : boolean

  public _stack    : Array<ComponentPanel>
  private _stoptime : number
  private _shake    : number
  private _counter  : number
  private _pushing  : boolean
  private _push_counter  : number

  constructor(pi){
    if (pi !== 0 && pi !== 1){
      throw new Error("player_number present and must be 0 or 1")
    }

    this.pi = pi
    this.garbage    = new CoreGarbage()
    this.countdown  = new ComponentPlayfieldCountdown()
    this.cursor     = new ComponentPlayfieldCursor()
    this.wall       = new ComponentPlayfieldWall()
    this.score_lbl  = new ComponentScore()
    this.ai         = new ComponentAi()
    this.character     = new ComponentCharacter()
  }

  get stoptime() { return this._stoptime }
  set stoptime(v) { this._stoptime = v }

  get shake() { return this._shake }
  set shake(v) { this._shake = v }

  get counter() { return this._counter }
  set counter(v) { this._counter = v }

  get push_counter() { return this._push_counter }
  set push_counter(v) { this._push_counter = v }

  get pushing() { return this._pushing }
  set pushing(v) { this._pushing = v }

  get stack(){
    return this._stack
  }

  stack_i(i){
    return this._stack[i]
  }

  stack_xy(x: number, y: number) {
    return this._stack[xy2i(x,y)]
  }

  get snap() {
    const snap_cursor = this.cursor.snap
    const snap_countdown = this.countdown.snap
    const snap_stack  = []
    for (let panel of this.stack){
      snap_stack.push(panel.snap)
    }
    return [
      this.push_counter,
      snap_cursor,
      snap_stack,
      snap_countdown,
      this.pushing,
      this.character.snap
    ]
  }
  load(snapshot) {
    this.push_counter = snapshot[0]
    this.cursor.load(   snapshot[1])
    for (let i = 0; i < this.stack_len; i++) {
      this.stack_i(i).load(snapshot[2][i])
    }
    this.countdown.load(snapshot[3])
    this.pushing = snapshot[4]
    this.character.load(snapshot[5])
  }
  create(stage,opts) {
    if (stage === null) {
      throw new Error("must pass stage")
    }
    if (opts           === null ||
        opts.x         === null ||
        opts.y         === null ||
        opts.countdown === null ||
        opts.panel     === null){
      throw new Error("must pass at least x,y,countdown and panels")
    }


    this.stage            = stage
    this.should_push      = opts.push      || false
    this.should_countdown = opts.countdown || false

    this.height = (ROWS+1) * UNIT
    this.width  = COLS     * UNIT

    this.x = opts.x
    this.y = opts.y

    this.layer_block  = game.add.group()
    this.layer_block.x  = this.x
    this.layer_block.y  = this.y - (ROWS_INV*UNIT)

    this.create_stack(opts.panels)

    this.score        = 0
    this.chain        = 0
    this.push_counter = TIME_PUSH
    this.stoptime     = STOPTIME

    if (this.stage.cpu[1] !== null){
      this.garbage.create(this.stage,this.pi)
      this.clearing_garbage = []
    }

    //this.score_lbl.create()
    // for mode_puzzle, couting all swaps
    this.swap_counter = 0;
    this.character.create(
      "zephyr",
      game.world.centerX - 30,
      game.world.centerY - 100,
      this.pi
    );
  }

  create_after() {
    this.layer_cursor = game.add.group()
    this.layer_cursor.x = this.x
    this.layer_cursor.y = this.y

    this.countdown.create(this)
    this.cursor.create(this)
    if (this.has_ai) { this.ai.create(this, this.cursor) }
    this.wall.create(this,this.x,this.y)
  }
  create_stack(data){
    this._stack = []
    this.create_panels()
    this.fill_panels(data)
  }

  get stack_len() {
    return this._stack.length
  }
  get stack_size() {
    return this.should_push ? this.stack_len-COLS : this.stack_len
  }

  push() {
    let i;
    // move all panels up the stack
    const stack = new Array(this.stack_len)
    for (i = COLS; i < this.stack_len; i++) {
      let [x,y] = Array.from(i2xy(i-COLS))
      stack[i-COLS] = this._stack[i]
      stack[i-COLS].x = x
      stack[i-COLS].y = y
    }
    this._stack = stack

    this.create_newline()

    if (this.cursor.y > 0) { this.cursor.y--; }
    return 1
  }
  create_newline(){
    if (!this.should_push) { return; }
    const rows = (ROWS + (this.should_push ? 1 : 0 ))

    // create panels
    for (let i = PANELS; i < PANELS+COLS; i++){
      const [x,y] = Array.from(i2xy(i))
      this._stack[i] = new ComponentPanel()
      this.stack_i(i).create(this, x, y)
    }
    // fill panels
    for (let i = PANELS; i < PANELS+COLS; i++){
      this.stack_i(i).set_kind('unique')
    }
  }

  game_over() {
    this.stage.state = 'gameover'
    this.push_counter = 0
  }

  create_panels(){
    const rows = (ROWS + (this.should_push === true ? 1 : 0 ))
    const size = COLS * rows
    this._stack = new Array().fill(null)

    for (let i = 0; i < size; i++){
      const [x,y] = Array.from(i2xy(i))
      this._stack[i] = new ComponentPanel()
      this.stack_i(i).create(this, x, y)
    }
  }

  /**
   * Sets the Stack Panels to data given by the parameter.
   * Also if a push call was made it also sets the bottom row to unique - not comboable
   *
   * @param {Array} data the panel.kind data from 0 to ~10 or nulls = empty
   */
  fill_panels(data) {
    this.stack.forEach((panel, i) => { panel.set_kind(data[i]); });

    if (this.should_push)
      for (let i = PANELS; i < PANELS+COLS; i++)
        this.stack_i(i).set_kind('unique');
  }

  update_stack() {
    for (let i = 0; i < this.stack_len; i++) {
      this.stack_i((this.stack_len-1)-i).update()
    }
  }

  /**
   * Resets this playfields stack to the new given data
   * Resets the swap_counter - puzzle mode
   *
   * @param {Array} new_Panels the panels the stack should reset to
   * @param {integer} new_counter_size size that the swap_counter should be set to
   */
  reset_stack(new_Panels, new_counter_size = 0) {
    this.stack.forEach((panel) => { panel.soft_reset() })
    this.swap_counter = new_counter_size
    this.fill_panels(new_Panels)
  }

  /**
   * checks if the stack has only empty panels
   * @returns true when the whole stack consists of empty block
   */
  stack_is_empty() {
    for (var i = 0; i < PANELS; i++)
      if (!this.stack_i(i).empty)
        return false;
    return true;
  }

  chain_and_combo() {
    let i, panel
    for (i = 0; i < this.stack_size; i++) {
      this.stack_i(i).chain_and_combo()
    }

    const combo = this.clearing.length
    let   chain = 0
    for (let panel of this.clearing){
      panel.popping(this.clearing.length)
    if (panel.chain > 0) { /*console.log(panel.chain)*/ }
      chain = Math.max(chain,panel.chain)
    }
    for (let panel of this.clearing){ panel.chain = chain }
    return [combo, chain]
  }

  /**
   * Calls the swap Method through the given parameters on the internal stack.
   * Only able to swap if both Panels are swappable.
   * A swap_counter goes up that counts all swaps (no swaps done when both panels are empty).
   *
   * @param {integer} x xpos to be accessed in the stack - 2D Array whise
   * @param {integer} y ypos to be accessed in the stack - 2D Array whise
   */
  swap(x,y) {
    let panelLeft   = this.stack_xy(x, y);
    let panelRight  = this.stack_xy(x + 1, y);

    if (panelLeft.swappable && panelRight.swappable) {
      panelLeft.swap();

      if (!panelLeft.empty && !panelRight.empty ) {
        this.swap_counter++;
        return true;
      }
    }
  }

  danger(within) {
    const offset = COLS*(within+ROWS_INV);
    const cols   = [];
    for (let i = 0; i < COLS; i++){
      if (this.stack_i(offset+i)         &&
         (this.stack_i(offset+i).kind >= 0) &&
         (this.stack_i(offset+i).kind !== null)) {
        cols.push(i)
      }
    }
    if (cols.length > 0) { return cols; } else { return false; }
  }
  /* The tick function is the main function of the TaGame object.
   * It gets called every tick and executes the other internal functions.
   * It will update the grid,
   * calculate the current score,
   * spawn possible garbage,
   * updates the sprites to the correct locations in the canvas.
   */
  update_push(danger) {
    if (!this.should_push) {return}
    if (this.pushing) {
      this.push_counter -= 100
    } else {
      this.push_counter--
    }
    /* ensure push_counter never goes into the negative */
    if (this.push_counter < 0)
      this.push_counter = 0

    if (this.push_counter <= 0 && !danger) {
      this.pushing        = false
      this.push_counter   = TIME_PUSH
      this.score         += this.push()
    }
  }
  score_combo(combo) {
    switch (combo) {
      case 4: return 20;
      case 5: return 30;
      case 6: return 50;
      case 7: return 60;
      case 8: return 70;
      case 9: return 80;
      case 10: return 100;
      case 11: return 140;
      case 12: return 170;
      default:
        return 0;
    }
  }
  score_chain(chain) {
    switch (chain) {
      case 2:  return 50;
      case 3:  return 80;
      case 4:  return 150;
      case 5:  return 300;
      case 6:  return 400;
      case 7:  return 500;
      case 8:  return 700;
      case 9:  return 900;
      case 10: return 1100;
      case 11: return 1300;
      case 12: return 1500;
      case 13: return 1800;
      default:
        return 0;
    }
  }
  update_score(combo,chain) {
    if (combo > 0) {
      this.score += combo * 10
      this.score += this.score_combo(combo)
      if (chain) {
        this.score += this.score_chain(chain)
      }
    }
  }
  update_garbage_clearing(){
    if (this.clearing_garbage.length > 0){
      for (let panel of this.stack){
        panel.garbage.popping()
      }
    }
  }
  render_stack() {
    for (let panel of this.stack){
      panel.render()
    }
  }
  render() {
    this.cursor.render()
    this.wall.render()
    this.render_stack()
    this.character.render()

    let shake = 0
    if (this.shake >= 0 && this.counter > 0) {
      const shake_i  = GARBAGE_SHAKE[this.shake].length-this.counter
      shake = GARBAGE_SHAKE[shake][shake_i]
    }

    const y = this.y - (ROWS_INV*UNIT)
    if (this.should_push) {
      const lift = (this.push_counter / TIME_PUSH) * UNIT
      this.layer_block.y  = y + lift + shake
      this.layer_cursor.y = y + lift + shake
    } else {
      this.layer_block.y  = y + shake
      this.layer_cursor.y = y + shake
    }
  }
  update() {
    this.countdown.update()
    this.cursor.update()

    //this.score_lbl.update(this.chain, this.score)
    let danger = null
    if (this.stage.state === 'running'){
      danger = this.danger(0)
      if (danger && this.push_counter <= 0) {
        this.stoptime--
        this.character.current_animation = "losing"
        console.log('stoptime',this.stoptime)
        if (this.stoptime <= 0){
          this.stage.game_over(this.pi)
        }
      } else {
        this.stoptime = STOPTIME
      }
    }

    if (this.stage.state === 'gameover') {
      this.wall.update()
    }
    if (this.stage.state !== 'running') { return; }

    if (this.counter > 0) { this.counter-- }
    this.update_push(danger)
    this.clearing         = []
    this.clearing_garbage = []

    this.update_stack()
    if (this.has_ai) { this.ai.update() }
    // combo n chain
    const cnc = this.chain_and_combo()
    if (cnc[1] > 1)
      this.character.current_animation = "charge"

    if (this.stage.cpu[1] !== null) { // if no second player, don't bother with garbage
      this.update_garbage_clearing()
      this.garbage.update(cnc[0],cnc[1])
    }
    this.update_score(cnc[0],cnc[1])

    if (this.land === true) {
      game.sounds.land()
      this.land = false
    }
  }

  shutdown() {
    return this.cursor.shutdown()
  }
}
