import State from "states/panel/state"
import {
  HANG,
} from 'common/data';
import assets from 'core/assets'

export default class StateStatic extends State {
	execute() {
		let under = this.p.neighbors["down"]

		if (under !== undefined) {
			if (!this.p.empty && (under.empty || under.fsm.state === HANG)) {
				this.p.fsm.change_state(HANG)
			}
		}
		else if (this.p.danger && this.p.counter === 0) {
			// we add 1 otherwise we will miss out on one frame
			// since counter can never really hit zero and render
			this.p.chain = 0
			this.p.counter = assets.spritesheets.panels.animations.danger.length+1
		} else {
			this.p.chain = 0
		}
	}
}