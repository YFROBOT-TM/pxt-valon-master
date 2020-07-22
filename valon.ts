/** 
 * @file pxt-valon/valon.ts
 * @brief YFROBOT's VALON makecode library.
 * @n This is a MakeCode graphical programming education robot.
 * 
 * @copyright    YFROBOT,2020
 * @copyright    MIT Lesser General Public License
 * 
 * @author [email](yfrobot@qq.com)
 * @date  2020-07-22
*/

let valoncb: Action
let valonmycb: Action
let valone = "1"
let valonparam = 0
let alreadyInit = 0
let IrPressEvent = 0
const MOTER_ADDRESSS = 0x10


// ultrasonic pin
let valonUltrasonicTrig = DigitalPin.P5
let valonUltrasonicEcho = DigitalPin.P11
let distanceBuf = 0
// motor pin 
let valonMotorLD = DigitalPin.P13
let valonMotorLA = AnalogPin.P14
let valonMotorRD = DigitalPin.P15
let valonMotorRA = AnalogPin.P16
// patrol pin
let valonPatrolLeft = DigitalPin.P1
let valonPatrolMiddle = DigitalPin.P2
let valonPatrolRight = DigitalPin.P8
// rgbled pin
let valonEyesPin = DigitalPin.P11

enum PingUnit {
    //% block="cm"
    Centimeters,
}
enum state {
    state1 = 0x10,
    state2 = 0x11,
    state3 = 0x20,
    state4 = 0x21
}
interface KV {
    key: state;
    action: Action;
}

//% color="#7BD239" weight=10 icon="\uf1b0" block="Valon"
namespace valon {

    let kbCallback: KV[] = []

    export class Packeta {
        public mye: string;
        public myparam: number;
    }

    export enum Motors {
        //% blockId="left motor" block="left"
        ML = 0,
        //% blockId="right motor" block="right"
        MR = 1,
        //% blockId="all motor" block="all"
        MAll = 2
    }

    export enum Dir {
        //% blockId="CW" block="Forward"
        CW = 0x0,
        //% blockId="CCW" block="Backward"
        CCW = 0x1
    }

    export enum Patrol {
        //% blockId="patrolLeft" block="left"
        PatrolLeft = 1,
        //% blockId="patrolMiddle" block="middle"
        PatrolMiddle = 2,
        //% blockId="patrolRight" block="right"
        PatrolRight = 8
    }

    export enum LED {
        //% blockId="LEDLeft" block="left"
        LEDLeft = 10,
        //% blockId="LEDRight" block="right"
        LEDRight = 9
    }

    export enum LEDswitch {
        //% blockId="turnOn" block="ON"
        turnOn = 0x01,
        //% blockId="turnOff" block="OFF"
        turnOff = 0x00
    }

    /**
 * Different modes for RGB or RGB+W NeoPixel strips
 */
    enum EyesMode {
        //% block="GRB"
        RGB = 1,
        //% block="RGB"
        RGB_RGB = 3,
        //% block="RGB+W"
        RGBW = 2
    }

    export enum RGBEYES {
        //% block="left"
        EyesLeft = 1,
        //% block="right"
        EyesRight = 0,
        //% block="all"
        EyesAll = 2
    }
    /**
  * Pre-Defined LED colours
  */
    export enum EyesColors {
        //% block=red
        Red = 0xff0000,
        //% block=orange
        Orange = 0xffa500,
        //% block=yellow
        Yellow = 0xffff00,
        //% block=green
        Green = 0x00ff00,
        //% block=blue
        Blue = 0x0000ff,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xff00ff,
        //% block=white
        White = 0xffffff,
        //% block=black
        Black = 0x000000
    }

    /**
     * Turn on/off the LEDs.
     */
    //% weight=120
    //% blockId=writeLED block="LEDlight |%ledn turn |%ledswitch"
    //% ledn.fieldEditor="gridpicker" ledn.fieldOptions.columns=2 
    //% ledswitch.fieldEditor="gridpicker" ledswitch.fieldOptions.columns=2
    export function writeLED(ledn: LED, ledswitch: LEDswitch): void {
        led.enable(false);
        if (ledn == LED.LEDLeft) {
            pins.digitalWritePin(DigitalPin.P10, ledswitch);
        } else if (ledn == LED.LEDRight) {
            pins.digitalWritePin(DigitalPin.P9, ledswitch);
        } else {
            return
        }
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.max(Math.min(max, value), min);
    }

    /**
     * Set the direction and speed of Valon motor.
     * @param index motor left/right/all
     * @param direction direction to turn
     * @param speed speed of motors (0 to 255). eg: 120
     */
    //% weight=90
    //% blockId=motor_MotorRun block="motor|%index|move|%direction|at speed|%speed"
    //% speed.min=0 speed.max=255
    //% index.fieldEditor="gridpicker" index.fieldOptions.columns=2
    //% direction.fieldEditor="gridpicker" direction.fieldOptions.columns=2
    export function motorRun(index: Motors, direction: Dir, speed: number): void {
        if (index > 2 || index < 0)
            return

        speed = clamp(speed, 0, 255) * 4.01;  // 0~255 > 0~1023

        if (index == valon.Motors.ML) {
            pins.digitalWritePin(valonMotorLD, direction);
            pins.analogWritePin(valonMotorLA, speed);
        } else if (index == Motors.MR) {
            pins.digitalWritePin(valonMotorRD, direction);
            pins.analogWritePin(valonMotorRA, speed);
        } else if (index == Motors.MAll) {
            pins.digitalWritePin(valonMotorRD, direction);
            pins.analogWritePin(valonMotorRA, speed);
            pins.digitalWritePin(valonMotorLD, direction);
            pins.analogWritePin(valonMotorLA, speed);
        }
    }

    /**
     * Stop the Valon motor.
     */
    //% weight=89
    //% blockId=motor_motorStop block="motor |%motor stop"
    //% motor.fieldEditor="gridpicker" motor.fieldOptions.columns=2 
    export function motorStop(motor: Motors): void {
        motorRun(motor, 0, 0);
    }

    /**
     * Read ultrasonic sensor.
     */
    //% blockId=ultrasonic_sensor block="read ultrasonic sensor |%unit "
    //% weight=80
    export function Ultrasonic(unit: PingUnit, maxCmDistance = 500): number {
        let d
        // send pulse
        pins.setPull(valonUltrasonicTrig, PinPullMode.PullNone);
        pins.digitalWritePin(valonUltrasonicTrig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(valonUltrasonicTrig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(valonUltrasonicTrig, 0);

        // read pulse
        // d = pins.pulseIn(valonUltrasonicEcho, PulseValue.High, maxCmDistance * 58);  // 8 / 340 = 
        d = pins.pulseIn(valonUltrasonicEcho, PulseValue.High, 25000);
        let ret = d;
        // filter timeout spikes
        if (ret == 0 && distanceBuf != 0) {
            ret = distanceBuf;
        }
        distanceBuf = d;

        return Math.floor(ret * 9 / 6 / 58);
        // switch (unit) {
        //     case ValonPingUnit.Centimeters: return Math.idiv(d, 58);
        //     default: return d;
        // }
    }

    /**
      * enable line tracking sensor.
      */
    function enablePatrol(enable: number): void {
        pins.digitalWritePin(DigitalPin.P12, enable);
    }

    /**
      * Read line tracking sensor.
      * @param patrol patrol sensor number.
      */
    //% weight=70
    //% blockId=read_Patrol block="read %patrol line tracking sensor"
    //% patrol.fieldEditor="gridpicker" patrol.fieldOptions.columns=2 
    export function readPatrol(patrol: Patrol): number {
        enablePatrol(1);
        if (patrol == Patrol.PatrolLeft) {
            return pins.digitalReadPin(valonPatrolLeft)
        } else if (patrol == Patrol.PatrolMiddle) {
            return pins.digitalReadPin(valonPatrolMiddle)
        } else if (patrol == Patrol.PatrolRight) {
            return pins.digitalReadPin(valonPatrolRight)
        } else {
            return -1
        }
    }


    /**
     *  Create a new NeoPixel driver for eye's LEDs.
     *  @param numleds number of leds in the eyes, eg: 2
     */
    //% blockId="eyes_create" block="RGBEyes init %numleds|leds as %mode"
    //% weight=62  
    //% blockSetVariable=eyes
    export function create(numleds: number, mode: EyesMode): Strip {
        let eyes = new Strip();
        let stride = mode === EyesMode.RGBW ? 4 : 3;
        eyes.buf = pins.createBuffer(numleds * stride);
        eyes.start = 0;
        eyes._length = numleds;
        eyes._mode = mode || EyesMode.RGB;
        eyes._matrixWidth = 0;
        eyes.setBrightness(128)
        eyes.setPin(valonEyesPin)
        return eyes;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * A NeoPixel strip
     */
    export class Strip {
        buf: Buffer;
        D_pin: DigitalPin;
        // TODO: encode as bytes instead of 32bit
        brightness: number;
        start: number;          // start offset in LED strip
        _length: number;        // number of LEDs
        _mode: EyesMode;
        _matrixWidth: number;   // number of leds in a matrix - if any

        /**
         * Set LED to a given color (range 0-255 for r, g, b).
         * @param eyes_n position of the NeoPixel in the strip
         * @param rgb RGB color of the LED. eg: ValonEyesColors.red
         */
        //% blockId="set_eyes_color" block="%eyes|show color at %eyes_n|to %rgb"
        //% strip.defl=eyes
        //% weight=60
        setEyesColor(eyes_n: RGBEYES, rgb: EyesColors): void {
            if (eyes_n == RGBEYES.EyesAll) {
                this.setPixelRGB(RGBEYES.EyesLeft, rgb >> 0);
                this.setPixelRGB(RGBEYES.EyesRight, rgb >> 0);
            } else {
                this.setPixelRGB(eyes_n, rgb >> 0);
            }
            this.show();
        }

        /**
         * Set the brightness of the strip. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% blockId="eyes_set_brightness" block="%eyes|set brightness %brightness" 
        //% strip.defl=eyes
        //% weight=58
        setBrightness(brightness: number): void {
            this.brightness = brightness & 0xff;
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="eyes_clear" block="%eyes|clear"
        //% strip.defl=eyes
        //% weight=55
        clear(): void {
            const stride = this._mode === EyesMode.RGBW ? 4 : 3;
            this.buf.fill(0, this.start * stride, this._length * stride);
        }

        /**
         * Send all the changes to the strip.
         */
        //% blockId="eyes_show" block="%strip|show" 
        //% strip.defl=strip
        //% weight=35
        //% advanced=true
        show() {
            // only supported in beta
            // ws2812b.setBufferMode(this.pin, this._mode);
            ws2812b.sendBuffer(this.buf, this.D_pin);
        }

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b).
         * @param rgb RGB color of the LED
         */
        //% blockId="eyes_set_strip_color" block="%strip|show color %rgb=neopixel_colors"
        //% strip.defl=strip
        //% weight=40
        //% advanced=true
        showColor(rgb: number) {
            rgb = rgb >> 0;
            this.setAllRGB(rgb);
            this.show();
        }

        /**
         * Set LED to a given color (range 0-255 for r, g, b).
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position of the NeoPixel in the strip
         * @param rgb RGB color of the LED
         */
        //% blockId="eyes_set_pixel_color" block="%strip|set pixel color at %pixeloffset|to %rgb=neopixel_colors"
        //% strip.defl=strip
        //% weight=38
        //% advanced=true
        setPixelColor(pixeloffset: number, rgb: number): void {
            this.setPixelRGB(pixeloffset >> 0, rgb >> 0);
        }

        /**
         * Set the pin where the neopixel is connected, defaults to P11.
         */
        setPin(pin: DigitalPin): void {
            this.D_pin = pin;
            pins.digitalWritePin(this.D_pin, 0);
            // don't yield to avoid races on initialization
        }

        private setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (this._mode === EyesMode.RGB_RGB) {
                this.buf[offset + 0] = red;
                this.buf[offset + 1] = green;
            } else {
                this.buf[offset + 0] = green;
                this.buf[offset + 1] = red;
            }
            this.buf[offset + 2] = blue;
        }

        private setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = this.start + this._length;
            const stride = this._mode === EyesMode.RGBW ? 4 : 3;
            for (let i = this.start; i < end; ++i) {
                this.setBufferRGB(i * stride, red, green, blue)
            }
        }
        private setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= this._length)
                return;

            let stride = this._mode === EyesMode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + this.start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = this.brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            this.setBufferRGB(pixeloffset, red, green, blue)
        }
    }


    /**
    * Gets the RGB value of a known color
    */
    //% weight=30  
    //% blockId="eyes_colors" block="%color"
    //% advanced=true
    export function colors(color: EyesColors): number {
        return color;
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% weight=26
    //% blockId="eyes_rgb" block="red %red|green %green|blue %blue"
    //% advanced=true
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

}
