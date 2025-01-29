#!/bin/bash

DEPLOYMENT="quickstack"
NAMESPACE="quickstack"

# Get the first pod name of the deployment
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT" -o jsonpath="{.items[0].metadata.name}")

if [ -z "$POD_NAME" ]; then
    echo "Could not find a running QuickStack instance on your server/cluster."
    exit 1
fi

echo "Found QuickStack instance: $POD_NAME"
echo "Initializing password change..."

# Patch the deployment to add or update START_MODE=reset-password
kubectl patch deployment "$DEPLOYMENT" -n "$NAMESPACE" --type='json' -p='[
    {
        "op": "add",
        "path": "/spec/template/spec/containers/0/env/-",
        "value": { "name": "START_MODE", "value": "reset-password" }
    }
]'

echo "Initialized password change successfully, please wait..."

# Wait for a new pod to be created
NEW_POD=""
while [[ -z "$NEW_POD" || "$NEW_POD" == "$OLD_POD" ]]; do
    sleep 2
    NEW_POD=$(kubectl get pods -n "$NAMESPACE" -l app="$DEPLOYMENT" -o jsonpath="{.items[-1].metadata.name}")
done

echo "New pod detected: $NEW_POD"

# Wait until the new pod is in Running state
echo "Waiting for pod $NEW_POD to be in Running state..."
kubectl wait --for=condition=ready pod "$NEW_POD" -n "$NAMESPACE" --timeout=60s

kubectl logs -f "$NEW_POD" -n "$NAMESPACE"