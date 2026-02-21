#!/usr/bin/env bash
# ============================================================
# NesNes Webstore — Kubernetes Deploy Script
# ============================================================
# Usage:
#   ./k8s/deploy.sh <env>           # Deploy one environment: dev | staging | production
#   ./k8s/deploy.sh all             # Deploy all three environments
#   ./k8s/deploy.sh teardown <env>  # Delete one environment's resources
#
# Prerequisites:
#   1. minikube start --cpus=4 --memory=8192
#   2. minikube addons enable metrics-server
#   3. Push images to Docker Hub (Docker Hub username: agnesabexheti):
#        docker build -t agnesabexheti/nesnes-backend:dev .
#        docker build -t agnesabexheti/nesnes-backend:stable .
#        docker build -t agnesabexheti/nesnes-backend:latest .
#        docker build -t agnesabexheti/nesnes-frontend:dev ./client
#        docker build -t agnesabexheti/nesnes-frontend:stable ./client
#        docker build -t agnesabexheti/nesnes-frontend:latest ./client
#        docker push agnesabexheti/nesnes-backend:dev && docker push agnesabexheti/nesnes-backend:stable && docker push agnesabexheti/nesnes-backend:latest
#        docker push <user>/nesnes-frontend:dev && docker push <user>/nesnes-frontend:stable && docker push <user>/nesnes-frontend:latest
#   5. For VPA support:
#        git clone https://github.com/kubernetes/autoscaler.git
#        cd autoscaler/vertical-pod-autoscaler && ./hack/vpa-up.sh
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

deploy_env() {
  local ENV=$1
  echo ""
  echo "=============================================="
  echo "  Deploying: $ENV"
  echo "=============================================="

  # 1. Namespaces (cluster-scoped, idempotent)
  kubectl apply -f "$SCRIPT_DIR/00-namespaces.yaml"

  # 2. ConfigMaps & Secrets (must exist before workloads)
  kubectl apply -f "$SCRIPT_DIR/$ENV/01-configmap.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/02-secret.yaml"

  # 3. ResourceQuota (dev and staging only — production has no limit)
  if [ -f "$SCRIPT_DIR/$ENV/03-quota.yaml" ]; then
    kubectl apply -f "$SCRIPT_DIR/$ENV/03-quota.yaml"
  fi

  # 4. PersistentVolumeClaims (for Prometheus, Grafana)
  kubectl apply -f "$SCRIPT_DIR/$ENV/04-pvcs.yaml"

  # 5. StatefulSets with their embedded headless+ClusterIP services
  kubectl apply -f "$SCRIPT_DIR/$ENV/05-postgres-statefulset.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/06-redis-statefulset.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/07-elasticsearch-statefulset.yaml"

  echo "  Waiting for databases to become ready..."
  kubectl rollout status statefulset/postgres -n "$ENV" --timeout=120s || true
  kubectl rollout status statefulset/redis -n "$ENV" --timeout=60s || true

  # 6. Deployments
  kubectl apply -f "$SCRIPT_DIR/$ENV/08-app-deployment.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/09-frontend-deployment.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/10-kong-deployment.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/11-prometheus-deployment.yaml"
  kubectl apply -f "$SCRIPT_DIR/$ENV/12-grafana-deployment.yaml"

  # 7. Services (NodePort/ClusterIP for each component)
  kubectl apply -f "$SCRIPT_DIR/$ENV/13-services.yaml"

  # 8. HPA — staging and production only
  if [ -f "$SCRIPT_DIR/$ENV/14-hpa.yaml" ]; then
    kubectl apply -f "$SCRIPT_DIR/$ENV/14-hpa.yaml"
  fi

  # 9. VPA (requires VPA controller installed separately)
  local VPA_FILE="$SCRIPT_DIR/$ENV/14-vpa.yaml"
  [ -f "$SCRIPT_DIR/$ENV/15-vpa.yaml" ] && VPA_FILE="$SCRIPT_DIR/$ENV/15-vpa.yaml"
  if kubectl get crd verticalpodautoscalers.autoscaling.k8s.io &>/dev/null; then
    kubectl apply -f "$VPA_FILE"
  else
    echo "  [SKIP] VPA CRD not found — skipping VPA for $ENV."
    echo "         Install VPA controller first, then run: kubectl apply -f $VPA_FILE"
  fi

  echo ""
  echo "  ✔ $ENV deployed successfully."
  echo ""
  echo "  Access URLs (run: minikube ip to get IP):"
  MINIKUBE_IP=$(minikube ip 2>/dev/null || echo "<minikube-ip>")
  case "$ENV" in
    development)
      echo "    Frontend:   http://$MINIKUBE_IP:30080"
      echo "    Backend:    http://$MINIKUBE_IP:30500"
      echo "    Kong Proxy: http://$MINIKUBE_IP:30800"
      echo "    Grafana:    http://$MINIKUBE_IP:30300"
      echo "    Prometheus: http://$MINIKUBE_IP:30909"
      ;;
    staging)
      echo "    Frontend:   http://$MINIKUBE_IP:31080"
      echo "    Kong Proxy: http://$MINIKUBE_IP:31800"
      echo "    Grafana:    http://$MINIKUBE_IP:31300"
      ;;
    production)
      echo "    Frontend:   http://$MINIKUBE_IP:32080"
      echo "    Kong Proxy: http://$MINIKUBE_IP:32800"
      echo "    Grafana:    http://$MINIKUBE_IP:32300"
      ;;
  esac
}

teardown_env() {
  local ENV=$1
  echo "Tearing down $ENV namespace..."
  kubectl delete namespace "$ENV" --ignore-not-found=true
  echo "Done."
}

case "${1:-}" in
  dev|development)
    deploy_env "development"
    ;;
  staging)
    deploy_env "staging"
    ;;
  prod|production)
    deploy_env "production"
    ;;
  all)
    deploy_env "development"
    deploy_env "staging"
    deploy_env "production"
    ;;
  teardown)
    teardown_env "${2:-development}"
    ;;
  *)
    echo "Usage: $0 <dev|staging|production|all|teardown <env>>"
    exit 1
    ;;
esac
