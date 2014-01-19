import bootstrap
import scheduleformatter
import admincontroller
import themehandler
from bootstrap import app
from staticsettings import DEBUG

bootstrap.app.debug=DEBUG

if(__name__=='__main__'):
    bootstrap.app.run(debug=True)

