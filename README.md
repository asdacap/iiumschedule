Automatic IIUM Schedule Formatter
=================================

These are the source code for the Automatic IIUM Schedule Formatter. See iiumschedule.asdacap.com. It was made open source so that it can benefit other student if they are curious on how do this thing work. Automatic IIUM Schedule Formatter actually consist of three relatively distinct component.

- Automatic IIUM Schedule Formatter
- SemiAutomatic IIUM Schedule Maker
- IIUM Course Schedule Scraper.

Any contribution is highly appreciated, as I don't have much time to do this thing.

Automatic IIUM Schedule Formatter
---------------------------------
Automatic IIUM Schedule formatter reformat the course registration slip/confirmation slip into a day-by-day formatted schedule. You can also customize the schedule to some extend. The customization ability is made using Styler, another project. See http://github.com/asdacap/styler/ . It also have theme gallery. See http://iiumschedule.asdacap.com for usage.

SemiAutomatic IIUM Schedule Maker
--------------------------------
This recently new addition is a single web page application that helps student to arrange their schedule. It fetch course section data stored in the server and list them down. Student can search the course, click add on it and can see the schedule day-by-day clearly, or at least relatively easier. It also have a feature called schedule generator where you select all the course you want to enroll, and it will list down all possible section combination. SemiAutomatic IIUM Schedule Maker is made largely using AngularJs. To use it, go to http://iiumschedule.asdacap.com/schedulemaker/

IIUM Course Schedule Scraper
----------------------------
The schedule maker need section data from IIUM server. The schedule formatter also need the section data in order to show the lecturers name in course information table. The section data need to be obtained somehow. This component do exactly that. It basically scrape from http://itdportal.iium.edu.my/student/schedule1.php, format it, then save it into database. Student who have project which include IIUM section data may find this usefull. For more information, see schedulescraper.py

Hosting
-------

To make it much easier to host it on your machine, I've setup a `docker-compose` configuration. Running it is now as simple as `docker-compose build` and `docker-compose up -d`. By default it will expose the server on port 3070. You can change that in `docker-compose.yml`.

But first, please check and modify `staticsettings.py.docker` accordingly.

To fetch an update from IIUM, run `docker-compose run main python update_course_data.py`.

License
-------
Automatic IIUM Schedule Formatter is licensed under the GNU General Public License version 3. For more information, see COPYING.

Contact
-------
Email me at asdacap@gmail.com
