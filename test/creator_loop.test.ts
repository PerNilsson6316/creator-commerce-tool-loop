import assert from "node:assert/strict";
import { decideActions, RequestBody } from "../src/creator_loop.js";

const input = RequestBody.parse({ orderId: "ord_7", buyerEmail: "buyer@example.com", assetTitle: "Lightroom presets", subscriberIds: ["sub_a"], content: "Preset notes" });
const actions = decideActions(input);
assert.deepEqual(actions.map((action) => action.name), ["deliver_asset", "notify_subscribers", "process_content"]);
assert.equal(actions[0].arguments.orderId, "ord_7");
console.log("creator decision test passed");
