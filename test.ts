// Add your code here
valon.motorRun(valon.Motors.MAll, valon.Dir.CW, 100)
basic.pause(1000)
valon.motorRun(valon.Motors.MAll, valon.Dir.CCW, 100)
basic.pause(1000)
valon.motorStop(valon.Motors.MAll)

let eyes = valon.create(2, valon.EyesMode.RGB)
eyes.setEyesColor(valon.RGBEYES.EyesAll, valon.EyesColors.Red)
eyes.setBrightness(255)
basic.pause(1000)
eyes.clear()
valon.colors(valon.EyesColors.Green)
eyes.showColor(valon.colors(valon.EyesColors.Green))
basic.pause(500)
valon.rgb(255, 255, 255)
valon.hsl(100, 50, 50)
eyes.setPixelColor(1, valon.colors(valon.EyesColors.Blue))
eyes.setPixelColor(0, valon.colors(valon.EyesColors.Blue))
eyes.show()
basic.pause(500)
valon.connectIrReceiver(DigitalPin.P3, valon.IrProtocol.NEC)