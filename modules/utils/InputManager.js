import { config } from '../../../config/config.js';

class InputManager {
    constructor() {
        this.keys = new Set();
        this.touchAreas = {
            up: document.getElementById('touch-up'),
            down: document.getElementById('touch-down'),
            left: document.getElementById('touch-left'),
            right: document.getElementById('touch-right')
        };
    }

    init() {
        if (config.theme.device.isMobile) {
            this.#initTouchEvents();
        } else {
            this.#initKeyEvents();
        }
    }

    #initKeyEvents() {
        document.addEventListener('keydown', e => {
            if (config.game.rune.validKeys.includes(e.key)) {
                this.keys.add(e.key);
            }
        });

        document.addEventListener('keyup', e => this.keys.delete(e.key));
    }

    #initTouchEvents() {
        Object.entries(this.touchAreas).forEach(([direction, element]) => {
            element.addEventListener('touchstart', () => this.keys.add(direction));
            element.addEventListener('touchend', () => this.keys.delete(direction));
        });
    }

    getInput() {
        return [...this.keys].shift();
    }
}

export default InputManager;
