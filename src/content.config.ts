import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const study = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/study", deferRender: true }),
	schema: z.looseObject({
		title: z.string(),
		domain: z.string().optional(),
		dominio: z.string().optional(),
		domain_name: z.string().optional(),
		type: z.string().optional(),
		tipo: z.string().optional(),
		status: z.string().optional(),
		certification: z.string().optional(),
		updated: z.union([z.string(), z.date()]).optional(),
		tags: z.unknown().optional(),
		aliases: z.unknown().optional(),
	}),
});

export const collections = { study };
