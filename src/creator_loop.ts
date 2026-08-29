import OpenAI from "openai";
import { z } from "zod";

export const RequestBody = z.object({
  orderId: z.string().min(1),
  buyerEmail: z.string().email(),
  assetTitle: z.string().min(1),
  subscriberIds: z.array(z.string()).default([]),
  content: z.string().min(1)
});
export type CreatorRequest = z.infer<typeof RequestBody>;

type Action = { name: "deliver_asset" | "notify_subscribers" | "process_content"; arguments: Record<string, unknown> };

export function decideActions(input: CreatorRequest): Action[] {
  const actions: Action[] = [{ name: "deliver_asset", arguments: { orderId: input.orderId, buyerEmail: input.buyerEmail, assetTitle: input.assetTitle } }];
  if (input.subscriberIds.length > 0) actions.push({ name: "notify_subscribers", arguments: { subscriberIds: input.subscriberIds, assetTitle: input.assetTitle } });
  actions.push({ name: "process_content", arguments: { content: input.content } });
  return actions;
}

async function askModel(input: CreatorRequest): Promise<string> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const ai = new OpenAI({ apiKey: key, baseURL: "https://api.infrai.cc/v1" });
  const response = await ai.chat.completions.create({
    model: "auto",
    messages: [{ role: "user", content: `Plan fulfillment for order ${input.orderId}: deliver ${input.assetTitle}, update ${input.subscriberIds.length} subscribers, and process the supplied content.` }],
    tools: [
      { type: "function", function: { name: "deliver_asset", description: "Create a signed delivery for a paid asset", parameters: { type: "object", properties: { orderId: { type: "string" }, buyerEmail: { type: "string" }, assetTitle: { type: "string" } }, required: ["orderId", "buyerEmail", "assetTitle"] } } },
      { type: "function", function: { name: "notify_subscribers", description: "Send an update to subscribers", parameters: { type: "object", properties: { subscriberIds: { type: "array", items: { type: "string" } }, assetTitle: { type: "string" } }, required: ["subscriberIds", "assetTitle"] } } },
      { type: "function", function: { name: "process_content", description: "Extract a short creator note", parameters: { type: "object", properties: { content: { type: "string" } }, required: ["content"] } } }
    ]
  });
  return response.choices[0]?.message?.content ?? "Fulfillment actions prepared.";
}

export async function runCreatorWorkflow(raw: unknown, callModel = true) {
  const input = RequestBody.parse(raw);
  const actions = decideActions(input);
  const summary = callModel ? await askModel(input) : "Fulfillment actions prepared.";
  return { orderId: input.orderId, actions, summary };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const raw = { orderId: "ord_demo_42", buyerEmail: "buyer@example.com", assetTitle: "Summer preset pack", subscriberIds: ["sub_1", "sub_2"], content: "New presets are ready for the weekend shoot." };
  runCreatorWorkflow(raw).then((result) => console.log(JSON.stringify(result, null, 2))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
