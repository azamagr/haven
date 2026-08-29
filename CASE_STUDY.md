# Case Study: Building Haven

## The problem

Independent hosts — someone with a spare cabin, a studio apartment, a family cottage they rent out a few times a year — are underserved by both ends of the market. Big platforms are built for scale and charge for it; a spreadsheet and a WhatsApp group don't prevent double-bookings or show a host whether they're actually making money on a listing. Haven is scoped for the middle: a small, self-hostable booking platform that does the three things that actually matter — list a place, book it without conflicts, and see how it's performing — without pretending to be a global marketplace.

I built it as the final project of a six-week full-stack internship, specifically to combine what each earlier task taught in isolation (auth, file uploads, dashboards, testing, deployment) into one product that has to make them work *together* — a booking can't exist without a listing, a dashboard is meaningless without real aggregated booking data, and a photo upload only matters if it's still there after a serverless function cold-starts on the next request.

## Tech choices, and why

**Express + MongoDB over anything else.** Two related resources (Listings, Bookings) with a flexible-ish schema (a listing's fields don't change per-booking, but the relationship between them is what matters) fit a document database well, and Mongoose's schema validation gives server-side validation almost for free, which matters when the whole app's philosophy is "never trust the client."

**JWT over sessions.** The frontend and backend are deployed on two completely different platforms (GitHub Pages and Vercel) with no shared domain or cookie jar. A stateless bearer token that the client attaches itself sidesteps cross-origin cookie complications entirely, at the cost of the client being responsible for storing it — an acceptable trade for a project this size.

**Cloudinary over local disk for photos.** The obvious first instinct — save the uploaded file to an `uploads/` folder — silently fails the moment you deploy to a serverless platform, because Vercel's functions don't persist a filesystem between invocations. Rather than discover this in production, the upload path streams straight from memory (via Multer) to Cloudinary and only ever stores a URL. This was a lesson carried over directly from an earlier task in the internship that hit exactly this wall.

**Recharts for the dashboard.** Needed something that plays well with React state and doesn't require learning a separate charting DSL. The aggregation that feeds it happens in MongoDB (via `$group`/`$match` pipelines), not in the browser — the API returns numbers already summed by month and by listing, not raw booking documents for the client to crunch.

**Hash-based routing on the frontend**, not clean URLs. GitHub Pages has no server-side rewrites, so a direct visit to a deep link like `/haven/dashboard/edit/abc123` would 404 without extra infrastructure (a custom 404.html redirect trick). For a project already carrying a lot of scope, hash routing (`/haven/#/dashboard/edit/abc123`) is the pragmatic choice — it always works on static hosting with zero extra configuration, at the cost of slightly less clean URLs, which isn't a stated requirement here the way it was for an earlier SEO-focused task.

## One challenge: a validation bug that hid its own error message

While writing the booking flow's tests, one kept failing in a way that made no sense: submitting a booking for more guests than a listing allowed should show *"This listing sleeps a maximum of 3 guests"* — instead, nothing happened. No error, no submission, no console output. The custom validation function wasn't even being called.

The instinct was to suspect the test — maybe the simulated typing wasn't landing in the right field, maybe there was a timing issue with React's state updates. Adding a `console.log` at the top of the validation function proved the tests were fine: the function genuinely never ran. That meant the form's `onSubmit` handler itself wasn't firing.

The actual cause was one line of markup, written weeks earlier without a second thought: the "max guests" input had a plain HTML `max` attribute *and* a custom validation message for the same rule. Browsers run their own constraint validation on a form the instant you click submit, before your `onSubmit` handler ever gets a chance to run — and if any field violates its native `min`/`max`/`required`/`type` attributes, the browser silently blocks the submit event outright. My custom, actually-helpful error message never had a chance to appear, because the browser's own (invisible, silent) validation was winning the race every time.

The fix was one attribute — `noValidate` on every form in the app — but finding it meant recognizing that "the function isn't being called" and "the validation is wrong" are different bugs, and only one console.log separated a wasted afternoon from a five-minute fix. It's also the kind of bug that's genuinely easy to ship without noticing: it doesn't throw, doesn't log, and the form just... does nothing, which reads to a rushed tester as "huh, maybe I clicked wrong" rather than "this is broken." Writing the test is what actually surfaced it — this exact interaction was never manually tested carefully enough to notice the browser was quietly winning.
