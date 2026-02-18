#!/bin/bash

docker build -t notif-frontend:latest .
k3d image import notif-frontend:latest -c notif
kubectl rollout restart deployment frontend -n notif
