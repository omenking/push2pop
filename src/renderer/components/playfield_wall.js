import game from '@/core/game'
import data from '@/core/data'
import filters from '@/core/filters'

const {px} = filters
const {
  WALL_ROLLUP,
  UNIT,
  ROWS_VIS
} = data

export default class ComponentPlayfieldWall {
  create(playfield,x,y){
    this.playfield = playfield
    this.sprite    = game.add.sprite(x, y, `playfield_wall${this.playfield.pi}`)
    this.counter   = 0
  }

  update() {
    if (this.counter < WALL_ROLLUP.length-1) {
      this.counter++
    }
  }

  render() {
    //frame animation offset from from the bottom of the wall
    this.sprite.y = px(this.playfield.y + 168 - WALL_ROLLUP[this.counter])
  }
}
