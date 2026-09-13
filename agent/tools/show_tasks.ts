import { defineTool } from "eve/tools";
import { z } from "zod";

const taskSchema = z.object({
  id: z.string(),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  title: z.string(),
  context: z.string(),
  source: z.enum(["linear", "github"]),
  url: z.string().optional(),
  estimatedHours: z.number().default(2),
});

export default defineTool({
  description:
    "Display the prioritized task list as interactive cards in the UI. Call this AFTER synthesizing the briefing to render actionable tasks the user can execute.",
  inputSchema: z.object({ tasks: z.array(taskSchema) }),
  async execute({ tasks }) {
    return { tasks };
  },
});
