# PostgreSQL and PostGIS migration plan

Use UUID business identifiers, UTC timestamp columns and foreign keys on all relationships. Store money in integer minor units with currency. Use WGS84 point geography for distance queries and SRID 4326 geometry for jurisdiction polygons and route lines. Add GiST indexes for spatial predicates and B-tree indexes on foreign keys, state/time lookup and idempotency keys. Use ST_DWithin for proximity and ST_Covers for service-zone boundaries. Apply route or corridor restrictions separately when required.

## Relations and constraints

| Relation | Purpose and key constraints |
| --- | --- |
| profiles, operators, operator_members, vehicles | Link identities and operator membership. Vehicle ownership and positive seat capacity are explicit. |
| operator_licenses | Evidence record tied to operator and optionally vehicle, with type, review status, validity and verifier. Private evidence storage with restricted access. |
| taxi_service_rules | Versioned jurisdiction, service zone, applicability, category, permissions and fare/waiting rule. Unique jurisdiction/rule/version and auditable activation. |
| journeys, bookings | Physical vehicle run separately from passenger reservation. Bookings reference their passenger and optionally their confirmed journey. |
| ride_itineraries, ride_stops | Immutable itinerary revisions with unique journey/revision and unique itinerary/stop position. Stops carry location, action and requested wait. |
| pool_requests, pool_matches | Booking-scoped consent, pickup window and detour tolerance. Expiring proposed journey revision with scoped match membership and consent timestamps. |
| ride_participants | Unique journey/booking allocation with pickup and drop-off indexes on the same revision and positive seats. Pickup index must precede drop-off. |
| fare_quotes | Immutable versions per booking covering pricing rule, route revision, itemized amounts, expiration and acceptance evidence. |
| waiting_sessions | Stop-specific actual timing and policy cap. Partial unique index permits one open session per stop. |
| driver_availability | Time ranges tagged as availability or block. Store driver time zone and local scheduling policy separately from reserved instants. |
| scheduled_bookings | Booking-specific pickup window, lead time, cancellation deadline and confirmation state. |
| driver_reservations | Active occupied time including buffers. Exclude overlaps with GiST on driver UUID equality and tstzrange overlap using btree_gist. |
| recurrence_rules, driver_subscriptions | Versioned weekdays, local times, destinations, return terms, bounded dates and time zone. Agreement records both actors and driver acceptance. |
| subscription_occurrences | Unique subscription/local date/direction with optional booking and explicit skip or replacement disposition. |
| billing_ledger | Balanced postings by ledger transaction with currency, unique external event and unique command reference per settlement purpose. |
| dispatch_offers, state_events, outbox | Offers expire by database time. State events capture actor and transition. Outbox stores deduplication keys and delivery attempts. |

## Transaction and authorization design

- Allocate seats in a transaction that locks the journey, verifies the active itinerary revision, current quotes and pooling consent, and checks occupancy over each half-open segment from pickup through drop-off. Insert all participant reservations atomically. Cancellations and itinerary revisions take the same lock. Recompute occupancy before committing a reorder.
- Accept dispatch offers with a conditional transition from pending and an unexpired deadline. Lock the journey, verify current authorization and calendar rules, insert the exclusion-protected driver reservation and update journey assignment in one transaction. Repositioning requirements must fit alongside prior and next trips.
- Enforce unique actor/operation/key for commands and unique provider/event IDs for webhook receipts. Couple transactional writes with outbox insertion. Keep payment network calls outside database transactions and retry them with stable processor keys.
- Enable RLS on every exposed table and explicitly grant only necessary operations. Passengers can read their own bookings, quotes and constrained status events. Assigned drivers receive scoped pickup details. Operator members see records for their authorized organization. Internal rules, licence evidence, raw location history and ledger operations have narrow grants. Revoke default function execution for privileged RPCs, fix search paths, schema-qualify relations and derive actor identity from validated auth. Keep service-role keys server-side and use private Realtime channels.

## Migration sequence and verification

1. Enable postgis and btree_gist. Create private schemas, role grants, profiles, organizations, vehicles, licensing and policy tables. Seed only explicitly marked synthetic policies.
2. Add bookings, journeys, itinerary versions, quotes and state transitions. Apply RLS and verify cross-account read/write isolation before connecting clients.
3. Add offers, reservations, availability and outbox. Concurrently test offer expiry, duplicate commands and overlapping reservations with real independent PostgreSQL sessions.
4. Add stops, waiting, schedule and recurring agreements. Exercise ambiguous times, accepted quote revisions and uniqueness across concurrent occurrence generation.
5. Add pooling and ledger tables. Race allocations on overlapping and disjoint segments. Test consent revocation, unauthorized fare augmentation and idempotent payment posting.
6. Promote migrations from an empty test DB and from a representative previous revision. Back up before promotion, check index locks and RLS, and use additive compatibility changes followed by backfill and validation. Keep destructive cleanup in a separately reviewed release.

This is a migration design. The demo milestone does not create or migrate a Supabase database.
