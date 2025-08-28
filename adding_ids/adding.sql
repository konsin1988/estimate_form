alter table fin.revenue_est_2025 rename to revenue_est_2025_old;
alter table fin.revenue_est_2025_old add column id serial;
alter table fin.revenue_est_2025_old add primary key (id);
create table fin.revenue_est_2025 as (
	select id, company, date_dt, estimate_date, frc, est_amount, hcl_amount, contr_amount
	from fin.revenue_est_2025_old
);
drop table fin.revenue_est_2025_old;

alter table fin.revenue_fact rename to revenue_fact_old;
alter table fin.revenue_fact_old add column id serial;
alter table fin.revenue_fact_old add primary key (id);
create table fin.revenue_fact as (
	select id, date_dt, c_agent, contract, doc, division, frc, nom_g, div_frc, nom_frc, amount
	from fin.revenue_fact_old
);
drop table fin.revenue_fact_old;


alter table fin.revenue_plan_2025 rename to revenue_plan_2025_old;
alter table fin.revenue_plan_2025_old add column id serial;
alter table fin.revenue_plan_2025_old add primary key (id);
create table fin.revenue_plan_2025 as (
	select id, company, date_dt, frc, amount
	from fin.revenue_plan_2025_old
);
drop table fin.revenue_plan_2025_old;
