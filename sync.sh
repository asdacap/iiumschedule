#! /bin/sh

rsync -rzcv -e ssh --exclude '/.git' --exclude '/staticsettings.py' * root@asdacap.com:/var/www/iiumschedule/application
