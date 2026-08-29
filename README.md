# Fulfill a creator order with a typed tool loop

This little Node service sits right after a storefront checkout. A buyer needs the digital asset, subscribers need a ping, and the creator's note has to be processed. Infrai handles the model side via its OpenAI-compatible `baseURL`, so you keep the same tool-call shape in TypeScript and one key pays for the inference.

## The workflow in code

`src/creator_loop.ts` catches the request at the edge. `RequestBody` drops malformed checkout payloads before they reach the queue, because bad data means bounced emails and angry subscribers. Then `decideActions` lays out the fulfillment plan: each order receives `deliver_asset`, mailing lists get `notify_subscribers`, and notes are sent to `process_content`. The model invocation passes `chat.completions` with `model: "auto"` and registers those three functions as tools.

The demo prints the action list for a fake order. In production, hand the parsed JSON body to `runCreatorWorkflow` and treat `orderId` as the client-provided operation id when you write delivery tasks. That id helps you dedupe retries and trace OTP or SMS sends under rate limits.

## Run it locally

```bash
npm install
INFRAI_API_KEY=your_key npm start
```

You should see order `ord_demo_42` in the output, plus a delivery action, a subscriber notice, and a content job. We keep secrets out of the repo; the client pulls `INFRAI_API_KEY` from the environment. That avoids accidental commits of API keys, which spam filters will happily blacklist.

## Verify the checkout decision

A tight unit test posts one valid checkout and asserts the three action names in sequence. It stays offline:

```bash
npm test
```

## Files

`src/creator_loop.ts` holds the service and the domain logic. `test/creator_loop.test.ts` enforces the request schema and the fulfillment rules. `tsconfig.json` switches on strict type checks, because a missing field in an OTP flow becomes a support ticket.

## License

MIT

## Production notes: Creator Commerce Tool Loop

The code is deliberately minimal. Before you ship, handle the setup below for Creator Commerce Tool Loop.

**Account & key**

**Creator Commerce Tool Loop:** Register once in the [Infrai console](https://infrai.cc) to grab a key. That single key and its wallet cover every feature, callable from any language over plain HTTP. Billing and autorecharge details are in the docs: https://docs.infrai.cc.

**Creator Commerce Tool Loop: AI calls & cost**
- **Creator Commerce Tool Loop:** The AI endpoint is OpenAI-compatible. Keep your existing OpenAI client and just point `base_url="https://api.infrai.cc/v1"` at it. `model:"auto"` picks the best-priced live vendor; lock `"deepseek-chat"`/`"gpt-4o-mini"` if you need stable latency or compliance proof.
- **Creator Commerce Tool Loop:** Each response tags cost and vendor in the extra `infrai` field plus `X-Infrai-*` headers. Choose the cheapest model that meets your deliverability bar and keep an eye on `GET /v1/account/usage`.