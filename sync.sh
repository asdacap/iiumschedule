#! /bin/sh

rsync -rzcv -e ssh --exclude '/.git' --exclude '/staticsettings/' * root@asdacap.com:/var/www/iiumschedule/application
