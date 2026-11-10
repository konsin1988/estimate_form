# estimate-form — Helm chart

Helm chart for deploying the **estimate-form** application (React/Vite frontend
served by nginx + Django REST backend served by gunicorn, external PostgreSQL)
with integrated observability for **Prometheus / Grafana / Loki**.

```
                        ┌────────────────────────────────────────────┐
 Ingress ──────────────►│ frontend pods (nginx)                     │
 (host / TLS)           │  - serves static React build               │
                        │  - /api/ ──► proxy ──► backend service     │
                        │  - nginx-prometheus-exporter sidecar :9113 │
                        └───────────────┬────────────────────────────┘
                                        │
                        ┌───────────────▼────────────────────────────┐
                        │ backend pods (gunicorn, Django)            │
                        │  - API on :8000, /health/ on :8000         │
                        │  - Prometheus metrics on /metrics          │
                        │  - pg_service.conf/.pgpass from Secret     │
                        └───────────────┬────────────────────────────┘
                                        │ libpq service file
                        ┌───────────────▼────────────────────────────┐
                        │ external PostgreSQL 15 (fin schema)        │
                        └────────────────────────────────────────────┘

 Prometheus Operator ──► ServiceMonitors: backend /metrics, exporter :9113
 Promtail / Alloy   ──► collects container stdout (Django + nginx logs) ──► Loki
 Grafana            ──► provisioned dashboard "Estimate Form / Overview"
```

## Prerequisites

- Kubernetes ≥ 1.24, Helm ≥ 3.10
- Images built and pushed to a **private registry** reachable from the cluster
  (see next section)
- **kube-prometheus-stack** installed (Prometheus Operator, Grafana,
  kube-state-metrics):

  ```bash
  helm upgrade --install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
    -n monitoring --create-namespace
  ```

- **Loki + Promtail** (or Grafana Alloy) so container logs are shipped; the app
  already logs to stdout, nothing per-app is required:

  ```bash
  helm upgrade --install loki grafana/loki-stack \
    -n monitoring --set loki.fullnameOverride=loki --set promtail.enabled=true
  ```

## 1. Build and push images

From the repository root (same Dockerfiles that docker-compose uses):

```bash
# Backend (hardened production image, runs as non-root:
# docker/django-prod/Dockerfile)
docker build -f docker/django-prod/Dockerfile -t registry.corp.example.com/team/estimate-form-backend:1.0.0 .

# Frontend (multi-stage: builds Vite app, serves with nginx:
# docker/react/Dockerfile)
# IMPORTANT: build with VITE_API_URL empty (or unset) so the frontend uses
# relative /api/ URLs. In Kubernetes the ingress and the frontend nginx handle
# routing — an absolute URL baked at build time would bypass nginx and CORS.
docker build -f docker/react/Dockerfile \
  --build-arg VITE_API_URL="" \
  -t registry.corp.example.com/team/estimate-form-frontend:1.0.0 .

docker push registry.corp.example.com/team/estimate-form-backend:1.0.0
docker push registry.corp.example.com/team/estimate-form-frontend:1.0.0
```

Point the chart at them with `global.imageRegistry` (and
`global.imagePullSecrets` for the registry credentials), and tag images via
`backend.image.tag` / `frontend.image.tag` (defaults: the chart `appVersion`).

## 2. Configure

Copy the example and fill in the placeholder values:

```bash
cp deploy/estimate-form/values-production.yaml my-values.yaml
$EDITOR my-values.yaml
```

Key settings:

| Value | Purpose |
|---|---|
| `global.imageRegistry` / `imagePullSecrets` | Private registry prefix + pull credentials |
| `backend.secret.secretKey` | Django `SECRET_KEY` |
| `backend.secret.encryptKey` / `iv` | AES key/IV used to decrypt user identity from URLs |
| `backend.postgres.serviceFile` | Full `pg_service.conf` content — must contain the `[revenue]` section referenced by `settings.py` |
| `backend.postgres.pgpass` | Full libpq password file content (`host:port:db:user:password` per line); the chart installs it with `0600` permissions automatically |
| `backend.existingSecret` | Use your own Secret instead of chart-rendered values (keys: `pg-service.conf`, `pg-pass`, `secret-key`, `encrypt-key`, `iv`, optional `db-*`) |
| `ingress.host` / `tls` | Public hostname and TLS; `CSRF_TRUSTED_ORIGINS` is derived from it automatically |
| `monitoring.serviceMonitor.labels` | **Must match** the `serviceMonitorSelector` of your Prometheus (typically `release: <kube-prometheus-stack release name>`) |
| `monitoring.grafana.dashboard.*` | Dashboard ConfigMap + sidecar labels |

Note about the pgpass file: libpq refuses password files that are not owned by
the current user with `0600` permissions. Kubernetes Secret mounts cannot
provide that, so the backend container's startup script copies
`/pg-secrets/*` into `/app/.pg_service.conf` and `/app/.my_pgpass` (with
`umask 177`) before starting gunicorn. Do not enable
`readOnlyRootFilesystem` for the backend while `postgres.viaSecret=true`.

## 3. Install

```bash
helm upgrade --install estimate-form deploy/estimate-form \
  -n estimate-form --create-namespace \
  -f my-values.yaml
```

Smoke test:

```bash
kubectl -n estimate-form get pods -l app.kubernetes.io/instance=estimate-form
kubectl -n estimate-form port-forward svc/estimate-form-backend 8000:8000
curl http://localhost:8000/health/     # {"status": "ok"}
curl http://localhost:8000/metrics | head
```

## 4. Prometheus

Two `ServiceMonitor` objects are created (when `monitoring.serviceMonitor.enabled=true`):

- `<release>-backend` — scrapes Django `GET /metrics` (path `/metrics`, app port)
- `<release>-frontend` — scrapes the `nginx-prometheus-exporter` sidecar on port 9113

**If the targets do not appear in Prometheus → Status → Targets**, the
`monitoring.serviceMonitor.labels` do not match your Prometheus instance's
`serviceMonitorSelector`. For kube-prometheus-stack the default selector label
is the name of the stack release, e.g.:

```bash
kubectl -n monitoring get prometheus -o jsonpath='{.items[*].spec.serviceMonitorSelector}'
# adjust values: monitoring.serviceMonitor.labels.release = <that value>
```

### Application metrics exported by the backend (`/metrics`)

Provided by django-prometheus (already wired into the backend):

| Metric | Meaning |
|---|---|
| `django_http_requests_total_by_view_transport_method_total{view,method,transport}` | HTTP requests per view |
| `django_http_responses_total_by_status_total{status}` / `..._by_status_view_method_total` | Responses per status code |
| `django_http_requests_latency_seconds_by_view_method_bucket` | Request latency histogram (p50/p95 etc.) |
| `django_http_exceptions_total_by_view_total` / `..._by_type_total` | Exceptions in views |
| `django_db_execute_total{alias,vendor}` / `django_db_errors_total` / `django_db_new_connection_errors_total` | DB activity and errors per alias |
| `django_model_inserts_total` / `updates` / `deletes` | ORM object operations |
| `django_http_ajax_requests_total`, `django_http_requests_body_total_bytes_total`, ... | Additional traffic metrics |

Gunicorn runs with `PROMETHEUS_MULTIPROC_DIR` on an `emptyDir`, so counters and
histograms of **all** workers are merged into one view.

### Frontend (nginx) metrics

The `nginx-prometheus-exporter` sidecar scrapes localhost `stub_status` and
exposes `nginx_connections_active/reading/writing/waiting` and
`nginx_http_requests_total` on port 9113.

Pod CPU/memory/restarts come from cAdvisor and kube-state-metrics already
installed with kube-prometheus-stack.

## 5. Grafana

The chart ships the dashboard **"Estimate Form / Overview"** (ConfigMap
`<release>-grafana-dashboard`), with panels for: request rate by view, 4xx/5xx
rates, p50/p95 latency, DB statement/error rates, exceptions, nginx
connections, pod CPU/memory, container restarts and a live **Loki logs**
panel (pick your datasources via the dashboard's `Prometheus datasource` /
`Loki datasource` variables).

Auto-import requires the Grafana dashboard sidecar (enabled by default in
kube-prometheus-stack) and the label `grafana_dashboard: "1"` — configurable
under `monitoring.grafana.dashboard`. Without a sidecar, export and import
manually:

```bash
kubectl -n estimate-form get cm estimate-form-grafana-dashboard \
  -o jsonpath='{.data.estimate-form-overview\.json}' > dashboard.json
# Grafana -> Dashboards -> Import (or New -> Import)
```

## 6. Loki logs

Django logs (INFO+, verbose format) and nginx access/error logs go to
container stdout; Promtail/Alloy picks them up automatically. Useful
LogQL queries:

```logql
{namespace="estimate-form", pod=~"estimate-form-backend.*"}

{namespace="estimate-form", pod=~"estimate-form-backend.*"} |= "ERROR"

{namespace="estimate-form", pod=~"estimate-form-frontend.*"} |= " 500 "
```

Note: the backend logs are plain text (`LEVEL - time - module - pid tid -
message`), so `| json` filtering is not applicable; use line filters as
shown above.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| Pods `CreateContainerConfigError`; Helm error about `required` values | Not all mandatory values set (`backend.secret.*`, `backend.postgres.*`) — fill them or use `backend.existingSecret` |
| Backend `CrashLoopBackOff`, gunicorn exits immediately | `pg_service.conf`/`pgpass` content wrong (check the `[revenue]` section and host/port); check `kubectl logs` |
| Log line `password authentication failed` | Wrong pgpass entry — must match the service file host:port:dbname:user |
| POST requests from the browser return 403 CSRF errors | `CSRF_TRUSTED_ORIGINS` mismatch — set explicit `backend.env.csrfTrustedOrigins` (or fix `ingress.host`/`ingress.tls`) |
| Metrics missing in Prometheus | ServiceMonitor labels don't match the stack selector; see section 4 |
| No nginx metrics | `frontend.nginx.metrics.enabled` is false, or the frontend image build predates the chart (the nginx.conf with `stub_status` is mounted from a ConfigMap, but the exporter scrapes it only when enabled) |
| Image pull errors | Create a pull secret and set `global.imagePullSecrets` |

## Compatibility with docker-compose

The chart requires no changes to `docker-compose.yml`. In compose the app
continues to work exactly as before: the gunicorn wrapper, pgpass copy and
metrics scrapers exist only in the Helm templates, and the backend change
(django-prometheus) is passive — `/metrics` is simply an extra URL. Rebuild
the backend image once to include the new dependency.
