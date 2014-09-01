'''
Copyright (C) 2014 Muhd Amirul Ashraf bin Mohd Fauzi <asdacap@gmail.com>

This file is part of Automatic IIUM Schedule Formatter.

Automatic IIUM Schedule Formatter is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Automatic IIUM Schedule Formatter is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Automatic IIUM Schedule Formatter.  If not, see <http://www.gnu.org/licenses/>.
'''
DB_CONN='postgresql://iiumschedule:iiumschedule@localhost/iiumschedule'
RECAPTCHA_PUBLIC_KEY="6LcfOu0SAAAAAKeyYcuC36_U3yEd_TBK8rlmpCIg"
RECAPTCHA_KEY="6LcfOu0SAAAAABQw2aAP0FePvDrA6X9JN8bG2hMB"
DEBUG=False
LOGIN_USERNAME='iiumschedule'
LOGIN_PASSWORD='admin'
SESSION_SECRET=':\x7f\x8f-\xb1\x19\xd2-\x9a\xdb\xe3Pr\x95\xd5\x0c\xd2\xeb\x1e\x93\xa9\x90\xd5B'
SESSIONS_STILL_UPDATE=['2014/2015']
DEFAULTDATA=open('defaultdata.json').read()
