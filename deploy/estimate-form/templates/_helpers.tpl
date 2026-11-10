{{/* Expand the name of the chart. */}}
{{- define "estimate-form.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Fully qualified app name (truncated to 63 chars by convention). */}}
{{- define "estimate-form.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/* Chart name and version as used by the chart label. */}}
{{- define "estimate-form.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Common labels. */}}
{{- define "estimate-form.labels" -}}
helm.sh/chart: {{ include "estimate-form.chart" . }}
{{ include "estimate-form.selectorLabels" . }}
{{- with .Chart.AppVersion }}
app.kubernetes.io/version: {{ . | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/* Selector labels (used in Deployment selectors, must stay stable). */}}
{{- define "estimate-form.selectorLabels" -}}
app.kubernetes.io/name: {{ include "estimate-form.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/* Labels with a component suffix (backend/frontend). */}}
{{- define "estimate-form.componentLabels" -}}
app.kubernetes.io/component: {{ .component }}
{{- end }}

{{/* Backend resource name. */}}
{{- define "estimate-form.backend.fullname" -}}
{{- printf "%s-backend" (include "estimate-form.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/* Frontend resource name. */}}
{{- define "estimate-form.frontend.fullname" -}}
{{- printf "%s-frontend" (include "estimate-form.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
RBAC-free ServiceAccount name.
*/}}
{{- define "estimate-form.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "estimate-form.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Image reference: `<registry>/<repository>:<tag>`.
Context: dict { "image" <image-values>, "global" <global-values>, "chart" <chart>, "defaultTag" "" }
*/}}
{{- define "estimate-form.image" -}}
{{- $registry := .image.registry | default .global.imageRegistry -}}
{{- $repository := .image.repository -}}
{{- $tag := .image.tag | default .defaultTag | default .chart.AppVersion -}}
{{- if $registry -}}
{{- printf "%s/%s:%s" $registry $repository $tag -}}
{{- else -}}
{{- printf "%s:%s" $repository $tag -}}
{{- end -}}
{{- end }}

{{/* imagePullSecrets block rendered as YAML list entries. */}}
{{- define "estimate-form.imagePullSecrets" -}}
{{- with .global.imagePullSecrets }}
imagePullSecrets:
{{- toYaml . | nindent 0 }}
{{- end }}
{{- end }}

{{/*
Name of the Secret holding backend credentials:
either the user-provided existingSecret or the chart-created one.
*/}}
{{- define "estimate-form.backend.secretName" -}}
{{- default (printf "%s-secret" (include "estimate-form.backend.fullname" .)) .Values.backend.existingSecret }}
{{- end }}
