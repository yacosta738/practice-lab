import { parse } from "acorn";

function literal(node, bindings, resolving = new Set()) {
	switch (node.type) {
		case "Identifier": {
			if (!bindings.has(node.name))
				throw new Error(`Unsupported non-literal identifier: ${node.name}`);
			if (resolving.has(node.name)) throw new Error(`Literal binding cycle: ${node.name}`);
			resolving.add(node.name);
			const value = literal(bindings.get(node.name), bindings, resolving);
			resolving.delete(node.name);
			return value;
		}
		case "MemberExpression": {
			const object = literal(node.object, bindings, resolving);
			if (node.computed) {
				if (node.property.type !== "Literal" || !Number.isInteger(node.property.value))
					throw new Error("Unsupported computed catalog value");
				if (!Array.isArray(object) || node.property.value < 0)
					throw new Error("Unsupported static catalog index");
				return object[node.property.value];
			}
			if (!object || typeof object !== "object" || !Object.hasOwn(object, node.property.name))
				throw new Error("Unsupported static catalog property");
			return object[node.property.name];
		}
		case "TemplateLiteral":
			if (node.expressions.length === 0) return node.quasis[0].value.cooked;
			break;
		case "Literal":
			if (
				typeof node.value === "string" ||
				typeof node.value === "number" ||
				typeof node.value === "boolean" ||
				node.value === null
			)
				return node.value;
			break;
		case "UnaryExpression":
			if (
				node.operator === "-" &&
				node.argument.type === "Literal" &&
				typeof node.argument.value === "number"
			)
				return -node.argument.value;
			break;
		case "ArrayExpression":
			return node.elements.map((element) => {
				if (!element || element.type === "SpreadElement")
					throw new Error("Unsupported non-literal catalog value");
				return literal(element, bindings, resolving);
			});
		case "ObjectExpression": {
			const value = Object.create(null);
			for (const property of node.properties) {
				if (
					property.type !== "Property" ||
					property.computed ||
					property.kind !== "init" ||
					property.method
				)
					throw new Error("Unsupported non-literal catalog value");
				const key = property.key.name ?? property.key.value;
				if (typeof key !== "string") throw new Error("Unsupported catalog key");
				value[key] = literal(property.value, bindings, resolving);
			}
			return value;
		}
	}
	throw new Error(`Unsupported non-literal catalog expression: ${node.type}`);
}

function children(node) {
	const values = [];
	for (const [key, value] of Object.entries(node)) {
		if (key === "parent" || key === "loc") continue;
		if (Array.isArray(value))
			values.push(...value.filter((item) => item && typeof item.type === "string"));
		else if (value && typeof value.type === "string") values.push(value);
	}
	return values;
}

export function extractExamCatalog(source) {
	let ast;
	try {
		ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
	} catch (error) {
		throw new Error(`Unsupported or malformed catalog bundle: ${error.message}`);
	}
	const bindings = new Map();
	for (const statement of ast.body) {
		if (statement.type !== "VariableDeclaration") continue;
		for (const declaration of statement.declarations) {
			if (declaration.id.type === "Identifier" && declaration.init) {
				if (bindings.has(declaration.id.name))
					throw new Error(`Duplicate top-level binding: ${declaration.id.name}`);
				bindings.set(declaration.id.name, declaration.init);
			}
		}
	}
	const candidates = [];
	const visit = (node) => {
		if (
			node.type === "ArrayExpression" &&
			node.elements.length > 0 &&
			node.elements.every((element) => element?.type === "ObjectExpression")
		) {
			try {
				const value = literal(node, bindings);
				if (
					value.every(
						(item) =>
							["id", "code", "title", "domains", "questions"].every((key) => key in item) &&
							Array.isArray(item.domains) &&
							item.domains.every((domain) => typeof domain === "string") &&
							Array.isArray(item.questions) &&
							typeof item.id === "string" &&
							typeof item.code === "string" &&
							typeof item.title === "string",
					)
				)
					candidates.push(value);
			} catch {
				// A matching shape with executable values is not data and is rejected below.
				const keys = node.elements.map((item) =>
					item.properties.map((property) => property.key?.name ?? property.key?.value),
				);
				if (
					keys.every((item) =>
						["id", "code", "title", "domains", "questions"].every((key) => item.includes(key)),
					)
				)
					throw new Error("Unsupported non-literal catalog expression");
			}
		}
		for (const child of children(node)) visit(child);
	};
	visit(ast);
	if (candidates.length !== 1)
		throw new Error(
			`Could not identify one supported literal exam catalog (found ${candidates.length})`,
		);
	return candidates[0];
}
