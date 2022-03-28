---
title: Active Directory
subtitle: The industry standard Directory Services platform. 
date: 1970-01-06 00:00:00
description: |
  Active Directory has unanimously been the directory services choice at nearly ever organization I've worked at. I've managed and created many topologies and have continuously been selected as the AD subject matter expert. 
featured_image: active-directory.svg
accent_color: '#4C60E6'
gallery_images:
  - active-directory.svg
tasks: 
 - Migrated users, computers, and services to a new forest while maintaining access across the environment during the transition. 
 - Managed and maintained multi domain and multi forest deployments
 - Optimized AD deployments to ensure reliable performance for remote sites.
 - Created and managed complex group policies with loopback processing, item level targeting, and broken inheritance. 
---
 {{ page.description }}

## What I've done with {{ page.title | capitalize }}:
{% for task in page.tasks %}
> {{ task }}
{% endfor %}