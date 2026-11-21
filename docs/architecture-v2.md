# RideFlow architecture v2

## Product and pilot boundaries

RideFlow is a Morocco-first mobility marketplace for passengers and verified transport operators. Licensed taxis are the primary partners. Petit taxi, grand taxi and other operator classes are catalog entries whose actual permissions come from verified, versioned rules for the applicable jurisdiction and service zone. An unknown, expired, conflicting or unverifiable rule fails closed. Taxi-first scoring runs only after the eligibility gate. Local counsel and the relevant partners must verify boundaries, fare models, pooling, waiting, payments and platform operating permissions before a pilot.

The mobile-first web experience starts with Book a Ride and Taxi First, then introduces Find a Comrade, Multi-Stop Journey, Schedule a Ride and My Regular Driver when their eligibility checks and workflows are implemented. Passenger and driver interfaces use English, French and Arabic with RTL layout, locale-aware display and confirmation in the local service time zone. Maintain a keyboard-accessible booking path alongside maps. A manifest enables installability work and a service worker should cache only public assets, never private locations, quotes or trips.

## Components and access

- Next.js and TypeScript serve the passenger and operator interfaces and server-side APIs. Supabase Auth supplies user identities. Database membership and assignments determine privileges. Users cannot set their own operator verification or staff rights.
- Supabase PostgreSQL with PostGIS holds authoritative data. Public API mutations validate identity and inputs and call narrow transactional commands. A background worker reads committed outbox events for dispatch and notifications. Use idempotent workers with bounded retries and dead-letter review.
- Mapbox geocoding, directions and matrix requests use a provider adapter and server-held credentials where needed. The browser map uses a separate restricted public token. Send the minimum coordinates necessary and account for provider retention rules. Do not put private coordinates in analytics, exception logs or shared realtime payloads.
- Supabase Realtime distributes booking-scoped status and assigned-driver tracking, authorized per booking. Passengers see only their own precise pickup and destination. For pooled trips give passengers their pickup coordination, vehicle ETA and coarse trip progress. The assigned driver sees instructions only for active assignments and the relevant time window. Audit staff access to precise locations.
- A payment provider integration uses idempotency keys and signed, replay-protected webhooks. Ledger postings are immutable, balanced and denominated in integer minor units. Refunds and adjustments are compensating postings. Keep subscription billing distinct from passenger ride settlement.

## Lifecycle and commands

| Aggregate | Main transitions |
| --- | --- |
| Passenger booking | requested → confirmed → awaiting_pickup → onboard → completed. Eligible earlier states permit cancelled or no_show. |
| Vehicle journey | planned → assigned → en_route → in_progress → completed. Pre-start cancellation releases assignments and seats. |
| Dispatch offer | pending → accepted, declined, expired or withdrawn. |
| Subscription | proposed → accepted → active → ended. Supported transitions include paused, cancelled and expired. |

Use named commands with actor, expected state/version, timestamps, reason and idempotency key. Persist state changes and outbox events in the same transaction. Offer acceptance checks expiry against database time and locks the offer and journey before writing assignment and withdrawing competing offers. A retry replays the original outcome. Passenger booking, driver assignment, journey and settlement have separate identifiers and events.

## Domain modules

- **Taxi dispatch** first filters current licenses and vehicle types, authorized origin/destination and any corridor or operating-time constraints, capacity, and driver availability. Use geofence and proximity queries to shortlist, then a routing matrix for ETA. Rank by policy-defined taxi preference, ETA and transparent tie-break rules. No qualified vehicle yields an unavailable result.
- **Fares** produce expiring, immutable quotes with rule version, route estimate, currency and itemized basis. Store acceptance. Metered services distinguish estimates from regulated settlement. Compose revisions as new quotes, require approval before material amendments, and account for waiting charges only where an active rule permits them.
- **Multi-stop** keeps ordered stops with optional requested waiting duration. Route in the specified order and requote after edits. Record server-timed arrival, start, pause if supported and end events with enforced waiting limits. Quote approval is required before applying newly chargeable changes.
- **Scheduling** stores pickup windows and reservation buffers including repositioning travel, using UTC instants plus the service IANA zone (initially Africa/Casablanca). Resolve ambiguous wall times explicitly and reject nonexistent times. Apply lead times, cancellation deadlines, driver calendars and notifications. Recheck feasibility when itinerary or schedule changes.
- **Subscriptions** store accepted terms including preferred driver, weekdays, local times, directions including returns, dates and price. Generate occurrences on a rolling horizon using unique series/date/direction keys. Model vacation, skips and unavailable drivers as occurrence dispositions. Replacement is a proposal requiring applicable approvals. Avoid presenting confirmed service before coverage is established.
- **Pooling** shortlists opted-in bookings by zone, spatial overlap and compatible time windows. Use the route matrix to test pickup-before-drop-off insertions, then evaluate ETA shifts, detour and seat occupancy on every segment. Create an expiring match and quote for each participant. Confirm only with all required consent, current quotes, authorization and capacity in one transaction. Provide separate cancellations, no-show rules and allocations per passenger. Evaluate simulator outcomes before enabling real dispatch.

## Delivery roadmap

| Phase | Exit criteria |
| --- | --- |
| A. Specification | Architecture, controls, user flows and readiness classifications agreed. |
| B. Database design | Schema and migration plan reviewed. Confirm keys, role boundaries and transaction invariants in a disposable Supabase database before production rollout. |
| C. Single passenger | Select pickup and drop-off, review an upfront demo quote, confirm, and track a simulated journey in responsive Next.js. Integrate real routing, authentication and durable bookings before live use. |
| D. Taxi-first | Review operator evidence, publish versioned rules, exercise disqualification and test ranked dispatch. |
| E. Multi-stop | Validate ordering, estimates, waiting limits and quote revisions. |
| F. Scheduling | Verify local-time edge cases, repositioning and concurrent conflict rejection. |
| G. Recurrence | Verify acceptance, idempotent occurrence creation, exceptions and separate billing. |
| H. Pooling | Test insertion, consent, no-shows and concurrent per-segment seat allocation in simulation. |
| I. Hardening | Run RLS isolation, race, lifecycle, localization, accessibility and mobile end-to-end suites. |
| J. Controlled pilot | Verify legal and partner authorization, payment operations, incident response, insurance and location privacy terms. Explicit approval gates any live dispatch. |

## Delivery status

The first milestone implements a demo quote, confirmation and tracking flow for one passenger. Routes, fares and the vehicle lifecycle are simulated. The live Supabase, Mapbox, verified taxi, real-time operator, payment and identity integrations are incomplete. Multi-stop, scheduled, recurring and shared journeys are specified here for later milestones. Live dispatch and charging remain blocked pending verified rules, appropriate agreements, privacy review and operational testing.
