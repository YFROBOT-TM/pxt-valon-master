// Add your code here
valon.motorRun(valon.Motors.MAll, valon.Dir.CW, 100)
basic.pause(1000)
valon.motorRun(valon.Motors.MAll, valon.Dir.CCW, 100)
basic.pause(1000)

let eyes = valon.create(2, valon.EyesMode.RGB)
valon.connectIrReceiver(DigitalPin.P3, valon.IrProtocol.NEC)