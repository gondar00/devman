import { defineEval } from "eve/evals";

export default defineEval({
  description: "Agent boots, responds, and identifies as LGTM / dev man.",
  async test(t) {
    await t.send("hey");
    t.succeeded();
    t.messageIncludes(/dev man|lgtm|brief|github|linear/i);
  },
});
