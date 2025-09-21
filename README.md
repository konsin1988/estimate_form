# Estimate form

```This form provides automated collection of revenue forecasts from various financial centers.```

Before this form was developed, people from different departments filled out an Excel file, and then a finance department employee manually transferred the data to a Postgres database and then built dashboards in Metabase.

### This form solves a number of problems associated with collecting forecasts:

- There's no need to send an Excel file to employees and remind them to fill it out: every employee can access this form from our general form, without additional authorization (data in the form is filtered by login, which is transmitted in hashed form in the address bar).

- There is also no need to fill in the same data multiple times: if the forecast data in the department has not changed, then there is no need to fill in anything, the form automatically transfers data from the previous month to the current one (using a script executed from crontab)

- There's no need to manually transfer data to the database: everything is saved automatically, and all data entered across departments is immediately available for dashboard creation and subsequent analysis.

- The financial officer also has the opportunity to view all current forecasts and, if necessary, adjust data from various financial centers.

### Stack:

- Postgres database
- Django backend
- React + Vite + Redux 
- Nginx proxy