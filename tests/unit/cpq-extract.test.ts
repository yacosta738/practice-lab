import { describe, expect, it } from "vitest";
import { extractExamCatalog } from "../../scripts/lib/cpq-extract.mjs";

describe("extractExamCatalog", () => {
	it("extracts literal catalog values without executing bundle side effects", () => {
		(globalThis as { cpqSideEffect?: boolean }).cpqSideEffect = false;
		const source = `globalThis.cpqSideEffect = true; const exams = [{ id: "ccarf", code: "CCAR-F", title: "Architect", blurb: "Practice", domains: ["D"], questions: [] }]; export { exams };`;
		expect(extractExamCatalog(source)).toMatchObject([{ id: "ccarf", code: "CCAR-F" }]);
		expect((globalThis as { cpqSideEffect?: boolean }).cpqSideEffect).toBe(false);
	});

	it("resolves nested top-level literal bindings used by catalog properties", () => {
		const source = `const questions = [{ id: "1.1", domain: "D", text: "Q", options: ["A", "B"], answer: ["A"], rationale: "R" }]; const domains = ["D"]; const exams = [{ id: "ccarf", code: "CCAR-F", title: "Architect", blurb: "Practice", domains, questions }]; export { exams };`;
		expect(extractExamCatalog(source)).toMatchObject([
			{ id: "ccarf", domains: ["D"], questions: [{ id: "1.1" }] },
		]);
	});

	it("does not allow a literal __proto__ key to mutate extracted object prototypes", () => {
		const source = `const exams = [{ id: "ccarf", code: "CCAR-F", title: "A", blurb: "B", domains: [], questions: [], "__proto__": { polluted: true } }]; export { exams };`;
		const catalog = extractExamCatalog(source);
		expect(Object.getPrototypeOf(catalog[0])).toBeNull();
		expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
	});

	it("fails closed on identifier cycles", () => {
		const source = `const a = b; const b = a; const exams = [{ id: "ccarf", code: "CCAR-F", title: "A", blurb: "B", domains: [], questions: a }]; export { exams };`;
		expect(() => extractExamCatalog(source)).toThrow(/cycle|non-literal|unsupported/i);
	});

	it("fails closed when the catalog contains executable expressions", () => {
		const source = `const exams = [{ id: "ccarf", code: "CCAR-F", title: "A", blurb: "B", domains: [], questions: [sideEffect()] }]; export { exams };`;
		expect(() => extractExamCatalog(source)).toThrow(/non-literal|unsupported/i);
	});

	it("fails closed when no supported catalog is present", () => {
		expect(() => extractExamCatalog("export const exams = getCatalog();")).toThrow(
			/catalog|literal/i,
		);
	});
	it.each(["let", "var"])("supports unchanged %s bindings", (kind) => {
		expect(
			extractExamCatalog(
				`${kind} domains = ["D"]; const exams = [{id:"x",code:"X",title:"T",domains,questions:[]}];`,
			)[0].domains,
		).toEqual(["D"]);
	});

	it.each([
		'domains = ["Other"];',
		'domains ||= ["Other"];',
		"domains++;",
		'({ domains } = { domains: ["Other"] });',
		'[domains] = [["Other"]];',
		'for (domains of [["Other"]]) {}',
		'function change() { domains = ["Other"]; }',
	])("rejects reassignment even after catalog declaration: %s", (write) => {
		const source = `let domains = ["D"]; const alias = domains; const exams = [{id:"x",code:"X",title:"T",domains:alias,questions:[]}]; ${write}`;
		expect(() => extractExamCatalog(source)).toThrow(/unsupported|non-literal/i);
	});

	it("ignores writes to unrelated and shadowing bindings", () => {
		const source = `var domains = ["D"]; let other = 1; other++; function change(domains) { domains = []; } { let domains = []; domains = ["local"]; } const exams = [{id:"x",code:"X",title:"T",domains,questions:[]}];`;
		expect(extractExamCatalog(source)[0].domains).toEqual(["D"]);
	});
	it("rejects reassignment of the catalog binding itself", () => {
		expect(() =>
			extractExamCatalog(
				`var exams = [{id:"x",code:"X",title:"T",domains:[],questions:[]}]; exams = [];`,
			),
		).toThrow(/unsupported|non-literal/i);
	});
	it.each(['for (var domains of [["Other"]]) {}', '{ var domains = ["Other"]; }'])(
		"rejects writes through a hoisted var declaration: %s",
		(write) => {
			expect(() =>
				extractExamCatalog(
					`var domains = ["D"]; ${write} const exams = [{id:"x",code:"X",title:"T",domains,questions:[]}];`,
				),
			).toThrow(/unsupported|non-literal/i);
		},
	);
});
