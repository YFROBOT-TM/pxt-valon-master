// Add your code here
valon.motorRun(valon.Motors.MAll, valon.Dir.CW, 100)
basic.pause(1000)
valon.motorRun(valon.Motors.MAll, valon.Dir.CCW, 100)
basic.pause(1000)

valon.connectIrReceiver(DigitalPin.P3, valon.IrProtocol.NEC)
let eyes = valon.create(2, valon.EyesMode.RGB)
eyes.setEyesColor(valon.RGBEYES.EyesLeft, valon.EyesColors.Red)
eyes.setBrightness(255)
eyes.clear()
eyes.showColor(0)
eyes.setPixelColor(0, 0)
eyes.show()
valon.colors(valon.EyesColors.Red)
valon.rgb(255, 255, 255)
valon.hsl(100, 50, 50)
valon.connectIrReceiver(DigitalPin.P3, valon.IrProtocol.NEC)
valon.onIrButton(valon.IrButton.UP, valon.IrButtonAction.Pressed, function () {
    
})
valon.irButton()

valon.wasAnyIrButtonPressed()
valon.irButtonCode(valon.IrButton.UP)
