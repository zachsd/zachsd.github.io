---
title: PowerShell
subtitle: The everything Windows scripting platform.
date: 1970-01-03 00:00:00
description: |
  Microsoft has been building PowerShell interfaces for nearly every product offering they have. That means almost anything that needs to be done on the Microsoft stack is PowerShell-able.
featured_image: powershell-logo.svg
accent_color: '#4C60E6'
gallery_images:
  - powershell-logo.svg
tasks: 
 - Created numerous modules and scripts for managing network interfaces, routes, Active Directory objects, patches, and settings on fleets of servers. 
 - Automated complex processes involving multiple products from the Microsoft stack.
 - Created wrappers around legacy cli tools to ingest data in a native powershell way. 
---
 {{ page.description }}
## What I've done with {{ page.title | capitalize }}:
{% for task in page.tasks %}
> {{ task }}
{% endfor %}