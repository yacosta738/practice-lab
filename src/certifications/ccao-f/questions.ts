// CCAO-F question bank — source attribution is recorded per entry.

import type { Question } from "../../lib/quiz-types";

const testAppSource = {
	label:
		"Adapted from TestApp author (name not provided; reuse permission confirmed by maintainer), Claude-generated CCAO-F practice set; not official exam questions",
	url: "https://drive.google.com/file/d/1v0ZBWPXIIMSE9u48_WdZ7hg7mFCuFufh/view",
};

export const questions: Question[] = [
	{
		id: "CPQ-ccaof-1.1",
		domain: "D1",
		question:
			"A marketing associate types “write something about our new product” and is disappointed with the generic result. Which revision best reflects effective prompting for a business task?",
		options: [
			"“Write something better about our new product.”",
			"“Write a 150-word LinkedIn post announcing our scheduling app to small-business owners; friendly, professional tone; end with a waitlist call to action.”",
			"“Write about our product” repeated three times in a row so the model understands the request is serious and takes it seriously.",
			"“You are the world’s greatest copywriter, with decades of award-winning experience. Write something about our product that really captures how great it is.”",
		],
		correctAnswers: [1],
		explanation:
			"Effective prompts supply the ingredients the model cannot guess: the deliverable, its length, the audience, the tone, and the goal. The revision specifies all five, so the output can actually match intent.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A adds pressure without information; C repeats the same missing context; D adds a persona but still omits audience, format, and purpose — the details that determine the result.",
	},
	{
		id: "CPQ-ccaof-1.2",
		domain: "D1",
		question:
			"An operations lead must produce a quarterly review covering budget variance, project status, staffing, and next-quarter risks. A single prompt asking for the whole document produces shallow, uneven coverage. Which technique addresses this?",
		options: [
			"Ask for the whole document again, but double the requested word count so every section has enough room to be covered in proper depth",
			"Ask Claude to try harder on the weak sections",
			"Switch to bullet points only, so gaps are less visible",
			"Decompose it: work through each section as its own request, review each one, then ask for a combined, consistent draft",
		],
		correctAnswers: [3],
		explanation:
			"Task decomposition turns one overloaded request into a sequence of focused ones. Each section gets full attention, errors are caught at the step where they occur, and the final assembly starts from verified parts.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A produces longer shallow coverage, not deeper; B is not an instruction the model can act on; C hides the problem instead of fixing it.",
	},
	{
		id: "CPQ-ccaof-1.3",
		domain: "D1",
		question:
			"Claude’s first draft of a client email is too formal and buries the key request in the final paragraph. What is the most effective way to iterate?",
		options: [
			"Give specific feedback: “Make it warmer and more conversational, and move the request to reschedule into the opening two sentences”",
			"Send the identical prompt again without any changes and hope the natural variation between responses produces a better draft",
			"Start a brand-new conversation and retype the original prompt",
			"Accept the draft as it stands and edit everything manually yourself, since iterating with the model rarely improves anything much",
		],
		correctAnswers: [0],
		explanation:
			"Iteration works when feedback is specific and actionable: name what is wrong and what “better” looks like. The model can then revise deliberately rather than regenerate blindly.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and C rely on luck — the same input tends to produce the same shortcomings; D forfeits the fastest path to a good draft when one targeted instruction would fix it.",
	},
	{
		id: "CPQ-ccaof-1.4",
		domain: "D1",
		question:
			"A project manager wants to use Claude for two different tasks: brainstorming names for an internal program, and drafting the program’s formal charter. How should the prompting strategy differ between the two?",
		options: [
			"Both tasks should use identical prompts, since prompting principles are universal",
			"The brainstorm should specify exact formatting rules and strict limits; the charter should ask for maximum creativity and give the model complete freedom over structure",
			"For the brainstorm, ask for many varied options and defer judgment; for the charter, provide structure, required sections, tone, and constraints",
			"Brainstorming should be avoided, as models cannot generate original ideas",
		],
		correctAnswers: [2],
		explanation:
			"Adapting strategy to task type means matching the prompt to the goal: divergent tasks want volume, variety, and loose constraints; convergent drafting wants explicit structure, tone, and requirements.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A ignores that the two tasks have opposite goals; B applies each strategy to the wrong task; D is simply false — idea generation is one of the strongest use cases.",
	},
	{
		id: "CPQ-ccaof-1.5",
		domain: "D1",
		question:
			"An analyst pastes a table of regional sales figures and asks Claude to “analyze this.” The response is a bland restatement of the numbers. Which revised request produces genuinely useful analysis?",
		options: [
			"“Take another look at this data and analyze it again, but this time go much deeper and be far more thorough about it.”",
			"“Identify the three regions with the largest quarter-over-quarter decline, suggest explanations to investigate, and flag anything unusual — we’re deciding where to focus retention next quarter.”",
			"“Analyze this table exactly the way a world-class data scientist would: bring the full weight of statistical expertise, professional intuition, and years of hard-won industry experience to bear on it.”",
			"“Summarize this table in half the length.”",
		],
		correctAnswers: [1],
		explanation:
			"Analysis prompts work when they state the questions to answer, the criteria that matter, and the decision the analysis feeds. That converts “describe the data” into “help me decide.”",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and C restyle the request without telling the model what to look for; D asks for compression, which is the opposite of analysis.",
	},
	{
		id: "CPQ-ccaof-1.6",
		domain: "D1",
		question:
			"A communications officer has a detailed technical incident report and must brief the executive team. Which prompt element matters most for getting a usable result on the first pass?",
		options: [
			"Asking Claude to keep every technical detail from the report in the briefing so that absolutely nothing is lost in translation",
			"Requesting the longest possible output to demonstrate thoroughness",
			"Asking for the briefing to be written in a language the executive team does not speak, so that confidentiality of the incident details is fully preserved",
			"Stating the audience and needs: “for non-technical executives — one page, lead with customer impact and cost, end with the three decisions we need”",
		],
		correctAnswers: [3],
		explanation:
			"Audience is the highest-leverage instruction in adaptation tasks. Naming who will read it, what they care about, and what they must do converts a technical artifact into a decision-ready briefing.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A recreates the original problem — executives drowning in detail; B confuses length with value; C is a nonsensical control that defeats the purpose of a briefing.",
	},
	{
		id: "CPQ-ccaof-1.7",
		domain: "D1",
		question:
			"Which TWO elements most improve a prompt for drafting a customer-facing announcement? (Select TWO.)",
		options: [
			"Leaving the request deliberately vague so the model can be creative",
			"Naming the audience and the purpose the announcement must achieve",
			"Writing the entire prompt in capital letters for emphasis",
			"Specifying format, length, and tone requirements for the deliverable",
			"Asking the model to guess what the company probably wants to say",
		],
		correctAnswers: [1, 3],
		explanation:
			"Audience-plus-purpose and concrete deliverable constraints are the two ingredients that let the model aim at the right target and land in the right shape — the difference between generic text and a usable draft.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and E withhold exactly the information quality depends on; C changes emphasis, not understanding.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-1.8",
		domain: "D1",
		question:
			"An operations associate must turn a 60-page vendor audit into a board-ready one-page summary, using Claude throughout. The work involves five activities: (1) Review the extracted findings against the source report for accuracy; (2) Upload the report and have Claude extract the key findings for each audit area; (3) Define the summary’s audience, purpose, and required structure; (4) Have Claude draft the one-page summary from the verified findings; (5) Refine the draft’s tone and emphasis through targeted feedback. In which order should the activities be carried out?",
		options: ["2 → 3 → 1 → 4 → 5", "3 → 2 → 1 → 4 → 5", "3 → 2 → 4 → 1 → 5", "2 → 4 → 5 → 1 → 3"],
		correctAnswers: [1],
		explanation:
			"Requirements first, verification before dependence: define what the summary must achieve (3) so the extraction is aimed at it, extract (2), verify the intermediate output before anything builds on it (1), draft from verified findings (4), and refine last (5).",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A extracts before the purpose is defined, so the extraction has no target; C drafts from unverified findings, letting errors flow downstream into the board paper; D leaves both accuracy checking and purpose-setting until after the draft exists — backwards on both counts.",
	},
	{
		id: "CPQ-ccaof-2.1",
		domain: "D2",
		question:
			"Claude produces a market summary that includes a precise statistic — “the sector grew 14.2% in 2025, according to the annual industry report” — which will appear in a board paper. What must happen before this is used?",
		options: [
			"Nothing — the precision of the number and the named source together indicate that the claim is reliable enough for the paper",
			"Ask Claude whether it is sure, and proceed if it confirms",
			"Verify the figure against the actual industry report, or another authoritative source, before it goes in the board paper",
			"Round the number to 14% so any error is smaller",
		],
		correctAnswers: [2],
		explanation:
			"Precise-looking statistics and named citations are exactly what hallucinations look like. Any factual claim bound for a high-stakes document is checked against the authoritative source, full stop.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A mistakes specificity for reliability — fabricated details are often the most specific; B asks the potentially wrong source to grade itself; D shrinks the error without checking whether there is one.",
	},
	{
		id: "CPQ-ccaof-2.2",
		domain: "D2",
		question:
			"An associate asks Claude to summarize a spreadsheet. The narrative says “headcount grew in every region,” but the accompanying table Claude produced shows one region declining. What does this signal, and what should the associate do?",
		options: [
			"An internal inconsistency — a reliability warning. Check both claims against the source spreadsheet and correct the output before use",
			"Trust the narrative, since prose reflects the model’s more considered overall reading of the data than a mechanically produced table does",
			"Trust the table, since numbers are always more reliable than prose",
			"Average the two claims and move on",
		],
		correctAnswers: [0],
		explanation:
			"When an output contradicts itself, at least one part is wrong — and the only arbiter is the source data. Internal inconsistency is one of the most useful signals that an output needs correction, not polish.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and C pick a winner arbitrarily when either could be the error; D is not a meaningful operation on contradictory claims.",
	},
	{
		id: "CPQ-ccaof-2.3",
		domain: "D2",
		question:
			"HR asks Claude to draft a job advertisement, and the result describes the ideal candidate as a “young, energetic digital native.” What is the appropriate response?",
		options: [
			"Publish it — AI-generated text is neutral by definition",
			"Ask Claude to make the ad more exciting",
			"Keep the wording but add a prominent disclaimer stating that the company is an equal-opportunity employer welcoming applicants of all ages, then publish otherwise unchanged",
			"Recognize the age-biased framing, revise the ad to describe skills and competencies, and review AI-drafted HR content for bias as standard practice",
		],
		correctAnswers: [3],
		explanation:
			"Models can reproduce biases present in everyday language, and hiring content is where that carries legal and ethical consequences. Evaluating outputs for bias — and fixing framing at the source — is part of the associate’s review job.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A is false — generated text inherits bias from patterns in language; B polishes the problem; C contradicts the ad’s own wording rather than correcting it.",
	},
	{
		id: "CPQ-ccaof-2.4",
		domain: "D2",
		question:
			"Claude drafts a supplier contract clause covering liability caps. The draft reads well and the associate cannot see anything wrong with it. What determines the next step?",
		options: [
			"Send it to the supplier — if nothing looks wrong, it is fine",
			"The stakes: legally binding language requires review by qualified legal counsel before use, however polished the draft appears",
			"Ask Claude to double-check its own clause carefully against common contract pitfalls and rely on its confirmation that the wording is sound",
			"Shorten the clause so there is less that could be wrong",
		],
		correctAnswers: [1],
		explanation:
			"Determining when human expert review is required is a judgment about consequences, not confidence. Contract language creates enforceable obligations — that category goes to counsel, and “it reads well” is not a substitute.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A confuses fluency with legal soundness — the associate is not positioned to catch what is missing; C is the drafter grading its own work; D reduces word count, not risk.",
	},
	{
		id: "CPQ-ccaof-2.5",
		domain: "D2",
		question:
			"An associate wants to fact-check the key claims in a Claude-generated research brief. Which approach constitutes genuine validation?",
		options: [
			"Asking Claude to confirm that its brief is accurate",
			"Regenerating the brief a second time and checking whether the new version says substantially the same thing as the first one did",
			"Checking each material claim against independent, authoritative sources — official publications or primary data",
			"Reading the brief carefully for spelling and grammar errors",
		],
		correctAnswers: [2],
		explanation:
			"Validation means comparison against ground truth the model did not generate. Independent authoritative sources are that ground truth; nothing produced inside the same conversation can play the role.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A asks the claim’s author to referee the claim; B tests consistency, not truth — a model can repeat the same error twice; D checks polish, which is orthogonal to accuracy.",
	},
	{
		id: "CPQ-ccaof-2.6",
		domain: "D2",
		question:
			"Claude summarizes a 30-page policy document into one page. Before circulating it, the associate wants to confirm the summary is complete, not just accurate. What is the practical check?",
		options: [
			"Confirm the summary is exactly one page as requested, since meeting the length requirement is what the instruction actually asked for",
			"Compare coverage against the source — check the document’s section headings and key provisions are each represented or consciously omitted",
			"Ask Claude whether it left anything out",
			"Count the words in the summary and the source document and confirm the compression ratio stays consistent from section to section throughout",
		],
		correctAnswers: [1],
		explanation:
			"Completeness is checked against the source’s structure: walk the headings and material provisions and confirm the summary accounts for them. Omissions are invisible in the summary itself — you have to look where they came from.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and D measure length, not coverage; C asks the summarizer to notice what it didn’t notice — the gap it missed is the gap it will miss again.",
	},
	{
		id: "CPQ-ccaof-2.7",
		domain: "D2",
		question:
			"Claude produces an accurate but dense, jargon-heavy analysis. It must now go to a customer advisory panel of non-specialists. What does good output adaptation look like?",
		options: [
			"Ask Claude to rewrite it for the panel — plain language, defined terms, lead with customer impact — then review the rewrite for accuracy",
			"Send the original — accuracy is all that matters",
			"Delete the technical sections so nothing needs explaining",
			"Keep the original dense version fully intact and add a comprehensive glossary appendix defining every technical term for the panel members to consult",
		],
		correctAnswers: [0],
		explanation:
			"Editing and adapting for the intended audience is a core evaluation skill: same substance, reshaped for the reader — followed by a fresh accuracy check, because rewriting can introduce new errors.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B delivers something the audience cannot use; C removes substance instead of translating it; D makes the reader do the adaptation the author should have done.",
	},
	{
		id: "CPQ-ccaof-2.8",
		domain: "D2",
		question:
			"During one working session an associate gets three things from Claude: a quick factual answer, a comparison of four vendors across six criteria, and a polished one-page brief that colleagues will edit and reuse. Which output formats fit?",
		options: [
			"Everything as artifacts, since artifacts are the premium format",
			"Everything inline, to keep the conversation in one place",
			"The polished brief inline in the chat, the vendor comparison as a separate chat message, and the quick factual answer as its own artifact",
			"The quick fact inline; the vendor comparison as a structured table; the reusable brief as an artifact to refine and share from",
		],
		correctAnswers: [3],
		explanation:
			"Format selection follows use: transient answers live inline, comparative data belongs in structure, and content that will be iterated, polished, and reused belongs in an artifact.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and B force one format onto three different jobs; C assigns each output to the format that suits it least.",
	},
	{
		id: "CPQ-ccaof-2.9",
		domain: "D2",
		question:
			"An associate has two Claude-drafted versions of a sensitive customer apology and must choose one. What is the soundest way to compare them?",
		options: [
			"Choose the longer one, since it covers more",
			"Define what the message must achieve — acknowledge the failure, take responsibility, state the remedy, match company voice — and assess both drafts against those criteria",
			"Ask Claude to weigh its own two drafts against each other, explain in detail which it considers the stronger piece of writing and why, and then send whichever draft the model selects",
			"Merge both drafts in full so nothing is lost",
		],
		correctAnswers: [1],
		explanation:
			"Comparing outputs is criteria work: name what success looks like, then judge both candidates against it. Claude can help critique against the criteria, but the accountable human makes the call on a sensitive communication.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A uses length as a proxy for quality; C outsources a judgment the associate is accountable for; D doubles the length and blends two tones into neither.",
	},
	{
		id: "CPQ-ccaof-2.10",
		domain: "D2",
		question:
			"After a long research conversation, the useful findings are scattered across dozens of messages mixed with dead ends. The material is needed next week by three colleagues. What should the associate do?",
		options: [
			"Forward the entire conversation transcript to the three colleagues so they can read through everything and find the useful parts themselves",
			"Rely on memory and re-ask Claude next week",
			"Curate it: have Claude consolidate the validated findings into one organized document, review and correct it, and share that",
			"Copy every message into a spreadsheet row by row",
		],
		correctAnswers: [2],
		explanation:
			"Organizing and curating is the step that turns a conversation into a work product: consolidate what survived scrutiny, structure it for the reader, verify it once, and share a single authoritative version.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A ships the mess, dead ends included, to three people who must each mine it; B gambles on regenerating what already exists; D preserves the disorder in a different container.",
	},
	{
		id: "CPQ-ccaof-2.11",
		domain: "D2",
		question:
			"An associate asks Claude how to configure a setting in their company’s internal, custom-built expense tool. Claude confidently provides step-by-step instructions. What should the associate recognize?",
		options: [
			"Claude cannot know the internals of a private company tool; the confident steps are likely plausible invention and should be checked against internal documentation",
			"The confidence of the instructions indicates Claude has genuine knowledge of the tool",
			"Claude can see the associate’s screen and is describing the actual tool",
			"Internal business tools follow universal design standards and conventions, so generic step-by-step instructions of this kind are dependable for any company’s software",
		],
		correctAnswers: [0],
		explanation:
			"A key evaluation skill is asking “could the model actually know this?” Private, internal specifics are outside any model’s knowledge — fluent instructions about them are pattern-matched guesses wearing a confident tone.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B mistakes fluency for knowledge; C attributes a capability that does not exist in a chat; D is wishful — custom tools differ in exactly the details that matter.",
	},
	{
		id: "CPQ-ccaof-2.12",
		domain: "D2",
		question:
			"Which TWO characteristics of a Claude output most strongly signal that extra verification is needed before use? (Select TWO.)",
		options: [
			"The response is well formatted, with clear headings, bullet points, and a professional document structure throughout",
			"The response contains specific figures, quotations, or citations that will be relied upon",
			"The response runs longer than two paragraphs, suggesting the model had to work harder to produce it",
			"The response uses a warm, professional tone",
			"The response makes claims about very recent events or specialized facts the associate cannot confirm themselves",
		],
		correctAnswers: [1, 4],
		explanation:
			"Risk concentrates where claims are specific, load-bearing, and beyond the reviewer’s own ability to sanity-check: exact numbers, quotes, and citations, and assertions about recent or specialized territory.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A, C, and D are presentation qualities — they carry no information about accuracy in either direction.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-2.13",
		domain: "D2",
		question:
			"A team is defining its standard validation practice for Claude-assisted work. Which TWO practices belong in it? (Select TWO.)",
		options: [
			"Check high-stakes factual claims against authoritative external sources before publication",
			"Ask Claude to rate its own confidence in each output and treat consistently high self-ratings as sufficient verification",
			"Regenerate each output twice and accept it if the versions agree",
			"Route specialized content (legal, medical, financial) to a qualified human reviewer before it is relied upon",
			"Treat any output that survives a spelling check as validated",
		],
		correctAnswers: [0, 3],
		explanation:
			"The two pillars of validation: independent sources for factual claims, and qualified human expertise for specialized, consequential content. Both compare the output against something outside the model.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and C recycle the model’s own signal — self-confidence and self-agreement are not evidence; E validates spelling, which was never the risk.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-3.1",
		domain: "D3",
		question:
			"Every month, an operations associate produces a supplier scorecard using the same 12 reference documents, the same formatting rules, and the same evaluation rubric — currently re-uploading and re-explaining everything each time. Which feature removes this overhead?",
		options: [
			"Research mode, so Claude finds the documents on the web",
			"A longer first message each month containing everything",
			"A Claude Project holding the reference documents as knowledge and the rules and rubric as instructions, so every monthly chat starts equipped",
			"Asking Claude at the start of each month to remember the documents and rules from last month’s conversation and simply carry on from there",
		],
		correctAnswers: [2],
		explanation:
			"Projects exist for recurring work with a stable foundation: knowledge and instructions are configured once and apply to every conversation in the project, eliminating repeated setup.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A searches the public web for private documents; B rebuilds the setup manually every month — the problem itself; D relies on cross-chat recall that should not be assumed for a controlled monthly process.",
	},
	{
		id: "CPQ-ccaof-3.2",
		domain: "D3",
		question:
			"A strategy associate needs a comprehensive overview of a market: competitor moves, pricing trends, and recent regulatory changes, drawn from many current sources with citations. Which approach fits?",
		options: [
			"A quick chat question with no tools, relying on training knowledge",
			"Use the research capability, which searches and synthesizes multiple current sources into a cited report",
			"Ask for the answer as a haiku to force conciseness",
			"Upload last year’s market report and ask Claude to infer what has probably changed across competitors, pricing, and regulation since it was written",
		],
		correctAnswers: [1],
		explanation:
			"Feature selection means matching depth to tooling: multi-source, current, citation-backed research is what the research capability is for — a plain chat answer cannot see recent developments or cite live sources.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A produces a potentially outdated, uncited answer for a task that demands currency; C is a format gag, not a method; D asks the model to invent the very information being researched.",
	},
	{
		id: "CPQ-ccaof-3.3",
		domain: "D3",
		question:
			"An associate is developing a client proposal with Claude and expects many rounds of revision — restructuring sections, tightening language, adjusting tone — before it is shared with colleagues. Which way of working fits best?",
		options: [
			"Keep each revision as a new pasted block in the chat and scroll to compare",
			"Retype the full proposal into every message when requesting changes",
			"Ask for the proposal one paragraph per conversation, in separate chats",
			"Develop the proposal as an artifact, so there is one evolving document to revise, review, and ultimately share",
		],
		correctAnswers: [3],
		explanation:
			"Artifacts are the right home for substantial content under iteration: one canonical version that revisions apply to directly, easy to review as a document and hand off when done.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A buries versions in scrollback with no single source of truth; B is manual duplication of what the artifact does automatically; C fragments one document across disconnected contexts.",
	},
	{
		id: "CPQ-ccaof-3.4",
		domain: "D3",
		question:
			"An associate has two tasks today: (1) a nuanced synthesis of three conflicting analyst reports into a strategy recommendation, and (2) reformatting 200 addresses into a standard layout. How should model choice differ?",
		options: [
			"The most capable model for the synthesis, where reasoning quality dominates; a fast, low-cost model for the mechanical reformatting",
			"Use the fastest model for both, since speed always wins",
			"Use the most capable model for both, since quality always wins",
			"The fast model for the synthesis and the most capable model for the address reformatting, so that spending balances out across the two tasks over the day",
		],
		correctAnswers: [0],
		explanation:
			"Model tiers exist so the work can be matched to the need: complex judgment justifies the strongest model’s cost and latency; routine transformation does not — the small model does it faster and cheaper at the same quality.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B underpowers the task where reasoning is the product; C overpays where a light model is equivalent; D inverts the logic on both tasks.",
	},
	{
		id: "CPQ-ccaof-3.5",
		domain: "D3",
		question:
			"A support team drafts hundreds of short, routine replies daily. Response speed and cost-per-reply drive the business case; the replies require no complex reasoning. Which model tier fits, and what should confirm the choice?",
		options: [
			"The most capable, highest-cost tier — anything customer-facing always justifies maximum capability, regardless of how simple the individual replies are",
			"Alternate tiers by day of week to spread the cost",
			"A fast, low-cost tier (such as Haiku-class) suited to high-volume work — confirmed by spot-checking a sample of drafts before standardizing",
			"Whichever tier was used most recently, for consistency",
		],
		correctAnswers: [2],
		explanation:
			"This is the textbook high-volume/low-complexity profile for the fast tier. The professional touch is verification: sample the output quality first, then commit — selection plus confirmation, not assumption.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A pays a premium the task cannot use, at latency the workload cannot afford; B and D are not selection logic at all.",
	},
	{
		id: "CPQ-ccaof-3.6",
		domain: "D3",
		question:
			"Midway through a long planning conversation, several key decisions have been made that will matter for future work over the coming weeks. What is the right way to make those decisions durable?",
		options: [
			"Trust that Claude will remember them whenever asked in future chats",
			"Persist them deliberately: have Claude produce a decision summary, verify it, and save it somewhere durable — such as the Project’s knowledge",
			"Keep the conversation permanently open in a browser tab and treat that tab as the team’s system of record whenever the decisions need to be consulted",
			"Repeat the entire conversation from scratch whenever the decisions are needed",
		],
		correctAnswers: [1],
		explanation:
			"Managing memory considerations means knowing what persists and what does not — and acting on it: important outcomes get captured, verified, and stored where future work will actually find them.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A assumes recall that should not carry a multi-week process; C makes a browser tab the single point of failure; D pays the full cost of the work again each time.",
	},
	{
		id: "CPQ-ccaof-3.7",
		domain: "D3",
		question:
			"Which TWO situations most clearly call for setting up a Claude Project rather than using standalone chats? (Select TWO.)",
		options: [
			"A recurring task where every conversation should draw on the same reference documents and instructions",
			"A single, one-off question that needs a quick factual answer",
			"Making the model respond noticeably faster to every request by giving it a dedicated space of its own to work within",
			"A team wanting consistent behavior — shared context, tone, and rules — across everyone’s conversations",
			"Removing the model’s context limits altogether by giving it somewhere to store an unlimited amount of conversation history",
		],
		correctAnswers: [0, 3],
		explanation:
			"Projects shine where context is stable and reused: recurring individual work on a fixed foundation, and team workstreams that need everyone’s conversations grounded in the same knowledge and instructions.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B needs no setup at all; C and E attribute powers Projects do not have — they organize context, they do not accelerate models or abolish context limits.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-4.1",
		domain: "D4",
		question:
			"A business analyst has 40 pages of raw stakeholder interview notes for a new intranet project. How can Claude best support the requirements-analysis stage?",
		options: [
			"Have Claude analyze the notes and decide the project’s final requirements itself, so stakeholders do not need to be consulted or bothered for input a second time",
			"Have Claude organize the notes into themes, extract needs and pain points, and draft a structured requirements list for the analyst to validate with stakeholders",
			"Skip the notes and ask Claude what intranets usually require",
			"Use Claude only to fix the grammar in the notes",
		],
		correctAnswers: [1],
		explanation:
			"Claude excels at the labor-intensive middle of requirements work: structuring raw qualitative input into themes and candidate requirements. The analyst keeps the judgment steps — validation and prioritization with the people who own the needs.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A removes stakeholders from decisions about their own needs; C substitutes generic patterns for what these stakeholders actually said; D uses a synthesis engine as a spell-checker.",
	},
	{
		id: "CPQ-ccaof-4.2",
		domain: "D4",
		question:
			"A project manager is kicking off an office relocation and wants help getting from a blank page to a credible plan. What is an effective use of Claude at this stage?",
		options: [
			"Ask Claude for the final, approved project plan and circulate it unedited",
			"Avoid using Claude, since planning requires human intuition only",
			"Avoid involving Claude until after the plan has been finished by the team, and then use it only to turn the completed plan into a polished set of presentation slides",
			"Ask Claude to draft a first-pass plan — workstreams, sequencing, risks, stakeholders — then refine it with knowledge of the actual organization and budget",
		],
		correctAnswers: [3],
		explanation:
			"Research and planning support means using Claude to beat the blank page: a structured first draft that human context then corrects and completes. The draft accelerates; the manager's knowledge decides.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A publishes a plan that has never met the organization's reality; B forfeits hours of acceleration out of principle; C reserves Claude for decoration after the hard work is done.",
	},
	{
		id: "CPQ-ccaof-4.3",
		domain: "D4",
		question:
			"An operations team suspects their invoice-approval process is inefficient but cannot articulate where. How can Claude support process optimization here?",
		options: [
			"Describe the process step by step and ask Claude to identify likely bottlenecks, redundant approvals, and questions to investigate, then verify against real data",
			"Ask Claude to approve the invoices itself from now on",
			"Have Claude generate a motivational memo about efficiency",
			"Retire the current process immediately and replace it wholesale with whatever alternative process Claude describes as industry best practice for invoice approval workflows",
		],
		correctAnswers: [0],
		explanation:
			"Claude is a strong analytical partner for process work: it can interrogate a described process, spot structural smells, and generate hypotheses. The discipline is treating those as hypotheses to verify with data, not conclusions.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B jumps from analysis to unsupervised execution of a financial control; C is theater; D swaps a diagnosed-nothing for a generic template without evidence.",
	},
	{
		id: "CPQ-ccaof-4.4",
		domain: "D4",
		question:
			"A content team's workflow is: research → outline → first draft → expert review → publish. The first-draft stage is the chronic bottleneck; expert review works well. How should Claude be integrated?",
		options: [
			"Replace the entire workflow — research, outlining, drafting, and the expert review stage included — with a single consolidated Claude step that does it all",
			"Insert Claude at the publishing stage, since that is the final step",
			"Augment the bottleneck: use Claude to produce structured first drafts from the outlines, keeping research direction and expert review where they are",
			"Use Claude to time each stage more precisely",
		],
		correctAnswers: [2],
		explanation:
			"Good integration is surgical: aim Claude at the stage that is actually constraining throughput and leave the stages that work — especially the human quality gate — intact. The workflow gets faster without getting riskier.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A removes the safeguard that makes the output trustworthy; B optimizes a stage that wasn't the problem; D measures the bottleneck instead of relieving it.",
	},
	{
		id: "CPQ-ccaof-4.5",
		domain: "D4",
		question:
			"A team lead wants to integrate Claude into the department’s weekly client-reporting workflow. Five activities are planned: (1) Scale the approach across the whole team as the standard process; (2) Map the current workflow and baseline how long each stage takes today; (3) Pilot Claude on the chosen stage for several reporting cycles; (4) Select the stage where Claude can add the most value at the lowest risk; (5) Evaluate the pilot’s results against the baseline measures. In which order should the activities be carried out?",
		options: ["4 → 3 → 2 → 5 → 1", "3 → 2 → 4 → 5 → 1", "2 → 4 → 3 → 1 → 5", "2 → 4 → 3 → 5 → 1"],
		correctAnswers: [3],
		explanation:
			"Understand before changing, prove before scaling: map and baseline the workflow (2), choose the target stage on evidence (4), pilot it (3), evaluate against the baseline (5), and only then make it the standard (1).",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A selects the stage before understanding the workflow, and the late baseline can’t measure what the pilot changed; B pilots before deciding where Claude belongs; C scales to the whole team before the evaluation says whether the pilot worked.",
	},
	{
		id: "CPQ-ccaof-4.6",
		domain: "D4",
		question:
			"A knowledge worker’s typical week includes: triaging a shared inbox into action categories, negotiating contract terms in supplier meetings, condensing project updates into a weekly status report, approving invoices for payment, and mentoring a junior colleague. Which TWO parts of this week are the strongest candidates for integrating Claude as day-to-day support? (Select TWO.)",
		options: [
			"Inbox triage: Claude drafts the categorisation and suggested actions, which the worker reviews and confirms",
			"Supplier negotiations: Claude attends the meetings and negotiates the contract terms",
			"The status report: Claude drafts it from the collected project updates, for the worker’s review and edit",
			"Invoice approval: Claude reviews and approves the payments autonomously each week, removing the approval bottleneck entirely",
			"Mentoring: Claude replaces the one-on-one sessions with generated career advice",
		],
		correctAnswers: [0, 2],
		explanation:
			"Frequent, language-heavy work with a human checking the result is exactly where Claude integrates well: triage drafts and report drafts are high-volume text tasks, easy to verify, with the worker keeping final judgment.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and E are relationship work — negotiation and mentoring depend on human presence, trust, and accountability that the tool cannot carry; D hands an autonomous financial control decision to the tool, wrong on both risk and oversight grounds.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-4.7",
		domain: "D4",
		question:
			"After a successful pilot using Claude for proposal drafting, an associate must present the results to skeptical leadership. Which presentation approach is right?",
		options: [
			"Report concrete outcomes — drafting time cut from six hours to two, quality maintained per reviewer scores — alongside honest limitations",
			"Claim the tool is flawless to secure the budget quickly",
			"Present only the limitations to appear rigorous and cautious",
			"Keep the presentation deliberately free of specific numbers and measurements, so that leadership has nothing concrete to challenge or pick apart",
		],
		correctAnswers: [0],
		explanation:
			"Communicating value means evidence plus honesty: measured benefits and clearly stated limitations. That combination earns durable trust — and protects the initiative when the limitations inevitably show up.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B sets expectations reality will break; C buries a genuine result under performative caution; D trades credibility for unfalsifiability.",
	},
	{
		id: "CPQ-ccaof-4.8",
		domain: "D4",
		question:
			"An associate's team loves their Claude-assisted triage workflow and now wants it to run automatically: connected to the CRM via API, triggered on every new ticket, with no one initiating chats. What should the associate do?",
		options: [
			"Build the CRM API integration personally over the weekend, using code generated by Claude, so the team doesn’t have to wait for anyone",
			"Tell the team automation of this kind is impossible",
			"Recognize this has crossed into technical implementation — API integration and automated triggering — and escalate to a developer or Architect resource",
			"Simulate the automation by hand: personally copy every new ticket from the CRM into Claude throughout the day and paste the triage results back into the CRM",
		],
		correctAnswers: [2],
		explanation:
			"Knowing the boundary is an Associate competency: platform features, workflows, and Projects are in scope; API integrations and autonomous triggering are engineering work that goes to the technical track, with the associate contributing the validated workflow design.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A takes production engineering outside the role's scope and safety net; B is false — it's feasible, just not the associate's build; D converts one person into a manual API.",
	},
	{
		id: "CPQ-ccaof-4.9",
		domain: "D4",
		question:
			"An associate is designing the pilot for their department's first Claude workflow. Which TWO practices give the pilot the best chance of producing a trustworthy result? (Select TWO.)",
		options: [
			"Roll it out across the entire organization at once, so the pilot sample is as large as it can possibly be",
			"Choose a frequent, low-risk task where outputs are easy to check against reality",
			"Pick the department's highest-stakes process so the pilot proves maximum value",
			"Define success measures — time saved, quality maintained, adoption — before the pilot starts",
			"Avoid measuring the current process, to keep the comparison unbiased",
		],
		correctAnswers: [1, 3],
		explanation:
			"Sound pilots pair a sensible proving ground — frequent enough to generate evidence, low-risk enough to contain mistakes — with success criteria fixed in advance, so the result is a measurement rather than an impression.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and C maximize blast radius before anything is proven; E removes the baseline that gives the pilot's numbers any meaning.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-4.10",
		domain: "D4",
		question:
			"A research associate is preparing a competitive-landscape briefing. Which TWO uses of Claude add genuine value to this workflow? (Select TWO.)",
		options: [
			"Synthesizing a stack of collected articles and reports into organized themes and points of disagreement between sources",
			"Serving as the final authority on which competitor claims are true",
			"Producing a structured comparison of competitors across chosen dimensions as a reviewable starting draft",
			"Eliminating the need for anyone to check any of the briefing’s claims before it is circulated to the wider leadership group",
			"Deciding the company's competitive strategy autonomously from the briefing",
		],
		correctAnswers: [0, 2],
		explanation:
			"Claude's contribution to research workflows is structure and synthesis at speed: turning source material into organized themes and reviewable comparative drafts that a human then verifies and builds judgment on.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B, D, and E all move Claude from accelerating the work to owning the truth and the decision — the parts that stay human.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-5.1",
		domain: "D5",
		question:
			"An associate begins every conversation in their reporting Project by pasting the same three paragraphs: the team's tone rules, the report structure, and formatting requirements. What is the correct configuration fix?",
		options: [
			"Keep pasting the paragraphs at the start of every conversation — the repetition helps the model learn the rules permanently over time",
			"Shorten the three paragraphs so pasting is faster",
			"Attach the three paragraphs as a knowledge file in the Project and hope Claude notices and applies it in every conversation",
			"Move the standing rules into the Project’s custom instructions, where they apply to every conversation automatically",
		],
		correctAnswers: [3],
		explanation:
			"Standing behavioral rules — tone, structure, format — are what project instructions are for: configured once, applied to every chat, impossible to forget to paste.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A misunderstands the mechanics — nothing is learned between chats, and manual repetition invites omission; B optimizes the workaround instead of removing it; C puts behavioral rules where reference content belongs, weakening their force.",
	},
	{
		id: "CPQ-ccaof-5.2",
		domain: "D5",
		question:
			"Setting up a Project for contract-renewal support, an associate wonders what to upload as knowledge. The team drive holds ~2,000 files; about 15 are actually relevant: current templates, the pricing sheet, and negotiation guidelines. What should be uploaded?",
		options: [
			"The entire team drive of roughly 2,000 files, so that no piece of information could ever be missing when it turns out to be needed",
			"The 15 relevant, current documents — a curated knowledge base of what the work draws on, maintained as things change",
			"Nothing — knowledge uploads are unnecessary if prompts are good",
			"Only the oldest documents on the drive, since they carry the most accumulated history of how the work has been done",
		],
		correctAnswers: [1],
		explanation:
			"Knowledge curation beats knowledge volume: a focused set of current, relevant sources makes retrieval precise and answers grounded. The upload defines what the Project treats as true — curate it like it matters.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A buries 15 signal documents under 1,985 of noise and stale versions; C forces every chat to re-supply what the Project should already hold; D optimizes for exactly the wrong property.",
	},
	{
		id: "CPQ-ccaof-5.3",
		domain: "D5",
		question:
			"A team's status-report documents live in Google Drive and are updated by several colleagues throughout the week. The associate wants Claude to work from the latest versions without manual re-uploading. What is the right approach, and what should be checked first?",
		options: [
			"Use the Google Drive connector so Claude accesses the current files directly — after confirming the connection complies with data and access policies",
			"Re-upload every file into the Project each morning before starting work, treating the routine as a useful discipline-building ritual for the whole team",
			"Ask colleagues to stop updating the documents so versions stay stable",
			"Have Claude guess what probably changed since the last upload",
		],
		correctAnswers: [0],
		explanation:
			"Connectors exist for exactly this: live access to working files instead of stale snapshots. The professional step is the governance check — confirming what the connector can reach and that this access is policy-compliant.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B is the manual overhead the feature eliminates; C bends the team's process around a tooling gap that has a solution; D invites invention where the real data is one connector away.",
	},
	{
		id: "CPQ-ccaof-5.4",
		domain: "D5",
		question:
			"Which of the following is the most effective set of system-level instructions for a customer-communications Project?",
		options: [
			"“Be consistently helpful and professional, always do a good job, use sound judgment at all times, communicate clearly, and make every customer as happy as possible.”",
			"“Never make mistakes.”",
			"“You draft customer-service replies for a software company. Tone: warm, plain English, no jargon. Always: acknowledge the issue, state next steps. Never: promise refunds (escalate instead) or exceed 200 words.”",
			"The company’s complete 30-page policy and procedures manual, pasted in as the instructions in full — every policy, exception, and historical amendment since 2015 — so that no conceivable situation is left uncovered",
		],
		correctAnswers: [2],
		explanation:
			"Effective instructions are specific, structured, and behavioral: who Claude is acting as, the tone, what must always happen, what must never happen, and hard constraints. Every line is actionable in every reply.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and B are aspirations, not instructions — they change nothing about behavior; D drowns the operative rules in archive material that belongs (curated) in knowledge, if anywhere.",
	},
	{
		id: "CPQ-ccaof-5.5",
		domain: "D5",
		question:
			"An associate is configuring a Project and has two assets: (1) rules about how Claude should behave — tone, structure, escalation triggers; and (2) reference material Claude should draw on — the product catalog and policy documents. Where does each belong?",
		options: [
			"Both pasted into the first message of every chat",
			"Behavioral rules in the Project’s custom instructions; reference material as Project knowledge",
			"Both uploaded as knowledge files, keeping instructions empty",
			"Behavioral rules uploaded as knowledge documents, with the product catalog written into the custom instructions field instead",
		],
		correctAnswers: [1],
		explanation:
			"The two configuration surfaces have distinct jobs: instructions govern behavior on every turn; knowledge is the reference library consulted when relevant. Putting each asset in its own home makes both work as designed.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A abandons configuration for manual repetition; C demotes standing rules to documents Claude may or may not consult; D inverts the two surfaces entirely.",
	},
	{
		id: "CPQ-ccaof-5.6",
		domain: "D5",
		question:
			"Sales reps report that the quoting Project keeps citing superseded prices. Investigation shows the Project knowledge contains “pricing_2024.xlsx”, while current prices took effect in January. What does proper knowledge maintenance look like?",
		options: [
			"Add a chat instruction each time: “ignore the old prices you may have seen”",
			"Upload the new pricing file into the Project knowledge alongside the old one, so that both versions remain available for reference",
			"Tell the reps to mentally adjust the quoted figures",
			"Remove the outdated file, upload the current pricing document, and put knowledge sources on a review cycle",
		],
		correctAnswers: [3],
		explanation:
			"Maintaining configurations means the knowledge base tracks reality: stale sources are removed — not merely supplemented — and a review cadence keeps time-sensitive material like pricing from silently rotting.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A treats a configuration defect as a per-chat incantation; B leaves two contradictory sources competing for retrieval; C institutionalizes wrong numbers in customer quotes.",
	},
	{
		id: "CPQ-ccaof-5.7",
		domain: "D5",
		question:
			"An associate is setting up a Claude Project to support the team’s proposal-writing process. Five setup activities are involved: (1) Test the Project with a realistic sample task and review the output; (2) Write the Project’s custom instructions: tone, structure, and escalation rules; (3) Upload the curated reference documents as Project knowledge; (4) Create the Project; (5) Refine the instructions and knowledge based on what the test revealed. In which order should the activities be carried out?",
		options: ["4 → 1 → 2 → 3 → 5", "2 → 3 → 4 → 5 → 1", "4 → 2 → 3 → 1 → 5", "4 → 2 → 3 → 5 → 1"],
		correctAnswers: [2],
		explanation:
			"The Project must exist before it can be configured (4), configuration — instructions and knowledge (2, 3) — comes before evaluation, and refinement (5) only makes sense once a test (1) has produced something to learn from. Configure, test, refine is the same loop good prompting follows.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A tests an unconfigured Project, so the test reveals nothing about the setup; B configures a Project that doesn’t exist yet and refines before testing; D refines before running the test that would show what needs refining.",
	},
	{
		id: "CPQ-ccaof-6.1",
		domain: "D6",
		question:
			"Which of the following tasks is the associate right to treat as an appropriate, low-risk use of Claude without additional approvals?",
		options: [
			"Producing the company’s official written response to a regulator’s formal inquiry, and sending it out without any human review",
			"Analyzing an unredacted export of customer identity records from the CRM",
			"Turning the associate’s own rough notes from an internal team meeting into organized minutes, reviewed before sharing",
			"Generating a diagnosis for an employee's described medical symptoms",
		],
		correctAnswers: [2],
		explanation:
			"Appropriate-use judgment weighs data sensitivity, stakes, and oversight. Internal, non-sensitive content authored by the user, with human review before sharing, sits squarely in the green zone.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A is high-stakes external communication with the review step deleted; B processes regulated personal data without safeguards; D is a professional medical judgment no chat tool should be making.",
	},
	{
		id: "CPQ-ccaof-6.2",
		domain: "D6",
		question:
			"An HR associate wants Claude's help analyzing turnover patterns using a spreadsheet that includes employee names, salaries, and health-leave records. Organizational policy restricts sharing sensitive personal data. What is the correct approach?",
		options: [
			"Upload it as-is; internal analysis doesn't count as sharing",
			"De-identify first — remove or pseudonymize identifiers, keep only fields the analysis needs — and confirm compliance with the data policy",
			"Upload the file as it is, but instruct Claude at the start of the conversation to treat the contents as strictly confidential and promise not to share them",
			"Analyze only the names column, since names alone reveal nothing",
		],
		correctAnswers: [1],
		explanation:
			"Data-sensitivity practice is minimization: strip identity, keep only the analytical fields, and check the approach against policy. The insight survives; the exposure doesn't.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A misreads policy — providing data to a tool is a disclosure event; C substitutes a chat message for a control; D is backwards, retaining the identifiers and discarding the analysis.",
	},
	{
		id: "CPQ-ccaof-6.3",
		domain: "D6",
		question:
			"A consultant working with a healthcare client is asked to run patient-feedback records through Claude to find service-improvement themes. Health data is subject to specific regulation. What must happen before any records are processed?",
		options: [
			"Proceed — feedback records don't feel like medical records",
			"Proceed, but delete the conversation afterwards",
			"Run a small sample of the records through first, and wait to see whether the client or anyone else raises an objection before processing the full set",
			"Confirm the regulatory and contractual position first — engage the client’s privacy or compliance function and process the data only as they approve",
		],
		correctAnswers: [3],
		explanation:
			"Regulated data categories reverse the default: authorization comes before processing. The compliance function determines what the regulation and client agreements permit — the consultant's job is to ask before, not apologize after.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A substitutes vibes for regulatory analysis — patient feedback can absolutely contain health information; B deletes evidence of a violation rather than preventing one; C makes the violation smaller, not lawful.",
	},
	{
		id: "CPQ-ccaof-6.4",
		domain: "D6",
		question:
			"An associate discovers a teammate has been pasting confidential company documents into a personal, free AI chatbot account because “it's the same model anyway.” What is the governance-correct response?",
		options: [
			"Explain the problem, direct the teammate to the sanctioned workspace, and follow the organization’s process for reporting the data exposure",
			"Ignore it — the underlying model quality is indeed similar, so the work product is the same wherever the documents happen to be pasted in the end",
			"Join in, because the free account saves budget",
			"Quietly delete the teammate's chat history and say nothing",
		],
		correctAnswers: [0],
		explanation:
			"Following organizational AI policy means using sanctioned channels — the enterprise workspace exists precisely for its contractual data protections and admin controls — and treating confidential data in unsanctioned tools as an incident to report, not a secret to keep.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B and C confuse model capability with governance — the account terms, not the model, are the issue; D destroys the record while leaving both the exposure and the behavior in place.",
	},
	{
		id: "CPQ-ccaof-6.5",
		domain: "D6",
		question:
			"A marketing lead asks an associate to have Claude write a dozen enthusiastic customer testimonials, each attributed to a fictional customer name, for the company website. How should the associate respond?",
		options: [
			"Write them — every company polishes its testimonials",
			"Decline and explain that fabricated testimonials presented as real customers are deceptive — then offer legitimate alternatives",
			"Write them, but attribute each testimonial to a first name only, so that no complete fictional identity is created and the risk is reduced",
			"Write them and add a tiny footnote reading “illustrative”",
		],
		correctAnswers: [1],
		explanation:
			"Ethical use draws the line at deception: content that manufactures false social proof misleads the public regardless of who typed it. The professional response pairs the refusal with legitimate paths to the same business goal.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A normalizes fabrication as polish; C and D are cosmetic mitigations of the same deception — the reader is still being told real customers said things no one said.",
	},
	{
		id: "CPQ-ccaof-6.6",
		domain: "D6",
		question:
			"An associate uses Claude to draft a vendor-evaluation report, edits it, and submits it to their director. The report contains an error that later causes a problem. Who is accountable for the error?",
		options: [
			"Claude, since it generated the sentence containing the error",
			"Anthropic, as the maker of the tool",
			"The associate who authored and submitted the report — AI assistance does not transfer accountability for one’s work product",
			"No one — errors that originate from AI-assisted work are an accepted cost of the technology and are nobody’s individual fault in particular",
		],
		correctAnswers: [2],
		explanation:
			"Accountability follows authorship and submission, not typing. The person who signs off on AI-assisted work owns it — which is precisely the reason validation and review are non-negotiable steps, not courtesies.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and B mistake a tool for a responsible party — no organization accepts ‘the software wrote it’ as accountability; D describes a world in which no work product could be trusted at all.",
	},
	{
		id: "CPQ-ccaof-6.7",
		domain: "D6",
		question:
			"A colleague going through a divorce asks an associate to have Claude determine “what custody arrangement I'm legally entitled to” so they can act on it directly. What should the associate recognize?",
		options: [
			"This asks the tool to substitute for professional legal advice on a high-stakes personal matter — the determination belongs with a qualified lawyer",
			"Claude's answer will be binding, so it should be worded carefully",
			"It's fine as long as the jurisdiction is specified precisely",
			"The request is acceptable, because family law matters are considerably simpler and more standardized than corporate law and well within the tool’s reach",
		],
		correctAnswers: [0],
		explanation:
			"Recognizing inappropriate use cases includes the substitution test: when the ask is a professional determination someone will act on — legal, medical, financial — the tool's role shrinks to preparation and understanding, and the determination goes to a qualified professional.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B attributes legal force a chat response cannot have; C fixes an input detail while the category problem remains; D is both false and irrelevant to whether professional advice is needed.",
	},
	{
		id: "CPQ-ccaof-6.8",
		domain: "D6",
		question:
			"Before uploading a dataset to Claude for analysis, which TWO checks should an associate perform? (Select TWO.)",
		options: [
			"Whether the file's formatting is attractive",
			"Whether the dataset contains personal, confidential, or regulated information requiring removal, de-identification, or special handling",
			"Whether the file was created recently enough for the analysis to be interesting and worth the effort of uploading and running in the first place",
			"Whether the organization's AI and data policies permit this category of data to be used with this tool, in this workspace",
			"Whether the dataset is large enough to look impressive",
		],
		correctAnswers: [1, 3],
		explanation:
			"The pre-upload discipline has two gates: inspect the data itself for sensitive content, and confirm the intended use is inside policy for that data category and platform. Passing both is what makes the analysis safe to start.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A, C, and E are aesthetic and incidental properties with no bearing on whether the upload is appropriate.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-6.9",
		domain: "D6",
		question: "Which TWO practices belong in a team's responsible-AI working norms? (Select TWO.)",
		options: [
			"Disclose AI assistance where organizational policy or the context requires it, rather than presenting AI-drafted work as unaided",
			"Allow Claude outputs to be sent onward to external parties automatically, without a review step, so that speed of delivery is maximized for the team",
			"Keep humans accountable for decisions that affect people — hiring, performance, customer commitments — with AI limited to support",
			"Treat an output as verified once the model has reviewed its own work",
			"Discourage colleagues from questioning or second-guessing AI-produced analysis once it has been circulated, so that team efficiency is maintained",
		],
		correctAnswers: [0, 2],
		explanation:
			"Responsible-use norms rest on transparency and human accountability: honesty about AI's role where it matters, and people — not models — owning decisions with human consequences.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B removes the review step exactly where stakes are highest; D is circular validation; E inverts healthy culture — scrutiny of AI output is the safeguard, not the obstacle.",
		selectCount: 2,
	},
	{
		id: "CPQ-ccaof-7.1",
		domain: "D7",
		question:
			"Claude's answers to an associate's competitive-analysis questions keep coming back generic and surface-level. What should the associate examine first?",
		options: [
			"Whether Claude is having a bad day, by waiting and retrying tomorrow",
			"The prompt itself: does it supply the company’s context, the competitors, the decision it feeds, and the criteria that matter?",
			"The subscription tier, since analytical depth of this kind is presumably a feature reserved for the more expensive paid subscription plans",
			"The time of day the questions are sent",
		],
		correctAnswers: [1],
		explanation:
			"Diagnosis starts at the input: generic output is the signature of a context-starved prompt. The model answers the question it was actually asked — specificity in produces specificity out.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A, C, and D look for external causes — mood, billing, clock — for a problem whose cause is almost always visible in the prompt text itself.",
	},
	{
		id: "CPQ-ccaof-7.2",
		domain: "D7",
		question:
			"An associate's mega-prompt contains fourteen requirements for a report. The output consistently satisfies most of them but drops two or three — different ones each time. What is the likely cause and fix?",
		options: [
			"The model is being deliberately selective; add a line demanding total obedience",
			"The requirements are fundamentally impossible to satisfy together in any single document; permanently delete half of them so that the remaining half can actually be met",
			"Fourteen is fine — the real problem is not saying ‘please’",
			"Instruction overload: too many requirements competing in one request — group and prioritize them, or decompose into sequential steps",
		],
		correctAnswers: [3],
		explanation:
			"Dropped instructions in different places on each run is the classic overload signature. The remedy is structural: fewer simultaneous demands per pass, whether by prioritized grouping or step-by-step decomposition with a final checklist pass.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A misdiagnoses a capacity pattern as defiance; B discards requirements that may all be achievable across passes; C is superstition.",
	},
	{
		id: "CPQ-ccaof-7.3",
		domain: "D7",
		question:
			"In a team's client-reporting Project, every conversation starts with Claude using the wrong tone, and every user manually corrects it mid-chat. What is the right fix?",
		options: [
			"Fix it at the source: update the Project’s custom instructions to specify the required tone, so every conversation starts correct",
			"Keep correcting each conversation manually as the team already does — it only takes a message or two at the start of every chat to put right",
			"Ask the team to accept the default tone to save effort",
			"Start every chat by insulting the previous answer to motivate improvement",
		],
		correctAnswers: [0],
		explanation:
			"A defect that recurs in every conversation is a configuration defect, not a conversation defect. One instruction update repairs all future chats; per-chat correction repairs one chat at a time, forever.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"B institutionalizes rework the configuration exists to remove; C accepts a quality miss with a one-line fix available; D is noise — tone is set by instructions, not intimidation.",
	},
	{
		id: "CPQ-ccaof-7.4",
		domain: "D7",
		question:
			"Deep into a marathon conversation that has covered several topics, Claude begins conflating earlier drafts, responding slowly, and missing recent corrections. What is happening, and what is the practical response?",
		options: [
			"The model is permanently degraded and the account should be reset",
			"Nothing is wrong — conversations behave identically at any length, so the drafts and corrections are all being tracked exactly as they were at the start",
			"Accumulated context has grown long and muddled. Have Claude summarize the current state, verify it, and continue in a fresh conversation seeded with it",
			"Type the corrections in capital letters so they outweigh the older content",
		],
		correctAnswers: [2],
		explanation:
			"Long, multi-topic conversations accumulate context that eventually works against them. The restart-with-summary pattern keeps what matters — verified decisions and current state — and sheds the clutter degrading responses.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A misattributes a conversation-level condition to the account; B denies the symptom being described; D adds emphasis into the same overloaded context.",
	},
	{
		id: "CPQ-ccaof-7.5",
		domain: "D7",
		question:
			"Every week an associate spends fifteen minutes re-explaining the same report requirements to Claude before starting the actual weekly report. What is the right optimization?",
		options: [
			"Accept the fifteen minutes as the cost of quality",
			"Make the setup reusable: capture the standing requirements once in a Project’s instructions, so each week starts at the work",
			"Stop explaining the requirements and accept lower-quality reports",
			"Rotate the weekly task among the whole team, so that no single person has to bear the same fifteen minutes of re-explaining every single week",
		],
		correctAnswers: [1],
		explanation:
			"Optimization targets repeated overhead: anything explained identically every cycle belongs in reusable configuration. The one-time setup converts fifteen minutes a week into zero.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A pays a recurring cost with a known one-time fix; C trades quality for time when neither needs sacrificing; D redistributes the waste instead of eliminating it.",
	},
	{
		id: "CPQ-ccaof-7.6",
		domain: "D7",
		question:
			"An associate is systematically improving an underperforming prompt. Which TWO practices make the improvement process reliable? (Select TWO.)",
		options: [
			"Rewrite the entire prompt completely from scratch on every attempt, so no weak wording survives",
			"Change several elements at once to converge faster",
			"Change one element at a time, so each change's effect can be attributed",
			"Switch to a different AI product at the first sign of trouble",
			"Test each revision against the same example input, so results are compared like-for-like",
		],
		correctAnswers: [2, 4],
		explanation:
			"Reliable iteration is a fair experiment: vary one thing, hold the test input constant, observe the difference. That is how an associate learns which change helped rather than guessing.",
		source: {
			label: "Cert Pro Quest — practice bank by Matthew Purcell (not official exam content)",
			url: "https://cert-pro-quest.lovable.app/",
		},
		whyNot:
			"A and B destroy attribution — when everything changes, nothing is learned; D abandons diagnosis for tool-hopping.",
		selectCount: 2,
	},
	{
		id: "claude-generated-002",
		domain: "D1",
		question:
			"An analyst needs to identify liquidity risks discussed in a long annual report. Which prompt structure best supports a grounded answer?",
		options: [
			"Ask for a full summary first, then search the summary for liquidity risks.",
			"Ask the question before providing the report so Claude knows what to find.",
			"Provide the report first, then ask the focused question and request the relevant passages as evidence.",
			"Split the report into chapters and ask the same question in separate chats.",
		],
		correctAnswers: [2],
		explanation:
			"For a long source, place the source before the focused question and ask for supporting passages. The reviewer can then check the answer against the document rather than relying on a broad summary.",
		source: testAppSource,
		whyNot:
			"A summary can omit the exact risk; B puts the question before a lengthy source; D fragments evidence that may span sections.",
	},
	{
		id: "claude-generated-005",
		domain: "D1",
		question:
			"A support team wants Claude's drafts to match approved customer replies, but descriptions such as “warm and professional” produce uneven results. What should the team try?",
		options: [
			"Add more tone adjectives and a longer list of words to avoid.",
			"Ask Claude to infer the support voice from the company's public marketing pages.",
			"Provide a few approved replies, clearly labelled as examples of the target voice.",
			"Stop using Claude for drafts because writing style cannot be shown through examples.",
		],
		correctAnswers: [2],
		explanation:
			"A small set of labelled examples demonstrates tone, structure, and vocabulary more directly than broad adjectives. The examples should be approved for this use.",
		source: testAppSource,
		whyNot:
			"A expands the kind of description that already failed; B may reflect marketing rather than support; D ignores a practical way to show the required style.",
	},
	{
		id: "claude-generated-009",
		domain: "D1",
		question:
			"A prompt contains instructions, a customer's email, and a returns policy. Claude sometimes treats the customer's statements as company policy. Which change best separates the content?",
		options: [
			"Reorder the three blocks but leave their boundaries unlabeled.",
			"Wrap each block in a clear labelled delimiter and refer to those labels in the instructions.",
			"Replace the full policy with a short summary written from memory.",
			"Add a reminder that customer messages are not policy without marking where each begins and ends.",
		],
		correctAnswers: [1],
		explanation:
			"Clear labels or tags distinguish trusted policy from customer-provided content and let the prompt refer to each source explicitly.",
		source: testAppSource,
		whyNot:
			"A leaves boundaries implicit; C may omit policy conditions; D states the distinction but still makes the content harder to identify reliably.",
	},
	{
		id: "claude-generated-010",
		domain: "D1",
		question:
			"A project lead knows the desired outcome but is unsure what details Claude needs before drafting a plan. What is the best first request?",
		options: [
			"Ask for a complete plan immediately and correct the missing details later.",
			"Upload every departmental file so Claude can decide what might matter.",
			"State the goal and ask Claude to identify the clarifying questions it needs answered before drafting.",
			"Ask for a generic template and leave all planning decisions to the project lead.",
		],
		correctAnswers: [2],
		explanation:
			"A short discovery step helps surface missing constraints and context before Claude produces a detailed plan. It reduces guesswork and avoids adding irrelevant material.",
		source: testAppSource,
		whyNot:
			"A starts with avoidable assumptions; B can add noise and unnecessary data; D provides a shell but does not help identify the information needed for this project.",
	},
	{
		id: "claude-generated-011",
		domain: "D1",
		question:
			"A sales director needs to find which region had the highest growth in an 18-month CSV. Which approach is most reliable?",
		options: [
			"Upload the complete file, ask the specific growth question, and request the calculation method for checking.",
			"Enter the totals she remembers and ask Claude to estimate each region's growth.",
			"Provide the first few rows and ask Claude to extrapolate the trend across all 18 months.",
			"Ask which region usually grows fastest in the industry and use that as the likely result.",
		],
		correctAnswers: [0],
		explanation:
			"The complete dataset and a specific question let Claude analyze the relevant period. A visible method or calculation makes the result easier to validate against the file.",
		source: testAppSource,
		whyNot:
			"B relies on memory; C cannot represent the entire period; D substitutes a general pattern for the director's actual data.",
	},
	{
		id: "claude-generated-013",
		domain: "D1",
		question:
			"A team is comparing three suppliers on cost, delivery time, support, and risk. Which TWO prompting techniques best support a defensible recommendation?",
		options: [
			"Request a one-line answer so the recommendation is decisive.",
			"State the decision criteria and the weight of each criterion.",
			"Run the same prompt in several chats and choose the supplier named most often.",
			"Ask for a criterion-by-criterion comparison with evidence and any uncertainty before the recommendation.",
			"Ask Claude to role-play as the procurement director and make the decision.",
		],
		correctAnswers: [1, 3],
		explanation:
			"Explicit criteria and weights define how suppliers should be compared. Evidence and stated uncertainty make gaps visible and let the team review the recommendation.",
		source: testAppSource,
		whyNot:
			"A hides the basis for the decision; C treats repeated model outputs as votes; E adds a role but does not establish evidence or decision criteria.",
		selectCount: 2,
	},
	{
		id: "claude-generated-014",
		domain: "D2",
		question:
			"A team needs to compare vendors and import the results into a spreadsheet or downstream system. Which request best reduces manual reformatting and import errors?",
		options: [
			"Ask for a complete comparison table and let Claude choose the fields.",
			"Request a CSV or table with a fixed schema, such as vendor, monthly price and currency, users included, and SSO status.",
			"Request a narrative comparison and have an analyst extract the fields afterward.",
			"Ask for a separate bulleted summary for each vendor.",
		],
		correctAnswers: [1],
		explanation:
			"When another tool will consume the result, define the fields and formats up front. Structured rows preserve individual records and reduce hand-editing before import.",
		source: testAppSource,
		whyNot:
			"A may produce inconsistent columns; C and D require manual conversion and can lose or misplace values.",
	},
	{
		id: "claude-generated-024",
		domain: "D2",
		question:
			"Claude changes a revenue figure after a user says it looks wrong. What should the reviewer conclude?",
		options: [
			"The revised figure is more reliable because Claude reconsidered it.",
			"The original figure is more reliable because the change shows Claude was agreeing with the user.",
			"Neither figure is verified; compare the claim with the source data.",
			"Accept whichever figure has the more convincing explanation.",
		],
		correctAnswers: [2],
		explanation:
			"A response changing after pushback does not establish which value is correct. The underlying data, not the model's agreement or explanation, is the evidence to check.",
		source: testAppSource,
		whyNot:
			"A and B infer accuracy from the model's behavior; D relies on persuasive wording rather than independent evidence.",
	},
	{
		id: "claude-generated-025",
		domain: "D2",
		question:
			"A report says revenue rose 8% after one-off items were excluded, while reported revenue fell 3%. Claude summarizes this as “revenue rose 8%.” What is the main problem?",
		options: [
			"The summary omits a qualifier that changes the meaning; check the claim against the source wording.",
			"The figure was fabricated; generate another summary to see whether it changes.",
			"The arithmetic is wrong; recalculate the reported revenue growth.",
			"There is no issue because the 8% figure appears in the report.",
		],
		correctAnswers: [0],
		explanation:
			"A number can be quoted accurately and still mislead if the condition that gives it meaning is removed. Review key figures with their qualifiers against the source.",
		source: testAppSource,
		whyNot:
			"B mistakes omission for fabrication; C does not address the missing condition; D overlooks that the unqualified statement reverses the report's overall result.",
	},
	{
		id: "claude-generated-026",
		domain: "D2",
		question:
			"A Claude-assisted leadership report contains about 80 factual claims and is due in an hour. Which verification plan best manages the remaining time?",
		options: [
			"Check the first fifteen claims, then assume the rest are similarly reliable.",
			"List every claim with its source and review the report only in document order.",
			"Verify only claims Claude marks as low-confidence.",
			"Prioritize high-impact claims for full verification, then sample lower-risk claims using their sources.",
		],
		correctAnswers: [3],
		explanation:
			"Risk-based verification uses limited time where an error would matter most. A claim-and-source list can speed the review, while lower-impact material can receive proportionate spot checks.",
		source: testAppSource,
		whyNot:
			"A's first claims may not be representative; B can miss urgent risks later in the report; C relies on confidence that is not a substitute for checking evidence.",
	},
	{
		id: "claude-generated-027",
		domain: "D2",
		question:
			"An employee needs answers only from an uploaded supplier contract. Which instruction best limits unsupported claims and makes answers checkable?",
		options: [
			"Use the contract together with Claude's general knowledge of similar agreements.",
			"Support each answer with a relevant contract excerpt and say when the contract does not address the question.",
			"Answer only when confidence is at least 90%, otherwise estimate the most likely term.",
			"Keep answers short and avoid speculation, without requiring evidence from the contract.",
		],
		correctAnswers: [1],
		explanation:
			"Grounding each response in the supplied contract makes it easier to verify, and an explicit “not found” response avoids filling gaps with assumptions.",
		source: testAppSource,
		whyNot:
			"A permits unsupported outside information; C uses uncalibrated confidence and still invites guessing; D lacks a way to confirm that an answer is grounded in the contract.",
	},
	{
		id: "claude-generated-029",
		domain: "D2",
		question:
			"Claude drafts a spreadsheet formula for a three-tier sales commission. What is the strongest validation before it is used for payroll?",
		options: [
			"Ask an experienced colleague whether the formula looks reasonable.",
			"Ask Claude to explain its formula and compare the explanation with the policy.",
			"Test the formula with cases that have known results, including values at each tier boundary.",
			"Run it on last month's data and check whether the total payout is close to the prior total.",
		],
		correctAnswers: [2],
		explanation:
			"Known expected results test the formula directly. Boundary cases are especially useful for finding mistakes in tier conditions.",
		source: testAppSource,
		whyNot:
			"A and B are reviews rather than execution tests; D can hide individual errors that offset each other in the total.",
	},
	{
		id: "claude-generated-030",
		domain: "D2",
		question:
			"A Claude translation of a product safety notice is ready for publication in German. What check is essential before release?",
		options: [
			"Translate it back to English with Claude and compare the two English versions.",
			"Compare the result with a translation from a second AI system.",
			"Ask Claude to proofread its own translation and accept its corrections.",
			"Have a qualified German-speaking reviewer check accuracy and safety terminology.",
		],
		correctAnswers: [3],
		explanation:
			"Safety information has high consequences, and a qualified reviewer can assess meaning and nuance in the target language before publication.",
		source: testAppSource,
		whyNot:
			"A and B can repeat or conceal translation errors; C is not an independent review and may miss the same issue.",
	},
	{
		id: "claude-generated-032",
		domain: "D2",
		question:
			"A Claude draft of a client proposal has a strong structure. What should the account lead verify before sending it?",
		options: [
			"Ask Claude to make the proposal more persuasive for the client's industry.",
			"Check client names, prices, dates, scope, and commitments against approved business records.",
			"Ask a colleague to proofread grammar and formatting.",
			"Ask Claude to compare the proposal with a checklist of common winning proposals.",
		],
		correctAnswers: [1],
		explanation:
			"A client-facing proposal can create commercial commitments. Verify its specific facts and terms against authoritative records before it is sent.",
		source: testAppSource,
		whyNot:
			"A and D can improve presentation but do not validate the deal details; C catches language issues, not incorrect prices or commitments.",
	},
	{
		id: "claude-generated-033",
		domain: "D2",
		question:
			"A manager requested a status summary with sections for risks, costs, and timeline, under 300 words, using supplied facts. What is the fastest useful quality check?",
		options: [
			"Read it once and judge whether it sounds clear and professional.",
			"Ask Claude to score the summary and revise it if the score is low.",
			"Compare its style and length with last month's summary.",
			"Check the three required sections, word limit, and factual claims against the source.",
		],
		correctAnswers: [3],
		explanation:
			"The request supplies objective acceptance criteria. Checking structure, length, and source facts gives a focused review tied to what the manager asked for.",
		source: testAppSource,
		whyNot:
			"A is subjective; B delegates quality judgment without criteria; C uses a prior document rather than the current requirements.",
	},
	{
		id: "claude-generated-034",
		domain: "D2",
		question:
			"Claude gives a competitor's current CEO and product price. How should an analyst handle these time-sensitive claims?",
		options: [
			"Confirm them against current, credible sources before relying on them.",
			"Accept them if Claude states them without uncertainty.",
			"Use them for internal decisions, but check them only if they appear in an external document.",
			"Ask in a new chat and accept the facts if Claude repeats them.",
		],
		correctAnswers: [0],
		explanation:
			"Leadership names and prices can change. Check them against current sources even when the answer sounds certain or is used only internally.",
		source: testAppSource,
		whyNot:
			"B confuses confidence with evidence; C allows stale facts to influence internal decisions; D repeats the same source of uncertainty.",
	},
	{
		id: "claude-generated-035",
		domain: "D2",
		question:
			"A team reruns a prompt that classifies customer complaints, and roughly one in ten results changes category. What is the best improvement?",
		options: [
			"Run it again and use the most common label for each complaint.",
			"Switch models and assume the new model will make every classification repeatable.",
			"Define categories with examples, specify the output format, and review ambiguous cases.",
			"Accept the differences because the majority of classifications are unchanged.",
		],
		correctAnswers: [2],
		explanation:
			"Clear definitions and examples reduce ambiguity. A consistent output format and targeted review of borderline cases improve reliability without assuming identical model responses.",
		source: testAppSource,
		whyNot:
			"A masks rather than resolves ambiguity; B cannot guarantee identical outputs; D leaves the inconsistent cases unexplained.",
	},
	{
		id: "claude-generated-037",
		domain: "D3",
		question:
			"A strategy lead needs a cited market investigation combining public web sources with company documents available through an approved Drive connector. Which Claude capability best fits?",
		options: [
			"Research, with web search and the approved connector available for the task.",
			"A Project containing only the company documents.",
			"A standard chat with extended thinking, but no search or connector.",
			"A standard chat using one public web search at a time.",
		],
		correctAnswers: [0],
		explanation:
			"Research is designed for multi-step investigation across available web and connected sources, with citations that support review.",
		source: testAppSource,
		whyNot:
			"A Project can organize internal references but does not perform the requested web investigation; thinking alone adds no sources; a single search is less suited to a multi-source investigation.",
	},
	{
		id: "claude-generated-038",
		domain: "D3",
		question:
			"A coordinator wants an interactive budget tracker and a short summary that she can revise and share. Which feature is designed for this kind of deliverable?",
		options: [
			"A Project, used as a repository for reference documents.",
			"An Artifact, which presents an editable standalone document or interactive tool.",
			"A Skill that stores the finished tracker as a reusable procedure.",
			"Research mode, which investigates questions using sources.",
		],
		correctAnswers: [1],
		explanation:
			"Artifacts are intended for substantial standalone outputs such as documents and interactive tools that can be iterated on and shared.",
		source: testAppSource,
		whyNot:
			"A holds reference context rather than the deliverable; C packages reusable instructions; D is for research, not for creating this artifact.",
	},
	{
		id: "claude-generated-041",
		domain: "D3",
		question:
			"A department needs a general-purpose default model for routine drafting, summarizing, and analysis, balancing capability with response speed. Which model tier is usually the starting point?",
		options: [
			"Haiku, because speed should take priority for every everyday task.",
			"Sonnet, which is positioned as a balance of capability and speed for common work.",
			"Opus, because the most capable tier is always the most suitable default.",
			"Opus for drafting and Haiku for analysis, regardless of task demands.",
		],
		correctAnswers: [1],
		explanation:
			"A balanced tier is a practical default for varied everyday tasks; faster or more capable tiers can be selected when a task's needs justify them.",
		source: testAppSource,
		whyNot:
			"A overweights speed; C assumes maximum capability is always needed; D prescribes a fixed pairing without considering the task.",
	},
	{
		id: "claude-generated-042",
		domain: "D3",
		question:
			"When should a user enable extended or adaptive thinking, when that feature is available for the selected model?",
		options: [
			"For a complex task that benefits from deeper reasoning, when the extra time is acceptable.",
			"For every request, because more thinking always guarantees a more accurate answer.",
			"For a very long document, because thinking expands the model's context capacity.",
			"For a question about recent events, because thinking retrieves current sources.",
		],
		correctAnswers: [0],
		explanation:
			"Extended or adaptive thinking is model-dependent and can help with complex reasoning, but it does not expand the context window or retrieve current information. Use search or connected sources when freshness is required.",
		source: testAppSource,
		whyNot:
			"B assumes a universal accuracy gain; C confuses reasoning with context capacity; D confuses reasoning with access to current sources.",
	},
	{
		id: "claude-generated-044",
		domain: "D3",
		question:
			"A user needs to answer questions across dozens of large product manuals that cannot fit in one chat. Which approach best organizes the reference material?",
		options: [
			"Paste a few manuals into each chat and rely on memory for the rest.",
			"Curate the relevant manuals in Project knowledge and let Claude retrieve material supported by the product and plan.",
			"Summarize every manual once and discard the original files.",
			"Use public web search to locate internal manuals that are not published online.",
		],
		correctAnswers: [1],
		explanation:
			"Project knowledge provides a reusable place for reference documents and can help retrieve relevant material. Keep source files authoritative and confirm applicable product limits.",
		source: testAppSource,
		whyNot:
			"A makes context repetitive and incomplete; C can lose details needed to answer questions; D cannot find private files that are not publicly available.",
	},
	{
		id: "claude-generated-045",
		domain: "D5",
		question:
			"A user wants concise replies in British English and wants Claude to know her procurement role across chats, not only inside one Project. What should she configure?",
		options: [
			"Repeat the preferences in every Project she uses.",
			"Create a separate Project for each conversation.",
			"Set stable preferences in account-wide Instructions for Claude; memory may supplement them but is not required.",
			"Add the preferences at the start of each chat and rely on them across future chats.",
		],
		correctAnswers: [2],
		explanation:
			"Account-wide Instructions for Claude are the explicit place for stable preferences that should apply across conversations. Memory can supplement context, but the instructions do not depend on it.",
		source: testAppSource,
		whyNot:
			"A is limited to chats within each Project; B does not set a cross-chat preference; D requires repeating instructions and does not configure future conversations.",
	},
	{
		id: "claude-generated-046",
		domain: "D3",
		question:
			"A user has a one-off question that she does not want saved in chat history or used for memory. Which feature is intended for that use?",
		options: [
			"An incognito chat, while still following organizational data policies.",
			"Pausing memory, which also removes the conversation from chat history.",
			"A new Project, which prevents its chats from being stored.",
			"Deleting a regular chat afterward, which means it was never in chat history.",
		],
		correctAnswers: [0],
		explanation:
			"Incognito chats are intended not to appear in chat history or memory. That does not change policy requirements for the information entered.",
		source: testAppSource,
		whyNot:
			"B affects memory but not necessarily chat history; C does not make Project chats unstored; D removes a chat only after it has existed in history.",
	},
	{
		id: "claude-generated-048",
		domain: "D4",
		question:
			"A department head says, “We need to start using AI.” What should the solution designer do first?",
		options: [
			"Give everyone access and wait to see which uses appear.",
			"Understand tasks, pain points, volumes, constraints, and measures of success.",
			"Choose the most capable plan and model before discussing the work.",
			"Write a team-specific policy before identifying any use case.",
		],
		correctAnswers: [1],
		explanation:
			"Requirements analysis identifies the problem to solve and the constraints that shape a useful and safe solution before tools are selected.",
		source: testAppSource,
		whyNot:
			"A begins without goals or measures; C chooses technology before the need is understood; D may matter later but does not identify suitable use cases.",
	},
	{
		id: "claude-generated-052",
		domain: "D4",
		question:
			"Claude extracts supplier, amount, and due date from invoices. Where should a human checkpoint sit in the payment workflow?",
		options: [
			"After payment, by sampling a small number of invoices each month.",
			"Before any processing, by manually checking every field in every invoice.",
			"Before payment approval, with required review for high-value, unclear, or mismatched records.",
			"Only after a supplier reports a payment problem.",
		],
		correctAnswers: [2],
		explanation:
			"Review belongs before a consequential and hard-to-reverse action. Risk-based escalation focuses people on exceptions while preserving efficiency for routine cases.",
		source: testAppSource,
		whyNot:
			"A and D detect errors only after harm may occur; B may add unnecessary review to routine low-risk cases rather than using proportionate controls.",
	},
	{
		id: "claude-generated-058",
		domain: "D4",
		question:
			"One month into a pilot, few employees use Claude for their daily work. Which intervention is most likely to address the adoption gap?",
		options: [
			"Provide role-specific training on real tasks and support peer champions who share useful examples.",
			"Require daily usage and report logins to managers.",
			"Extend the pilot without changing its support or use cases.",
			"Send a general newsletter about the benefits of generative AI.",
		],
		correctAnswers: [0],
		explanation:
			"Practical examples tied to people's roles show where the tool helps. Peer support can make learning relevant and address questions in the team's actual workflow.",
		source: testAppSource,
		whyNot:
			"B measures activity rather than value; C assumes time alone will remove barriers; D is broad and does not show how the tool applies to specific work.",
	},
	{
		id: "claude-generated-060",
		domain: "D6",
		question:
			"During requirements gathering, a support team says customer data must remain in the EU. How should the designer treat this constraint?",
		options: [
			"Record it as a preference and revisit it after the pilot.",
			"Treat it only as a functional requirement for the assistant's response.",
			"Validate the data-residency constraint with privacy, legal, or compliance owners before designing the workflow.",
			"Leave it for implementation because it is a technical detail, not a workflow constraint.",
		],
		correctAnswers: [2],
		explanation:
			"Data residency is a privacy and compliance constraint that can determine which tools, plans, and data flows are permitted. Validate it before workflow design proceeds.",
		source: testAppSource,
		whyNot:
			"A and D defer a constraint that can invalidate the design; B treats a data-handling requirement as an output feature and misses its compliance impact.",
	},
	{
		id: "claude-generated-061",
		domain: "D4",
		question:
			"Employees are concerned that a Claude pilot may change their roles. Which communication approach best supports responsible adoption?",
		options: [
			"Promise that no roles or responsibilities will change.",
			"Present only the financial case for adopting AI.",
			"Focus on tool training without discussing the employees' concerns.",
			"Be candid about likely changes, show concrete examples, and involve employees in workflow design.",
		],
		correctAnswers: [3],
		explanation:
			"Honest communication, practical examples, and participation build trust and help teams identify how the tool can support their work.",
		source: testAppSource,
		whyNot:
			"A makes a promise the team may not be able to keep; B ignores employee concerns; C teaches features but does not address the effect on work.",
	},
	{
		id: "claude-generated-062",
		domain: "D4",
		question:
			"Before adding Claude to a client-facing workflow, which TWO questions should the design team resolve?",
		options: [
			"Which interface theme and brand colors should be used?",
			"Whether the team can reduce staffing after launch.",
			"Who reviews outputs and how errors are detected before they reach clients.",
			"What data Claude will access and whether that use is permitted by policy and contract.",
			"How many example prompts each employee should save.",
		],
		correctAnswers: [2, 3],
		explanation:
			"A client-facing workflow needs a defined review and error-handling path, plus confirmation that its data use is permitted. These controls belong in design, not after launch.",
		source: testAppSource,
		whyNot:
			"A and E are secondary presentation or training details; B is not a workflow safeguard and does not establish a safe operating model.",
		selectCount: 2,
	},
	{
		id: "claude-generated-063",
		domain: "D4",
		question:
			"A payroll workflow requires identical, auditable tax calculations every month. Where should the calculation run?",
		options: [
			"In the validated payroll system, with Claude used for explanations or summaries around the calculation.",
			"In Claude, with a payroll clerk checking the final totals.",
			"In Claude three times, using the result that appears most often.",
			"In a Project containing the tax rules and rates.",
		],
		correctAnswers: [0],
		explanation:
			"Exact, repeatable, auditable calculations belong in validated systems. Claude can support communication around the result without becoming the calculation authority.",
		source: testAppSource,
		whyNot:
			"B still relies on nondeterministic calculation for payroll; C uses agreement between runs instead of validation; D stores reference material but does not make the calculation deterministic.",
	},
	{
		id: "claude-generated-067",
		domain: "D5",
		question:
			"A manager wants colleagues to use a shared Project and chat in it, but not change its instructions or knowledge. Which permission should the manager choose?",
		options: [
			"Give everyone edit access and ask them not to change anything.",
			"Share it with the whole organization, regardless of who needs it.",
			"Use the view-level permission that allows use without editing the Project.",
			"Give each colleague a separate copy that can drift from the managed version.",
		],
		correctAnswers: [2],
		explanation:
			"A view-level role supports use while reserving changes to instructions and knowledge for authorized editors. Apply the narrowest permission that meets the team's need.",
		source: testAppSource,
		whyNot:
			"A grants more control than intended; B widens access without a need; D creates copies that can become inconsistent with the managed Project.",
	},
	{
		id: "claude-generated-069",
		domain: "D5",
		question:
			"A team is considering connectors to email, calendar, and chat data. Which TWO practices should guide setup?",
		options: [
			"Enable every connector so employees can discover useful features.",
			"Enable only the connectors required for the approved use case.",
			"Connect the whole team through one shared account.",
			"Confirm each connector is approved by the administrator and allowed by data policy.",
			"Let each employee connect any service they personally use.",
		],
		correctAnswers: [1, 3],
		explanation:
			"Least privilege limits access to what the workflow needs, and administrative approval confirms the connector fits the organization's data controls.",
		source: testAppSource,
		whyNot:
			"A and E expand access without a defined need or approval; C weakens individual identity and access controls.",
		selectCount: 2,
	},
	{
		id: "claude-generated-071",
		domain: "D5",
		question:
			"A consultant serves two competing clients and must keep their work separate. Which setup best reduces unintended context sharing?",
		options: [
			"Use a separate Project for each client and disable “Use account memory” for a Project where required; still follow access controls and confidentiality policy.",
			"Keep both clients in one Project and instruct Claude not to mix their information.",
			"Use separate chats in one Project, where both clients share the same Project context.",
			"Use only incognito chats, regardless of whether approved client material must be available.",
		],
		correctAnswers: [0],
		explanation:
			"Separate Projects and disabling account memory where required help isolate context. They do not replace organizational access controls, contractual duties, or confidentiality policy.",
		source: testAppSource,
		whyNot:
			"B relies on an instruction instead of separation; C retains shared Project context; D removes useful continuity without deciding whether the data may be processed.",
	},
	{
		id: "claude-generated-072",
		domain: "D5",
		question:
			"A communications department on a Claude Team plan has an approved writing style. It wants every member to apply the shared guidance on demand across chats. Which configuration fits best?",
		options: [
			"Ask each member to set the style in their personal Instructions for Claude.",
			"Upload the style guide separately to every Project the team uses.",
			"Ask Claude to infer the shared style from each member's memory.",
			"Have an organization owner provision an organization-wide Skill with the approved style guide and examples.",
		],
		correctAnswers: [3],
		explanation:
			"If Skills and code execution are enabled in organization policy, Team plan owners can provision Skills for all users. A shared Skill can package approved style guidance and examples, which members can apply when the relevant task comes up.",
		source: testAppSource,
		whyNot:
			"A creates separate per-user settings; B requires duplicate Project configuration and applies only within those Projects; C relies on individual memory instead of an approved, centrally managed style.",
	},
	{
		id: "claude-generated-073",
		domain: "D5",
		question:
			"Each quarter, an analyst collects figures, applies formatting rules, and produces the same report template. How can she make this multi-step task reusable?",
		options: [
			"Paste the full procedure into a new chat at the start of every quarter.",
			"Package the procedure, template, and supporting files in a Skill that can be used for the task.",
			"Keep one chat open throughout the year and expect it to retain every detail.",
			"Rely on memory to reconstruct the procedure from last quarter's conversation.",
		],
		correctAnswers: [1],
		explanation:
			"A Skill can package repeatable instructions and resources so the analyst does not need to rebuild the workflow each quarter.",
		source: testAppSource,
		whyNot:
			"A remains manual; C accumulates unrelated context and can lose useful details; D uses memory for a procedure and template it is not designed to preserve reliably.",
	},
	{
		id: "claude-generated-080",
		domain: "D6",
		question:
			"A partner shared a confidential roadmap under an NDA. An employee wants Claude to summarize it for internal colleagues. What must happen first?",
		options: [
			"Upload it to any company-approved Claude workspace because the workspace is approved.",
			"Remove the partner's name and logo, then upload it.",
			"Tell Claude to keep the roadmap confidential.",
			"Check the NDA and company policy to confirm processing is permitted; consult legal if unclear.",
		],
		correctAnswers: [3],
		explanation:
			"Third-party confidential data is subject to contractual terms as well as company policy. Confirm that both permit the intended processing before sharing the document.",
		source: testAppSource,
		whyNot:
			"A does not override the NDA; B does not remove the confidentiality obligation; C cannot change the contractual or policy rules.",
	},
	{
		id: "claude-generated-081",
		domain: "D6",
		question:
			"An analyst is selecting fields from EU customer records for a purchasing analysis. Which GDPR principle most directly limits the fields included?",
		options: [
			"Accuracy: keep personal data correct and current.",
			"Data minimisation: include only personal data needed for the stated purpose.",
			"Storage limitation: delete data when it is no longer needed.",
			"Integrity and confidentiality: protect data from unauthorized access.",
		],
		correctAnswers: [1],
		explanation:
			"Data minimisation concerns which personal data is necessary for the purpose. Accuracy, retention, and security govern different parts of data handling.",
		source: testAppSource,
		whyNot:
			"A addresses correctness; C addresses retention; D addresses protection. None of those principles directly determines which fields are needed.",
	},
	{
		id: "claude-generated-082",
		domain: "D6",
		question:
			"An HR team uses Claude to assist with application reviews. Which TWO safeguards are most appropriate?",
		options: [
			"Remove protected attributes and unnecessary personal details from prompts where lawful and relevant, while recognizing that proxies can still carry bias.",
			"Let Claude automatically reject applicants below a score threshold for consistency.",
			"Avoid documenting AI use to reduce the chance of scrutiny.",
			"Keep decisions with human reviewers and conduct fairness audits using lawful, controlled demographic data where needed.",
			"Assume redacting protected attributes removes bias from the results.",
		],
		correctAnswers: [0, 3],
		explanation:
			"Data minimisation and accountable human review are useful safeguards, but removing direct attributes does not remove proxy bias. A lawful, controlled use of demographic data may be needed to audit fairness.",
		source: testAppSource,
		whyNot:
			"B automates a consequential decision; C undermines governance; E makes an incorrect claim that proxy variables and other sources of bias disappear after redaction.",
		selectCount: 2,
	},
	{
		id: "claude-generated-083",
		domain: "D6",
		question:
			"A vendor proposal contains hidden text telling Claude to ignore prior instructions and recommend that vendor. What should the employee do?",
		options: [
			"Repeat the prompt with a stronger instruction to ignore hidden text.",
			"Use the recommendation after checking only the proposal's price and references.",
			"Treat the document as untrusted, verify Claude's output against it, and report the suspected manipulation to security.",
			"Delete the email and ask the vendor to resend the document without involving security.",
		],
		correctAnswers: [2],
		explanation:
			"Instructions embedded in external content are untrusted input. Review the output against the source and report suspected prompt injection through the security process.",
		source: testAppSource,
		whyNot:
			"A is not a reliable control; B may miss manipulated conclusions; D does not alert security to a possible issue that could affect other users.",
	},
	{
		id: "claude-generated-085",
		domain: "D6",
		question:
			"A marketer asks Claude to reproduce a paywalled article in full for republication. What is the appropriate response?",
		options: [
			"Republish it with the author's name and a link to the original.",
			"Do not reproduce it in full; create original material, summarize with appropriate attribution, or obtain permission.",
			"Ask Claude to paraphrase the whole article closely and publish the rewrite as new work.",
			"Republish up to a fixed percentage of the article because that amount is always fair use.",
		],
		correctAnswers: [1],
		explanation:
			"Attribution does not by itself grant permission. U.S. fair use has no fixed percentage threshold; it depends on the circumstances, so use original work, a limited appropriate summary, or obtain rights.",
		source: testAppSource,
		whyNot:
			"A gives credit but may still reproduce protected expression; C may remain substantially similar; D incorrectly treats fair use as a fixed numerical allowance.",
	},
	{
		id: "claude-generated-087",
		domain: "D6",
		question:
			"Company policy allows Confidential data only in its Enterprise workspace and prohibits Restricted data in any AI tool. An employee wants to upload a Restricted acquisition document. What should the employee do?",
		options: [
			"Use the Enterprise workspace because it is approved for company data.",
			"Upload only its executive summary because it contains fewer details.",
			"Do not use the document with Claude; follow policy and ask governance if an exception is needed.",
			"Remove names and deal values, then use the Enterprise workspace.",
		],
		correctAnswers: [2],
		explanation:
			"The policy prohibits Restricted data in any AI tool. A different workspace or a shorter excerpt does not change the classification or permission.",
		source: testAppSource,
		whyNot:
			"A applies the Confidential-data rule to Restricted data; B still shares restricted content; D does not change the classification or authorize processing.",
	},
	{
		id: "claude-generated-090",
		domain: "D6",
		question:
			"After a month of successful customer-facing use, a team stops reviewing Claude's outputs. What risk has increased, and what should the team do?",
		options: [
			"Automation bias; maintain risk-proportionate review and periodic audits.",
			"Model drift; switch to a new model every month without testing.",
			"Data leakage; move the whole workflow to incognito chats.",
			"No meaningful risk; a month of good results establishes reliability.",
		],
		correctAnswers: [0],
		explanation:
			"Good past performance can lead people to over-rely on automated output. Ongoing review and audits help detect errors that still occur.",
		source: testAppSource,
		whyNot:
			"B and C address different risks; D assumes that previous accuracy guarantees future results and removes the remaining safeguard.",
	},
	{
		id: "claude-generated-094",
		domain: "D7",
		question:
			"Stakeholders say weekly summaries are too long and difficult to scan. Which prompt or configuration change is most useful?",
		options: [
			"Add “be concise” to each request and leave the requirement otherwise undefined.",
			"Set checkable rules such as a word limit, fixed headings, and an approved example, then review the next output.",
			"Switch to a smaller model because it will always produce shorter summaries.",
			"Send the same summary every two weeks instead of addressing its format.",
		],
		correctAnswers: [1],
		explanation:
			"Translate feedback into concrete constraints that can be applied consistently and checked in future outputs.",
		source: testAppSource,
		whyNot:
			"A remains vague; C changes model choice without encoding the requirement; D changes timing but not readability.",
	},
	{
		id: "claude-generated-095",
		domain: "D7",
		question:
			"Claude gives a generic response to a report URL hosted on a private intranet. What should the user check first?",
		options: [
			"Check whether an approved connector can access the report; if not, use an approved way to provide its contents. Public web search alone cannot reach a private intranet.",
			"Shorten the URL so Claude can process the intranet page.",
			"Turn on public web search, which grants access to the company's private network.",
			"Ask for a summary of only the first section, even if Claude could not access the page.",
		],
		correctAnswers: [0],
		explanation:
			"First confirm that Claude can retrieve the content through an approved connector. Use public web search only when the needed content is public; web search does not grant private-network access.",
		source: testAppSource,
		whyNot:
			"B does not change network access; C incorrectly treats public search as an intranet connection; D asks for analysis of material Claude has not received.",
	},
	{
		id: "claude-generated-097",
		domain: "D7",
		question:
			"Claude's totals from an uploaded spreadsheet disagree with the finance system. What is the best troubleshooting step?",
		options: [
			"Upload the file again and compare the totals from two separate chats.",
			"Abandon the analysis and manually redo every calculation without checking how the file was read.",
			"Ask Claude to double-check the totals without requesting the underlying method.",
			"Ask how the data was interpreted and request the calculations, then compare them with the source and correct any structural issues.",
		],
		correctAnswers: [3],
		explanation:
			"Inspecting headers, merged cells, subtotals, and calculations can reveal how the mismatch occurred. Validate the corrected result against the source data.",
		source: testAppSource,
		whyNot:
			"A repeats the task without diagnosing it; B skips useful investigation; C can repeat the same error without exposing the data interpretation.",
	},
	{
		id: "claude-generated-098",
		domain: "D7",
		question:
			"A customer-email triage prompt works in English but fails on multilingual messages. Which TWO steps best improve it?",
		options: [
			"Require customers to submit all messages in English.",
			"Add explicit instructions and representative multilingual examples.",
			"Discard the existing prompt and start over without analyzing the failures.",
			"Use the failed messages as test cases for the revised prompt.",
			"Add emphasis words without changing the instructions or tests.",
		],
		correctAnswers: [1, 3],
		explanation:
			"Examples address the missing input patterns, and regression cases show whether the changes fix the observed failures without breaking existing behavior.",
		source: testAppSource,
		whyNot:
			"A shifts the burden to customers; C discards useful working behavior; E adds emphasis but does not address multilingual cases or verify a fix.",
		selectCount: 2,
	},
	{
		id: "claude-generated-099",
		domain: "D7",
		question:
			"Claude invents plausible details when answering questions about an internal expenses policy. What is the most direct fix?",
		options: [
			"Use a more capable model because it should already know the company's policy.",
			"Provide the authoritative policy in Project knowledge and instruct Claude to answer from it or say when the answer is not found.",
			"Ask employees to write more precise questions without providing the policy.",
			"Tell Claude to add a caveat to every answer, even when the policy is available.",
		],
		correctAnswers: [1],
		explanation:
			"Without the authoritative policy, Claude may fill gaps with plausible but unsupported details. Supplying the source and requiring a not-found response grounds answers in the policy.",
		source: testAppSource,
		whyNot:
			"A assumes general model knowledge contains internal policy; C does not supply missing evidence; D adds caveats but does not correct the unsupported source.",
	},
	{
		id: "claude-generated-100",
		domain: "D7",
		question:
			"A team reaches its Claude usage limits early after repeatedly adding the same large reference PDFs and keeping chats on many topics. Which change may help reduce unnecessary context costs?",
		options: [
			"Upgrade everyone's plan before checking whether the workflow can be made more efficient.",
			"Put every task into one very long chat so no one needs to organize the work.",
			"Use Project knowledge for recurring reference material and keep separate chats focused, then monitor actual usage.",
			"Compress the PDFs into an archive but upload it again for every task.",
		],
		correctAnswers: [2],
		explanation:
			"Reusing project-level references and focused chats can reduce repeated uploads and unnecessary context. Usage varies by plan, model, content, and product behavior, so savings are not guaranteed and should be measured.",
		source: testAppSource,
		whyNot:
			"A may add cost before workflow review; B combines unrelated context; D still repeats uploads and compression does not necessarily reduce the work Claude processes.",
	},
];
