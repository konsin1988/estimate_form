# Форма сбора прогнозов

Стек:
- фронт - react - redux
- бек - django
- таблица в бд - skud_va, fin.revenue_est, fin.revenue_fact, fin.revenue_plan
- пользователи в бд - skud_va, fin.frc_user

```Таблица fin.revenue_est автоматически обновляется каждый месяц и один раз в год с помощью докер образа - estimate-updater.```

```Два раза в месяц формируется автоматическая рассылка по сотрудникам, указанным в таблице fin.frc_user (первого и 6ого числа каждого месяца). За это отвечает образ estimate-mailer```
