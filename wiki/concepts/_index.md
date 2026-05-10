---
description: "Index of all concepts — procedures, regulations, technical ideas"
tags: [index, concept]
updated: 2026-05-10
---
# Concepts

## Architecture
- [[architecture/data-repository-back]] — DataRepositoryBack: aeronautical source file repository (.NET 8, PostgreSQL + MongoDB GridFS)
- [[wiki/concepts/architecture/digital-notam-system-architecture.md]] — DigitalNotam System Architecture

## Workflow
- [[workflow/conflict-detection]] — 4D geometric conflict detection: FPL ↔ NOTAM, FPL ↔ FPL, zone/schedule, FL range validation
- [[workflow/notification-system]] — SSE live notification stream and Notification Center UI for operator alerts
- [[workflow/reports-and-statistics]] — Flight metrics aggregation service, Reports API, and optional traffic forecast
- [[workflow/kan-operational-workflow]] — KAN Operational Workflow Consolidated: RPL→DFP pipeline, AFTN, SSPR approval state machine, billing, ANI, NOTAM, FF-ICE dev checklist
- [[workflow/rpl-processing]] — RPL Processing at KAN: seasonal planning, formats, manual Excel transfer
- [[workflow/flight-approval-state-machine]] — Flight Approval State Machine (SSPR): 4 regular + 3 charter + 2 restriction workflows
- [[workflow/dfp-lifecycle]] — DFP Lifecycle: FLI-driven state transitions, filter groups, GA mode

## NOTAM
- [[wiki/concepts/notam/notam-proposal-lifecycle.md]] — NOTAM Proposal Lifecycle (Draft → Published workflow)
- [[wiki/concepts/notam/aixm-tempdelta-generation.md]] — AIXM Tempdelta Generation in DigitalNotam

## SPO Systems
- [[wiki/concepts/spo/spo-arm-pivp]] — СПО АРМ ПИВП: ARM PDI operator workstation for flight planning dispatch (Monitor Soft, 2022)
- [[wiki/concepts/spo/daily-flight-plan-spp]] — Суточный План Полетов (СПП): daily flight plan structure, lifecycle, and filters
- [[wiki/concepts/spo/pdi-message-processing]] — ПДИ Message Processing: incoming queue, editor, archive, history workflow
