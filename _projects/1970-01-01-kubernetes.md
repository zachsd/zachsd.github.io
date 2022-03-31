---
title: Kubernetes
subtitle: The de-facto container orchestration platform.  
date: 1970-01-04 00:00:00
description: |
  Kubernetes needs no introductions as it’s been grabbing the headlines of every tech article for the past few years. This graduated CNCF project is changing the pace of what we can build and deploy in today’s landscape. Kubernetes has become the de facto container orchestration platform.
featured_image: kubernetes-logo.svg
accent_color: '#4C60E6'
gallery_images:
  - kubernetes-logo.svg
tasks: 
 - Deployed multiple types of k8s clusters including EKS, RKE, k3s and bootstrapped clusters on bare metal, virtual machines, and raspberry pi's
 - Against all odds, successfully containerized and deployed legacy applications.  
---
 {{ page.description }}

## What I've done with {{ page.title | capitalize }}:
{% for task in page.tasks %}
> {{ task }}
{% endfor %}