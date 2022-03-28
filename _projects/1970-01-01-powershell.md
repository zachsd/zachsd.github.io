---
title: PowerShell
subtitle: The everything Windows scripting platform.
date: 1970-01-03 00:00:00
description: |
  Microsoft has been building PowerShell interfaces for just about every product offering they have. So just about anything that needs to be done on the Microsoft stack is PowerShell-able.
featured_image: powershell-logo.svg
accent_color: '#4C60E6'
gallery_images:
  - powershell-logo.svg
tasks: 
 - Created numerous customized modules and scripts for tasks ranging from managing network interfaces and routes, collecting and updating Active Directory objects, to patching and managing settings on fleets of servers. 
 - Automated complex multi faceted processes involving multiple products from the Microsoft stack.
 - Created wrappers around legacy cli tools to be able to ingest data in native powershell way. 
---
 {{ page.description }}
## What I've done with {{ page.title | capitalize }}:
{% for task in page.tasks %}
> {{ task }}
{% endfor %}