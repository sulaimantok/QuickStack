#!/bin/bash

wait_until_all_pods_running() {

    # Waits another 5 seconds to make sure all pods are registered for the first time.
    sleep 5

    while true; do
        OUTPUT=$(sudo k3s kubectl get pods -A --no-headers 2>&1)

        # Checks if there are no resources found --> Kubernetes ist still starting up
        if echo "$OUTPUT" | grep -q "No resources found"; then
            echo "Kubernetes is still starting up..."
        else
            # Extracts the STATUS column from the kubectl output and filters out the values "Running" and "Completed".
            STATUS=$(echo "$OUTPUT" | awk '{print $4}' | grep -vE '^(Running|Completed)$')

            # If the STATUS variable is empty, all pods are running and the loop can be exited.
            if [ -z "$STATUS" ]; then
            echo "Pods started successfully."
            break
            else
            echo "Waiting for all pods to come online..."
            fi
        fi

        # Waits for X seconds before checking the pod status again.
        sleep 10
    done

    # Waits another 5 seconds to make sure all pods are ready.
    sleep 5

    sudo kubectl get node
    sudo kubectl get pods -A
}

# Installation of k3s
curl -sfL https://get.k3s.io | sh -
# Todo: Check for Ready node, takes ~30 seconds
sudo k3s kubectl get node

echo "Waiting for Kubernetes to start..."
wait_until_all_pods_running

# Installation of Longhorn
sudo kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.6.0/deploy/longhorn.yaml
echo "Waiting for Longhorn to start..."
wait_until_all_pods_running

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# THIS MUST BE INSTALLED ON ALL NODES --> https://longhorn.io/docs/1.7.2/deploy/install/#installing-nfsv4-client
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
echo "Installing nfs-common..."
kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.7.2/deploy/prerequisite/longhorn-nfs-installation.yaml
wait_until_all_pods_running

# Installation of Cert-Manager
sudo kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.1/cert-manager.yaml
echo "Waiting for Cert-Manager to start..."
wait_until_all_pods_running
sudo kubectl -n cert-manager get pod

# add Cluster Issuer
cat <<EOF > cluster-issuer.yaml
# Staging ClusterIssuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
  namespace: default
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: test@ost.ch
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
    - selector: {}
      http01:
        ingress:
          class: traefik
---
# Production ClusterIssuer
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-production
  namespace: default
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: test@ost.ch
    privateKeySecretRef:
      name: letsencrypt-production
    solvers:
    - selector: {}
      http01:
        ingress:
          class: traefik
EOF
sudo kubectl apply -f cluster-issuer.yaml
sudo kubectl get clusterissuer -o wide
rm cluster-issuer.yaml

sudo kubectl get nodes

# deploy QuickStack
cat <<EOF > quick-stack.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: quickstack-internal-pvc
  namespace: quickstack
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: longhorn
  resources:
    requests:
      storage: 1Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: quickstack
  namespace: quickstack
spec:
  replicas: 1
  selector:
    matchLabels:
      app: quickstack
  template:
    metadata:
      labels:
        app: quickstack
    spec:
      strategy:
        type: Recreate
      containers:
        - name: quickstack-container
          image: quickstack/quickstack:latest
          imagePullPolicy: "Always"
          volumeMounts:
            - name: quickstack-internal-pvc
              mountPath: /mnt/internal
      volumes:
        - name: quickstack-internal-pvc
          persistentVolumeClaim:
            claimName: quickstack-internal-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: quickstack-svc
  namespace: quickstack
spec:
  selector:
    app: quickstack
  ports:
    - nodePort: 3000
      protocol: TCP
      port: 3000
      targetPort: 3000
EOF

# evaluate url to add node to cluster
joinTokenForOtherNodes=$(sudo cat /var/lib/rancher/k3s/server/node-token)
echo "To add a worker node to the cluster, run the following command on the worker node:"
echo "------------------------------------------------------------"
echo "curl -sfL https://get.k3s.io | K3S_URL=https://<IP-ADDRESS-OR-HOSTNAME-OF-MASTERNODE>:6443 K3S_TOKEN=$joinTokenForOtherNodes sh -"
echo "------------------------------------------------------------"