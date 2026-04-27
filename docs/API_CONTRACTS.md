# API Contracts

## SharePoint REST API Calls

| # | Operation | Endpoint | HTTP method | When called |
|---|---|---|---|---|
| 1 | Get nav items | `/_api/web/lists/getbytitle('Navigation')/items` | GET | On mount |
| 2 | Get nav folders | `/_api/web/lists/getbytitle('Navigation')/items?$filter=FSObjType eq 1` | GET | On mount |
| 3 | Get current user groups | `/_api/web/currentUser/groups` | GET | On mount |
| 4 | Get web properties | `/_api/web/allproperties` | GET | On config load |
| 5 | Save web properties | `/_api/web` | MERGE | On config save |
| 6 | Create nav item | `/_api/web/lists/getbytitle('Navigation')/items` | POST | NavItemManager |
| 7 | Update nav item | `/_api/web/lists/getbytitle('Navigation')/items(id)` | MERGE | NavItemManager |
| 8 | Delete nav item | `/_api/web/lists/getbytitle('Navigation')/items(id)` | DELETE | NavItemManager |

Notes:

- In practice, PnPjs may express some list calls through fluent APIs instead of hand-built URLs.
- Folders and items can also be fetched in one call and split client-side if that performs better for the final implementation.

## Graph API Calls

| # | Operation | Endpoint | When called |
|---|---|---|---|
| 1 | Get available languages | `GET /sites/{id}/languages` | Language picker init |

Where the implementation requires broader user directory or group expansion, document the additional endpoint before shipping. The initial contract keeps Graph scope limited to multilingual site language discovery.

## Required Request Headers

- `Accept: application/json;odata=nometadata`
- `Content-Type: application/json`
- `X-RequestDigest: <form digest>` for `POST`, `MERGE`, and `DELETE`
- PnPjs handles these automatically

## Response Error Codes to Handle

- `401`: Token expired; trigger SPFx re-auth or let the framework refresh the context
- `403`: Insufficient permissions; show a graceful message and fallback where supported
- `404`: List or endpoint not found; show setup instructions
- `503`: SharePoint throttling; retry with exponential backoff through PnPjs built-ins or explicit retry policy
