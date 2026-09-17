# SQUARGRAPH Control production platform roadmap

SQUARGRAPH Control is intended to operate as a multi-tenant website operations SaaS, not a demo dashboard.

## Provider registry

Source & deployment: GitHub, GitLab, Bitbucket, Cloudflare, Vercel, Netlify.

Data & CMS: Supabase, Firebase, Sanity, Contentful, Strapi, WordPress.

Communication: Twilio, WhatsApp, Resend, SendGrid, Slack.

Commerce: Razorpay, Stripe, Shopify, WooCommerce.

Operations & analytics: Shiprocket, Google Analytics, Search Console, Meta Pixel.

## Required production guarantees

- Provider credentials must be stored server-side and encrypted. Never expose access tokens to browser code.
- Every resource is scoped to an authenticated organization/workspace.
- Role-based access controls must be enforced server-side, not only in the React UI.
- Scans and deployments run as background jobs with durable status and audit events.
- Realtime UI state is sourced from persisted job/event records rather than placeholder timestamps.
- File and media uploads use object storage with MIME/size validation and signed access URLs.
- Deploy actions require explicit confirmation and produce a provider-native deployment record.
- Rollbacks reference a known healthy revision and are audited.
- OAuth callbacks validate state and PKCE where supported; provider scopes follow least privilege.
- Billing entitlements determine site, storage, deployment and seat limits.
- Google and Apple sign-in require provider credentials/configuration in the deployment environment before being enabled for customers.

## Implementation order

1. Persistent auth, organizations, memberships, sessions and RBAC.
2. Encrypted integration credential vault and OAuth callback framework.
3. Durable website/provider records and background job queue.
4. Source/deployment operations and live deployment logs.
5. CMS/data operations and asset storage.
6. Communication, commerce, analytics and operations adapters.
7. Subscription billing and usage entitlements.
8. Security hardening, rate limiting, audit export and production observability.

The existing React adapter UI is the control-plane foundation. Provider labels or simulated responses must not be presented as a successful live connection until a real credential-backed adapter has verified the provider API.
