# estimate-form — ArgoCD (GitOps) deployment

Continuous **deployment** runs through ArgoCD; GitLab CI only builds, scans
and commits (see the root `.gitlab-ci.yml`). The single source of truth for
what runs in production is the `main` branch of this repository.

```
 docker-compose dev                        release
 ───────────────────                       ─────────────────────────────────────
 local fix ─► MR ─► main          git tag v1.2.11 && git push --tags
                    │                        │
                    │                  GitLab CI
                    │                 quality ─► build ─► scan ─► release:values
                    │                 (lint/ruff/   (kaniko,  (trivy,  (bump image
                    │                  helm check)   registry)  CVE gate)  tags in
                    │                                                      values-
                    │                                                      production.yaml,
                    │                                                      push to main)
                    ▼                        ▼
                images tagged             images tagged
                 <short SHA>               1.2.11
                                             │
                                             ▼
                 ArgoCD: watch main ─► new commit detected ─► auto-sync
                 (deploy/argocd/application.yaml + deploy/estimate-form/
                  values-production.yaml)  helm release estimate-form,
                                          namespace estimate-form
```

Pipeline progression per commit type:

| Event | Stages | Effect |
|---|---|---|
| merge request | quality | checks only |
| push to `main` | quality + build | images tagged `<short SHA>` (not deployed) |
| tag `vX.Y.Z` | quality + build + scan + release | images `X.Y.Z` + tag-bump commit → auto-deploy |

## Prerequisites

- **ArgoCD ≥ 2.6** installed in the cluster (Application assumed to live in
  the `argocd` namespace).
- **cert-manager** with the `letsencrypt-prod` ClusterIssuer — TLS for
  `estimate.rtt.digital` (`estimate-form-tls` secret).
- **kube-prometheus-stack** (release name `kube-prometheus-stack`) for the
  ServiceMonitors / Grafana dashboard.
- **GitLab Container Registry access from the cluster** — the images live at
  `git.rtt.digital/konsin1988/estimate-form/{backend,frontend}`.

## One-time setup

### 1. Namespace and registry pull secret

Create a project access token in GitLab (*Settings → Access tokens*) with the
`read_registry` scope, then:

```bash
kubectl create namespace estimate-form

kubectl -n estimate-form create secret docker-registry gitlab-registry \
  --docker-server=git.rtt.digital \
  --docker-username=<registry-read-token> \
  --docker-password=<token-value> \
  --docker-email=<team-email>
```

### 2. Application secret (`estimate-form-backend-secret`)

The deployment mounts all backend credentials from a pre-created Secret, so
nothing sensitive is stored in git (the chart is pointed at it via
`backend.existingSecret` in `values-production.yaml`).

Required keys (exact names matter — the container startup script copies
`pg-service.conf` → `/app/.pg_service.conf` and `pg-pass` → `/app/.my_pgpass`):

| Key | Content |
|---|---|
| `pg-service.conf` | libpq service file with the `[revenue]` section |
| `pg-pass` | libpq password file, one line per host |
| `secret-key` | Django `SECRET_KEY` |
| `encrypt-key` | AES key used by `api/utils.py decrypt_param()` |
| `iv` | AES IV used by `api/utils.py decrypt_param()` |

Build it from the same local files the backend uses when running from source:

```bash
kubectl -n estimate-form create secret generic estimate-form-backend-secret \
  --from-literal='secret-key=<django-secret-key>' \
  --from-literal='encrypt-key=<aes-key>' \
  --from-literal='iv=<aes-iv>' \
  --from-file=pg-service.conf=backend/.pg_service.conf \
  --from-file=pg-pass=backend/.my_pgpass
```

(`backend/.pg_service.conf.example` shows the expected `[revenue]` section:
host `172.16.3.158`, port `5432`, dbname `skud_va`, user `d_konshin`.)

Rotation later: re-run with `--dry-run=client -o yaml | kubectl apply -f -`
and restart the backend
(`kubectl -n estimate-form rollout restart deploy/estimate-form-backend`).

### 3. Connect the repository to ArgoCD

The project is private, so ArgoCD needs read credentials (a project access
token with `read_repository` is enough):

```bash
argocd repo add https://git.rtt.digital/konsin1988/estimate-form.git \
  --username <git-read-token> --password <token-value>
```

(or *Settings → Repositories* in the ArgoCD UI).

### 4. Create the Application

```bash
kubectl apply -f deploy/argocd/application.yaml
```

ArgoCD will render the chart with `values-production.yaml`, create the
`estimate-form` namespace and perform the first sync. Wait for

```bash
kubectl -n estimate-form rollout status deploy/estimate-form-backend
kubectl -n estimate-form rollout status deploy/estimate-form-frontend
```

and check the app at https://estimate.rtt.digital (backend health endpoint:
`https://estimate.rtt.digital/api/health/` — the frontend nginx proxies
`/api/` to the backend service).

## Releases

Release = build images + mark them for deployment:

```bash
git tag v1.2.11
git push origin v1.2.11
```

The tag pipeline runs the full flow; when it finishes, the release job has
committed `backend.image.tag`/`frontend.image.tag` → `1.2.11` in
`deploy/estimate-form/values-production.yaml`, and ArgoCD auto-syncs within a
few minutes. Only the scan stage can stop a release: critical CVEs make the
pipeline red **before** the tag-bump commit is pushed, so ArgoCD never sees a
version that failed the gate.

Pre-release images from ordinary `main` pushes (tagged with the short commit
SHA) can be tested anywhere with docker/pull access without being deployed.

## Rollback

The previous version's images still exist in the registry, so a rollback is
just moving the tags back in git:

```bash
git revert <bump-commit-sha>     # sets tags back to the previous release
git push origin main             # ArgoCD syncs the downgrade automatically
```

(UI alternative: Applications → estimate-form → History and rollback — but
with `selfHeal: true` any manual state is reconciled back to git on the next
sync, so the git revert is the canonical procedure.)

## Layout

| Path | Purpose |
|---|---|
| `application.yaml` | ArgoCD Application resource (this directory) |
| `../estimate-form/values-production.yaml` | production values — image tags are managed by CI, everything else is edited by hand via MRs |
| `../estimate-form/` | the Helm chart itself |
