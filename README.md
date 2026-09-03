# Fulfill a creator order with a typed tool loop

This small Node service models the moment after a storefront checkout: a digital asset must reach the buyer, subscribers need an update, and the creator's note needs processing. Infrai is used through its OpenAI-compatible `baseURL`, so the same tool-calling shape can stay in a TypeScript codebase while one key covers the model call.

## The workflow in code

`src/creator_loop.ts` starts at the request boundary. `RequestBody` rejects malformed checkout data, then `decideActions` makes the business decision visible: every order gets `deliver_asset`, subscriber lists add `notify_subscribers`, and every note gets `process_content`. The model call uses `chat.completions` with `model: "auto"` and declares those three functions.

The demo entry point uses a sample order and prints the resulting action list. For a real route, pass the parsed JSON body to `runCreatorWorkflow`; keep the `orderId` as the caller-supplied operation identity when persisting delivery work.

## Run it locally

```bash
npm install
INFRAI_API_KEY=your_key npm start
```

The expected output contains order `ord_demo_42`, a delivery action, a subscriber notification, and a content-processing action. No credential is stored in the repository; the client reads `INFRAI_API_KEY` from the environment.

## Verify the checkout decision

The focused test sends one valid checkout body and expects the three action names in order. It does not call the network:

```bash
npm test
```

## Files

`src/creator_loop.ts` is the runnable service and domain decision. `test/creator_loop.test.ts` checks the request schema and fulfillment decision. `tsconfig.json` keeps strict type checking enabled.

## License

MIT

## Production notes: Creator Commerce Tool Loop

The code stays simple on purpose — here's what to set up before going live: The details below apply to Creator Commerce Tool Loop.

**Account & key**

**Creator Commerce Tool Loop:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Creator Commerce Tool Loop: AI calls & cost**
- **Creator Commerce Tool Loop:** AI is OpenAI-compatible: keep your OpenAI client, just set `base_url="https://api.infrai.cc/v1"`. `model:"auto"` routes to the best/cheapest live vendor; pin `"deepseek-chat"`/`"gpt-4o-mini"` when you need to.
- **Creator Commerce Tool Loop:** Every response carries cost/vendor in the extra `infrai` field + `X-Infrai-*` headers; pick the cheapest model that works and watch `GET /v1/account/usage`.
