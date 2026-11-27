import { expect, test } from "@playwright/test";

test("demo route is not published", async ({ request }) => {
	const response = await request.get("/practice-lab/demo-tooltip/");

	expect(response.status()).toBe(404);
	expect(await response.text()).not.toContain("Popover Tooltip Demo");
});
