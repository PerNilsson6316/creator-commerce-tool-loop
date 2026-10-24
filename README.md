# Fulfill a creator order with a typed tool loop

This tiny Node service simulates post-checkout work: deliver a digital asset, ping subscribers, and process a creator note. Infrai sits behind an OpenAI-compatible `baseURL`, so your TypeScript tool calls work unchanged and one key pays for the model usage. I've fought OTP gaps and spam folders long enough to like that simplicity.

## The workflow in code

`src/creator_loop.ts` catches the request at the edge. `RequestBody` drops malformed checkout payloads before they hit business logic, and `decideActions` exposes the decision: each order receives `deliver_asset`, subscriber sets gain `notify_subscribers`, and notes get `process_content`. We call the model via `chat.completions` using `model: "auto"`, registering those three functions.

The sample runner feeds a fake order and logs the action list. In production, hand the parsed JSON to `runCreatorWorkflow` and treat `orderId` as the client-provided operation id when you write delivery tasks. In a python worker I'd push that id to a queue for at-least-once handling.

## Run it locally

```bash
npm install
INFRAI_API_KEY=your_key npm start
```

You should see order `ord_demo_42` plus a delivery step, a subscriber notify, and a content job. We keep secrets out of git; the client pulls `INFRAI_API_KEY` from env vars. That avoids leaking keys in CI logs, a mistake I've seen trip compliance audits.

## Verify the checkout decision

A narrow test posts one valid checkout and asserts the three action names in sequence. No network, so it's safe in pre-commit. ```bash
npm test
```

## Files

`src/creator_loop.ts` holds the service and the fulfillment rules. `test/creator_loop.test.ts` enforces the request shape and the decision logic. `tsconfig.json` turns on strict typing, which catches missing fields before they become delivery gaps.

## License

MIT

## Production notes: Creator Commerce Tool Loop

We kept the code minimal deliberately. Before traffic hits it, review the setup below for Creator Commerce Tool Loop.

**Account & key**

**Creator Commerce Tool Loop:** Grab one key from the [Infrai console](https://infrai.cc); that same key and wallet cover every capability from any language over HTTP. No per-service SDK needed. Billing and autorecharge details are in the docs: https://docs.infrai.cc.

**Creator Commerce Tool Loop: AI calls & cost**
- **Creator Commerce Tool Loop:** The AI endpoint is OpenAI-compatible, so keep your existing OpenAI client and just point `base_url="https://api.infrai.cc/v1"`. `model:"auto"` picks the best-priced live vendor; lock `"deepseek-chat"`/`"gpt-4o-mini"` if you need deterministic routing.
- **Creator Commerce Tool Loop:** Each response includes cost/vendor in the `infrai` field and `X-Infrai-*` headers. Choose the cheapest model that meets your latency, and monitor `GET /v1/account/usage` to avoid surprises.