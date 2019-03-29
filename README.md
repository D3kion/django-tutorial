Deployment instructions:
-------------------------
1. *Create db*
    ```
    $ psql -U postgres
    =# CREATE USER django_user WITH PASSWORD 'supersecret';
    =# CREATE DATABASE django_db WITH OWNER django_user;
    =# \q
    $ psql -U postgres -d django_db -c "CREATE EXTENSION postgis"
    ```

2. *Create venv and install dependecies*
    ```
    $ cd mysite
    $ python -m venv venv
    $ source venv/bin/activate
    $ pip install -r requirements.txt
    ```
    
3. *Configure and run*
    ```
    $ python manage.py migrate
    $ python manage.py initdb
    $ python manage.py compilemessages
    $ python manage.py createsuperuser
    $ python manage.py runserver
    ```

And go to http://127.0.0.1:8000/polls | http://127.0.0.1:8000/admin | http://127.0.0.1:8000/api | http://127.0.0.1:8000/geoapi
