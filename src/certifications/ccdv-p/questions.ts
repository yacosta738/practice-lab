import type { Question } from "../../lib/quiz-types";

const practiceSource = {
	label:
		"Matthew Purcell — Claude Certified Developer – Professional: Full Practice Exam Question Set (2026-11-24; adapted; CC BY-NC 4.0; noncommercial; not official exam content)",
	url: "https://www.linkedin.com/posts/purcellmatthew_ccdv-p-claude-certified-developer-professional-activity-7530737595782438912-kSDX",
};

function withScenario(context: string, questions: Question[]): Question[] {
	return questions.map((question) => ({
		...question,
		question: `${context}\n\n${question.question}`,
	}));
}

export const questions: Question[] = [
	...withScenario(
		"Wattlebrook Water supplies 600,000 households. Its customer copilot, built with the Claude Agent SDK, handles outage reports, billing questions, and payment arrangements. A triage agent hands each conversation to one of three specialist subagents. When a water main bursts, contact volume rises tenfold within minutes, and most customers ask the same question. Hardship payment arrangements need staff approval and can pause for days while customers gather documents.",
		[
			{
				id: "PDF-1.1",
				domain: "D1",
				question:
					"Customers are asked to prove their identity again when a conversation moves between specialists. The triage agent verifies the customer, then delegates with a one-line prompt. The billing specialist starts in a fresh context and cannot see the verification. Average handling time has risen by 90 seconds, and some customers abandon the conversation at the second identity check. Which change best addresses the cause?",
				options: [
					"Tell each specialist to assume that an earlier agent verified the customer.",
					"Pass a structured handoff with identity, account, and issue data validated by the harness.",
					"Remove the specialists and let the triage agent handle every issue in one long conversation.",
					"Give each specialist the complete triage transcript and all tool results.",
				],
				correctAnswers: [1],
				explanation:
					"A subagent starts with a fresh context, so established facts must cross the boundary explicitly. Identity is security-sensitive state: the harness must validate it and pass it as trusted structured data, not rely on model-generated text or an instruction to assume verification.",
				whyNot:
					"A asks an agent to assume a security fact it cannot verify. C discards useful context isolation to fix a missing handoff. D adds irrelevant context and cost when only a few validated fields need to cross the boundary.",
				source: practiceSource,
			},
			{
				id: "PDF-1.2",
				domain: "D1",
				question:
					"During a burst main, 14,000 customers contact the copilot in an hour, and 88% ask whether there is an outage at their address and when water will return. Each conversation runs five to eight model turns, API rate limits are reached, and customers with billing problems cannot get through. The operations system already holds affected streets and estimated restoration times. Which architecture change does this evidence support?",
				options: [
					"Add a fourth specialist subagent for burst-main questions.",
					"Answer known-incident questions with a fixed lookup-and-reply workflow, and keep the agent loop for other requests.",
					"Pause the copilot during incidents and direct every customer to a recording.",
					"Raise the turn limit and request higher rate limits so every conversation can run its full agent loop.",
				],
				correctAnswers: [1],
				explanation:
					"When most requests follow one predictable path, a workflow is cheaper, faster, and more reliable than an agent loop. Matching an address to the incident and returning a restoration time frees model capacity for conversations that need an agent.",
				whyNot:
					"A still spends several model turns on a simple lookup. C removes service for billing customers and for questions the recording does not cover. D pays for thousands of repeated investigations and depends on a limit increase.",
				source: practiceSource,
			},
			{
				id: "PDF-1.3",
				domain: "D1",
				question:
					"A customer starts a hardship arrangement on Monday and uploads documents on Thursday. The copilot process restarted on Tuesday, so the conversation begins again from nothing. In another case the session survived, but the copilot used Monday's balance even though the customer paid on Wednesday. Which two changes address these failures? (Choose two.)",
				options: [
					"Persist the session and case summary externally, then resume when the upload event arrives.",
					"Keep the copilot process running without restarts for every open arrangement.",
					"Ask customers to complete the arrangement in one sitting.",
					"On resume, read the balance and other changeable facts again before acting.",
					"Copy the balance into the system prompt on Monday so it stays available all week.",
				],
				correctAnswers: [0, 3],
				selectCount: 2,
				explanation:
					"Durable execution has two parts: state must live outside the process so a paused conversation can resume, and changeable facts must be read again from their source before the system acts.",
				whyNot:
					"B cannot prevent crashes or deployments. C shifts the system's limitation to customers who may need time to gather documents. E preserves a value that can change and recreates the stale-balance failure.",
				source: practiceSource,
			},
			{
				id: "PDF-1.4",
				domain: "D1",
				question:
					"To answer how much a customer paid for water last year, the billing specialist calls `get_bill` once for every bill. Each result adds about 1,800 tokens to context, and the model adds the amounts itself. Traces show arithmetic errors, and these conversations cost six times the median. The harness supports code execution and programmatic tool calling. Which technique fits best?",
				options: [
					"Ask the model to double-check its addition and state its confidence.",
					"Move to a model with a larger context window so every bill fits.",
					"Limit the answer to the last three months of bills.",
					"Have the model call the tool and sum the amounts in a sandbox, returning only the total.",
				],
				correctAnswers: [3],
				explanation:
					"Programmatic tool calling keeps intermediate results in the execution environment and returns only the computed answer to context. This reduces tokens and uses exact computation instead of model arithmetic.",
				whyNot:
					"A adds turns without removing the cause of the errors or token use. B keeps all bills in context and leaves arithmetic to the model. C answers a different question from the one the customer asked.",
				source: practiceSource,
			},
			{
				id: "PDF-1.5",
				domain: "D1",
				question:
					"Staff approve or reject each hardship arrangement. When staff reject a proposal, the harness returns only `rejected`, so the copilot resubmits the same or a nearly identical proposal as many as five times. Staff say most rejections have one fixable reason, such as an instalment amount that is too low. How should the approval flow change?",
				options: [
					"Tell the copilot to wait 24 hours before resubmitting a proposal.",
					"Send every rejected proposal to a second staff member for review.",
					"Remove staff approval for arrangements below a fixed amount.",
					"Return the reviewer's reason or amended terms, cap resubmissions, and escalate when the cap is reached.",
				],
				correctAnswers: [3],
				explanation:
					"A human approval gate should return useful feedback, not only a verdict. The reason or revised terms let the copilot address a fixable issue, while a resubmission cap prevents approval fatigue and escalation handles unresolved cases.",
				whyNot:
					"A delays the customer without giving the copilot anything to change. B increases staff effort while leaving the feedback gap. C removes a required human control instead of fixing the approval flow.",
				source: practiceSource,
			},
			{
				id: "PDF-1.6",
				domain: "D2",
				question:
					"The copilot generates long hardship assessment letters with a non-streaming request and a large output limit. About one request in five fails with a connection error after roughly 60 seconds, although the API is healthy. The corporate proxy closes connections with no data for 60 seconds. Retrying usually fails the same way and doubles the cost. What is the most appropriate fix?",
				options: [
					"Split each letter into ten separate requests and join the paragraphs.",
					"Retry every failed request up to five times with exponential backoff.",
					"Stream and accumulate events, while configuring transport timeouts and handling partial streams.",
					"Lower the output limit to 300 tokens so each letter finishes within 60 seconds.",
				],
				correctAnswers: [2],
				explanation:
					"Streaming can prevent an idle timeout only when events arrive before the proxy deadline. The client must also set appropriate transport timeouts, detect incomplete streams, and safely resume or retry without treating partial text as a complete letter.",
				whyNot:
					"A multiplies input cost and can harm coherence. B repeats a request likely to be cut off again. D truncates letters that customers and staff need in full.",
				source: practiceSource,
			},
			{
				id: "PDF-1.7",
				domain: "D3",
				question:
					"After a burst main, the operations centre learns about the incident from customers 25 minutes before its own sensors raise an alarm. An engineer noticed the signal only by reading transcripts. The copilot already classifies each conversation by intent and suburb. Management wants an automatic alert without staff reading conversations. What should the team build?",
				options: [
					"A dashboard of total conversations per hour for the whole service area.",
					"An alert on the copilot's HTTP error rate, because incidents may increase traffic.",
					"Intent counts per suburb as a metric, with an alert when a count departs sharply from its baseline.",
					"A weekly report of the ten most common intents across all suburbs.",
				],
				correctAnswers: [2],
				explanation:
					"Structured attributes can make the copilot an operational sensor. A per-suburb anomaly alert on an outage intent can detect an incident quickly while exporting aggregate counts rather than transcript content.",
				whyNot:
					"A hides a local spike in the area-wide total and depends on someone looking. B tracks capacity errors, not customer reports, and may stay silent. D arrives days after an incident that needs a quick response.",
				source: practiceSource,
			},
			{
				id: "PDF-1.8",
				domain: "D6",
				question:
					"A latency profile shows time to first token of 0.7 seconds and total response time of 11 seconds. Responses are already streamed, and output generation accounts for almost all remaining time. The copilot writes about 550 tokens per answer, but customers only want the amount and due date. Which change will reduce latency most with the least loss of usefulness?",
				options: [
					"Add a second cache breakpoint after the customer's account details.",
					"Move live billing conversations to the asynchronous Message Batches API.",
					"Set the output limit to 80 tokens so no response can run longer than a few seconds.",
					"Lead with the direct answer, keep it brief, and offer more detail on request.",
				],
				correctAnswers: [3],
				explanation:
					"When output generation dominates latency, producing fewer output tokens is the direct lever. A concise answer designed around the customer's request avoids the truncation caused by a hard token cap.",
				whyNot:
					"A targets time to first token, which is already low. B is asynchronous and does not fit live chat. C can cut off a response instead of making it concise.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Corella Airlines carries 9 million passengers a year. When a flight is cancelled, its disruption copilot contacts affected passengers, proposes new flights, and rebooks them through reservation tools. One cancellation can affect 180 passengers at once, and alternative seats are limited. Rebooking changes tickets and can cost the airline money. Staff approval is required before a passenger moves to a partner airline.",
		[
			{
				id: "PDF-2.1",
				domain: "D1",
				question:
					"After a cancellation, the harness starts 180 independent sessions. Each searches for alternatives and offers its best flight. The same 40 seats are offered to all passengers; the first 40 to accept are rebooked, and the others receive an error. Passengers with tight connections often lose out to faster replies. Which orchestration design corrects this?",
				options: [
					"Allocate seats centrally by priority rules, atomically reserve each assignment, and let each session present its seat.",
					"Have the sessions message each other to negotiate who gets each seat.",
					"Give each session a random delay before searching.",
					"Offer every passenger the next three departures at once.",
				],
				correctAnswers: [0],
				explanation:
					"Scarce shared inventory needs a central allocator that applies priority rules and commits each assignment atomically, so concurrent sessions cannot promise the same seat. Expired holds must be detected and released or reassigned before another offer is made.",
				whyNot:
					"B creates coordination traffic without a single allocation owner. C reduces collisions by chance but still awards seats by timing. D leaves sessions competing for the same inventory without coordination.",
				source: practiceSource,
			},
			{
				id: "PDF-2.2",
				domain: "D1",
				question:
					"Three components can message a passenger: a notification agent announces the cancellation, a rebooking agent proposes flights, and a compensation agent sends meal vouchers. A passenger receives a cancellation notice, a confirmed flight, a voucher, and then a message saying options are still being searched. Each message was correct when written but arrived out of order. What is the best change to inter-agent communication?",
				options: [
					"Tell each agent to check what the other agents have sent.",
					"Delay every outbound message by five minutes.",
					"Route passenger-facing messages through one owner that orders and reconciles them before sending.",
					"Merge all agents into one large agent that performs every task in sequence.",
				],
				correctAnswers: [2],
				explanation:
					"When several components act for one passenger, one component should own the customer-facing voice. Other agents return results to it, and it sends one coherent, ordered message stream.",
				whyNot:
					"A assumes every agent can see the others' current state. B delays urgent messages without guaranteeing order. D gives up specialization and parallel work when only the outbound channel needs one owner.",
				source: practiceSource,
			},
			{
				id: "PDF-2.3",
				domain: "D1",
				question:
					"A passenger accepts a seat three hours after it was offered. The reservation system held it for 30 minutes, so the resumed session's booking call fails because the hold expired and the flight is full. How should the harness handle long pauses?",
				options: [
					"Tell the model to remember that seat holds expire.",
					"Treat hold expiry as an event; on resume, re-check availability and make a new offer before acting.",
					"Extend every hold to 24 hours.",
					"End any session without a reply within 30 minutes and start a new offer.",
				],
				correctAnswers: [1],
				explanation:
					"A resumed agent has a snapshot of a world that may have changed. The harness must track time-limited holds and revalidate them against the reservation system before acting on an old offer.",
				whyNot:
					"A relies on the model to infer elapsed time. C locks scarce seats away from other passengers. D discards useful conversation state and inconveniences passengers who reply late.",
				source: practiceSource,
			},
			{
				id: "PDF-2.4",
				domain: "D1",
				question:
					"During a mass disruption, 160 passengers need to move to a partner airline. Policy requires staff approval for each move, and the approval queue contains near-identical requests. Staff are clearing them rapidly without meaningful review. Which redesign keeps meaningful human oversight?",
				options: [
					"Present one approval for the group, bounded by flight, fare class, and passenger count, only if policy explicitly permits group authorization; otherwise retain individual approvals.",
					"Add four more staff members to the approval queue during disruptions.",
					"Have the copilot approve moves when it is highly confident staff would agree.",
					"Remove the approval requirement during declared mass disruptions.",
				],
				correctAnswers: [0],
				explanation:
					"A bounded group approval is valid only when policy explicitly authorizes that form of decision. If policy requires individual approval, keep that gate until an authorized policy change permits group review.",
				whyNot:
					"B increases capacity without improving the quality of each decision. C lets the agent authorize its own costly action. D removes the control when exposure is high.",
				source: practiceSource,
			},
			{
				id: "PDF-2.5",
				domain: "D2",
				question:
					"Rebooking involves cancelling an old ticket and issuing a new one. During a reservation-system slowdown, the second call failed for 23 passengers after the first succeeded, leaving them without tickets. Which integration design best prevents this outcome?",
				options: [
					"Confirm the new booking first, then cancel the old ticket, and compensate if a later step fails.",
					"Ask the model to check both tickets afterwards and report passengers who have neither.",
					"Run both calls in parallel so they complete nearly at the same time.",
					"Retry the second call indefinitely until it succeeds.",
				],
				correctAnswers: [0],
				explanation:
					"Book-first compensation is safe only when the provider supports the required operation. Use idempotency keys to prevent duplicate bookings, and reconcile uncertain outcomes against the reservation system before retrying or compensating.",
				whyNot:
					"B detects damage after it happens and depends on the model to check reliably. C can still succeed on one call and fail on the other. D can leave a passenger without a ticket while a dependency remains unavailable.",
				source: practiceSource,
			},
			{
				id: "PDF-2.6",
				domain: "D2",
				question:
					"After a cancellation, 180 sessions each search for available seats. The reservation system allows 50 searches per second, but the sessions together attempt about 400 and retry immediately. The model API has ample remaining capacity. What should the team do?",
				options: [
					"Retry more aggressively so each search gets through.",
					"Shorten availability results to reduce model context use.",
					"Put a shared rate limiter and short cache before the search tool, then revalidate inventory before booking.",
					"Request a higher model API limit and move the sessions to a smaller model.",
				],
				correctAnswers: [2],
				explanation:
					"The binding constraint is the reservation system's quota. A shared limiter controls aggregate demand, and caching identical searches can reduce load; cached availability is only advisory, so the booking path must still revalidate live inventory.",
				whyNot:
					"A adds load to a service already rejecting requests. B addresses a limit the traces do not show. D misreads the evidence because the model API has spare capacity.",
				source: practiceSource,
			},
			{
				id: "PDF-2.7",
				domain: "D4",
				question:
					"Eleven passengers were rebooked onto a flight that had been cancelled ten minutes earlier. The model's reasoning was sound: the search tool returned the flight as available, but its cache refreshes every 15 minutes. The booking tool writes to the reservation system, which accepted the bookings and flagged them later. Where did the failure originate, and what is the appropriate fix?",
				options: [
					"In ambiguous passenger requests; ask each passenger to confirm the flight number twice.",
					"In model reasoning; add a prompt rule to double-check every flight's status.",
					"In stale search data; invalidate the cache on cancellation events and validate status at booking.",
					"In the harness turn limit; finish sessions before data changes.",
				],
				correctAnswers: [2],
				explanation:
					"The trace shows a correct decision based on stale inputs, so the origin is the data layer. Event-driven cache invalidation narrows the stale window, and a live status check at booking adds a second line of defense.",
				whyNot:
					"A adds friction but still confirms a cancelled flight. B blames reasoning that was correct for the data it received. D does not change the cache's refresh interval.",
				source: practiceSource,
			},
			{
				id: "PDF-2.8",
				domain: "D7",
				question:
					"A passenger claims to be a Platinum member and requests a free business-class seat. The copilot rebooks him at a cost of $2,100, but the account has no elite status and no call record. The upgrade tool accepts any fare class the copilot requests. Which control best prevents this?",
				options: [
					"Have the tool read entitlements from the loyalty system and reject upgrades beyond them.",
					"Review all business-class rebookings at the end of each month.",
					"Train the copilot with more examples of polite refusals.",
					"Ask the passenger to confirm the claim in writing before applying the upgrade.",
				],
				correctAnswers: [0],
				explanation:
					"Conversation claims are untrusted input. The system of record must supply entitlements, and the tool must enforce them so a user assertion cannot widen the agent's authority.",
				whyNot:
					"A monthly review finds the loss after the flight. C improves wording but leaves the decision to the model. D relies on the claimant to verify their own claim.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Banksia Super is a retirement fund with 1.1 million members. Its member copilot answers factual questions about fees, insurance, and withdrawal rules from 2,300 documents, including annual disclosures for six products. Every answer must use current documents and show its source. Retrieval uses embeddings, 800-token chunks, and the top eight results.",
		[
			{
				id: "PDF-3.1",
				domain: "D2",
				question:
					"A member asks what insurance comes with the Balanced option, then asks what it costs if she is over 60. Retrieval searches on the second message alone and returns investment-fee chunks for older members, so the copilot answers about the wrong kind of cost. Follow-up retrieval accuracy is 30 points below first-turn accuracy. What is the most effective fix?",
				options: [
					"Increase the number of chunks returned from eight to 30 for every question.",
					"Rewrite each follow-up as a standalone query using the conversation context before searching.",
					"Embed the entire conversation and use that vector for every search.",
					"Ask members to restate their full question each time.",
				],
				correctAnswers: [1],
				explanation:
					"A follow-up often carries its subject in earlier turns. Query rewriting resolves references such as 'it' into a standalone question that retrieval can match.",
				whyNot:
					"A returns more material for a query that lacks its subject. C blends earlier topics into the query and can cause drift. D shifts the system's weakness onto members.",
				source: practiceSource,
			},
			{
				id: "PDF-3.2",
				domain: "D2",
				question:
					"Disclosure rules span several pages: an exception may appear under a later heading, separate from the rule. Retrieval often returns the rule but not its exception, and answers are wrong for some members. Smaller chunks improved matching but made missing exceptions worse. Which retrieval design addresses both observations?",
				options: [
					"Increase chunk size to 4,000 tokens so all rules and exceptions are embedded together.",
					"Replace embeddings with keyword search.",
					"Match on small chunks, then pass the larger parent section containing each match.",
					"Remind the model that exceptions may exist.",
				],
				correctAnswers: [2],
				explanation:
					"Small chunks can match precisely while larger passages preserve meaning. Retrieving on small units and returning the enclosing section provides both precise matching and the relevant exceptions.",
				whyNot:
					"A blurs embeddings across topics. B loses semantic matching for members who do not use legal terms. D cannot supply exception text that retrieval did not return.",
				source: practiceSource,
			},
			{
				id: "PDF-3.3",
				domain: "D2",
				question:
					"A reranker always passes its top eight chunks to the model. For narrow questions, six are loosely related text from other products and sometimes contaminate the answer. When a question has no coverage, eight irrelevant chunks are still passed and the copilot attempts an answer. What should the team change?",
				options: [
					"Pass only chunks above a relevance threshold, and treat an empty result as no answer.",
					"Lower the fixed number of chunks to one.",
					"Remove the reranker and return to embedding similarity alone.",
					"Raise the fixed number of chunks to 20.",
				],
				correctAnswers: [0],
				explanation:
					"A fixed number assumes every question has the same amount of relevant material. A threshold lets the count vary and gives the application an explicit signal when no result is relevant enough to answer.",
				whyNot:
					"B starves questions that need several passages. C discards a stronger relevance signal. D adds more unrelated text for both narrow and uncovered questions.",
				source: practiceSource,
			},
			{
				id: "PDF-3.4",
				domain: "D2",
				question:
					"Compliance requires that factual claims be grounded in current documents and that members can check answers. An audit finds answers mixing cited material with model knowledge, and citations that do not identify their documents. Which two measures meet these requirements? (Choose two.)",
				options: [
					"Add a disclaimer advising members to seek independent financial advice.",
					"Lower temperature to zero so answers are deterministic.",
					"Require citations and withhold claims that are not tied to supporting retrieved passages.",
					"Ask the model to rate its confidence and hide answers below a threshold.",
					"Display each source's title and issue date with the answer.",
				],
				correctAnswers: [2, 4],
				selectCount: 2,
				explanation:
					"Grounding needs a check that each claim is supported by its cited passage; citation presence alone does not establish support. Displaying source titles and dates lets members identify and verify the current document.",
				whyNot:
					"A is a disclaimer, not evidence. B makes an unsupported answer repeatable, not grounded. D measures how confident the model sounds, not whether a passage supports the claim.",
				source: practiceSource,
			},
			{
				id: "PDF-3.5",
				domain: "D2",
				question:
					"A retrieval system uses Voyage's text embeddings API. At index time, the team embeds passages with `input_type=document`; the search service also embeds each member's question with `input_type=document`. Retrieval performs below the provider's published results, especially for short questions. What change follows Voyage's documented guidance?",
				options: [
					"Re-index all passages with smaller chunks before changing the search service.",
					"Set `input_type=query` for member questions and keep `input_type=document` for indexed passages.",
					"Switch to a higher-dimensional embedding model before changing the search service.",
					"Replace approximate nearest-neighbor search with exact search.",
				],
				correctAnswers: [1],
				explanation:
					"Voyage's text-embedding documentation recommends `input_type=document` for indexed content and `input_type=query` for search queries. The parameter adds task-specific prompts, so this behavior is provider-specific rather than a universal embedding rule. Correct the query mode before changing chunking, model size, or vector search.",
				whyNot:
					"A changes chunking without evidence that chunk size caused the gap. C upgrades the model before correcting its documented query mode. D changes search precision, not how query vectors are prepared.",
				source: practiceSource,
			},
			{
				id: "PDF-3.6",
				domain: "D2",
				question:
					"Each July, six disclosure statements are reissued. Last year the team re-indexed in place over four hours, leaving a mixture of old and new chunks and no rollback after a parsing error. How should this year's update be carried out?",
				options: [
					"Append new chunks beside old ones and let the model choose the most recent version.",
					"Re-index in place overnight and fix parsing errors the next morning.",
					"Take the copilot offline for the update and display a maintenance notice.",
					"Build a new index beside the old one, test it, switch atomically, and keep the old index for rollback.",
				],
				correctAnswers: [3],
				explanation:
					"Treat an index like a release. Building and testing a separate version prevents mixed state, an atomic switch makes activation clear, and retaining the previous index makes rollback straightforward.",
				whyNot:
					"A leaves superseded fees retrievable. B reduces the audience for mixed results but offers no rollback. C removes service and still provides no recovery path after a bad build.",
				source: practiceSource,
			},
			{
				id: "PDF-3.7",
				domain: "D3",
				question:
					"The product owner wants to know which member questions the knowledge base cannot answer. Retrieval produces a relevance score, and the copilot declines when nothing relevant is found, but neither result is recorded. What instrumentation provides this information?",
				options: [
					"Log top retrieval scores and declines per query, then group low-scoring queries by topic.",
					"Record total conversations each day.",
					"Ask members to rate every answer and read comments on low ratings.",
					"Count tokens used per answer, because short answers suggest missing content.",
				],
				correctAnswers: [0],
				explanation:
					"Low retrieval scores and declines are direct signals of a content gap. Structured telemetry and topic grouping turn scattered failures into a ranked list of missing content.",
				whyNot:
					"B measures volume, not topic coverage. C is a small self-selected sample that mixes content gaps with other dissatisfaction. D confuses brevity with missing knowledge.",
				source: practiceSource,
			},
			{
				id: "PDF-3.8",
				domain: "D4",
				question:
					"Two weeks after the July reissue, a member is told that the administration fee is $78 although the new statement says $84. The index contains only the new statement, and a test replay returns $84. The production trace shows no retrieval or model call and a response time of 40 milliseconds. Where does the fault lie?",
				options: [
					"In a harness answer cache that was not cleared when documents changed.",
					"In the member's phrasing, which matched last year's wording.",
					"In the retrieval system, which must still hold old chunks.",
					"In the model, which memorized the old fee.",
				],
				correctAnswers: [0],
				explanation:
					"A 40-millisecond response with no retrieval or model span indicates a cache hit. Tie cache validity to the document version and clear or invalidate entries as part of the index switch.",
				whyNot:
					"B cannot explain an answer produced without retrieval or generation. C is contradicted by the index contents and missing retrieval span. D is contradicted by the missing model call.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Saltbush Software builds mobile banking apps for 46 credit unions. Each client has a repository forked from a shared template, and 80 engineers maintain them. The platform team runs Claude Code headlessly in CI to apply cross-repository changes and draft release notes. Clients are regulated institutions, so changes need traceable authors and reviewers, and model traffic must use the approved provider and region.",
		[
			{
				id: "PDF-4.1",
				domain: "D8",
				question:
					"A trial replaced a deprecated analytics SDK in all 46 repositories at once. Thirty-one pull requests were clean, nine broke builds because clients customized the wrapper, and six changed unrelated files. Reviewers spent two days sorting through the batch. How should the next fleet-wide change be rolled out?",
				options: [
					"Run all repositories again with a longer prompt listing every known customization.",
					"Run them all again and auto-merge whenever the build passes.",
					"Start with representative repositories, refine the prompt and checks, then proceed in waves.",
					"Abandon the fleet for cross-repository changes and make every client team do the work manually.",
				],
				correctAnswers: [2],
				explanation:
					"A fleet change is a deployment and benefits from a canary. A small first wave that includes customized repositories exposes failure modes cheaply, while later waves bound blast radius and review load.",
				whyNot:
					"A still exposes every repository to an untested prompt. B removes human review even though passing builds missed out-of-scope changes. D gives up the benefit where the approach worked.",
				source: practiceSource,
			},
			{
				id: "PDF-4.2",
				domain: "D8",
				question:
					"An auditor asks who wrote a change to the login flow. The commit is attributed to a platform engineer because CI uses her personal access token, although she did not write or review it. The audit log cannot distinguish agent-authored commits from human ones. What should the platform team change?",
				options: [
					"Squash every fleet pull request into one commit.",
					"Rotate the engineer's personal access token every month and record each rotation.",
					"Use a dedicated bot identity, label agent-authored commits and runs, and require a human reviewer.",
					"Ask the engineer to comment on each pull request that an agent wrote it.",
				],
				correctAnswers: [2],
				explanation:
					"Traceability needs an honest author. A dedicated machine identity and metadata linking the commit to its agent run separate agent work from human work, while a human reviewer remains accountable for approval.",
				whyNot:
					"A shortens history but keeps the wrong author. B improves credential hygiene without correcting attribution. D is a manual note and leaves commit history misleading.",
				source: practiceSource,
			},
			{
				id: "PDF-4.3",
				domain: "D8",
				question:
					"An internal review finds engineers using a different provider and unapproved models for client code. Policy requires all model traffic to use the approved provider and region, with approved models only. Repository settings state the policy, but engineers can override them locally. Which two controls enforce the policy? (Choose two.)",
				options: [
					"Add the policy to each repository's `CLAUDE.md` so the agent reminds engineers.",
					"Deploy managed provider and region settings, backed by controls outside user-overridable settings where required.",
					"Review engineers' shell history each month for unapproved environment variables.",
					"Email the policy quarterly and ask engineers to acknowledge it.",
					"Restrict selectable models to the approved list in the managed policy.",
				],
				correctAnswers: [1, 4],
				selectCount: 2,
				explanation:
					"Managed settings can constrain supported client configuration, but they do not replace provider, region, identity, or network controls that must resist user override. Restrict model selection in policy and enforce endpoint requirements outside settings where necessary.",
				whyNot:
					"A is guidance, not enforcement. C is intrusive, late, and easy to miss. D informs people without preventing an unapproved endpoint or model.",
				source: practiceSource,
			},
			{
				id: "PDF-4.4",
				domain: "D8",
				question:
					"The fleet drafts release notes from the diff between two tags. Some notes announced features still behind disabled flags, while others described fixes reverted before release. The agent inferred user-facing changes from code and commit messages. Which redesign makes the notes more trustworthy?",
				options: [
					"Stop generating notes and write every note by hand.",
					"Have a second agent rewrite notes in a more cautious tone.",
					"Give the agent the full file for every changed line.",
					"Ground notes in merged pull-request records and flag states, then check every item against those records.",
				],
				correctAnswers: [3],
				explanation:
					"Release notes need grounded inputs. Records of what merged, what was reverted, and which flags are active provide the source of truth; a check confirms each generated item maps to a record.",
				whyNot:
					"A gives up useful automation. B changes tone but does not verify claims. C adds more code to infer from when the required release facts are in structured records.",
				source: practiceSource,
			},
			{
				id: "PDF-4.5",
				domain: "D8",
				question:
					"The fleet opens about 400 dependency pull requests per month, and reviewers now approve many without reading. A major networking-library update broke certificate pinning, while patch updates to development tools make up 70% of volume and have not caused incidents. How should the responder change?",
				options: [
					"Auto-merge only explicitly eligible low-risk changes after required CI and security checks, with rollback; route major or sensitive updates to review.",
					"Have the agent write a longer description on every pull request.",
					"Require two reviewers on every dependency pull request.",
					"Stop automated updates and schedule manual dependency reviews twice a year.",
				],
				correctAnswers: [0],
				explanation:
					"Risk-based automation can reduce routine review load, but eligibility depends on package sensitivity and passing CI and security gates, not patch version alone. Keep a rollback path and send higher-risk changes to human review.",
				whyNot:
					"B adds reading to an already overloaded process. C doubles the load that is causing fatigue. D leaves known vulnerabilities unpatched for months.",
				source: practiceSource,
			},
			{
				id: "PDF-4.6",
				domain: "D8",
				question:
					"Twelve of 46 repositories account for 80% of failed agent runs. In those repositories the agent spends many turns guessing build and test commands, and sometimes reports success without running tests. The other repositories have `CLAUDE.md` files with verified commands and directory layouts; these twelve do not. What is the most effective response?",
				options: [
					"Require verified build, test, and lint instructions before a repository joins the fleet.",
					"Use a larger model for the twelve repositories.",
					"Exclude the twelve repositories from the fleet permanently.",
					"Raise the turn limit so the agent has more time to discover build commands.",
				],
				correctAnswers: [0],
				explanation:
					"The cohort data points to missing project knowledge, not a weak agent. Verified project instructions give each run the correct commands and conventions up front and make fleet onboarding consistent.",
				whyNot:
					"B spends more per run without supplying the missing information. C abandons a fixable cohort. D pays for rediscovery and still permits incorrect guesses.",
				source: practiceSource,
			},
			{
				id: "PDF-4.7",
				domain: "D8",
				question:
					"A fleet run creates 46 pull requests for the same mechanical rename. Policy requires one human reviewer per pull request, and reviewers admit they stop reading after the fifth. One prompt and script generated the changes. Which review approach gives the best assurance for the effort while respecting the current policy?",
				options: [
					"Approve all pull requests without review because the change is mechanical.",
					"Review the shared prompt and script, retain the required human review on every pull request, and use samples and outlier checks as additional assurance; seek policy approval before replacing the per-pull-request gate.",
					"Ask the agent to review and approve its own pull requests.",
					"Keep one full review per pull request and add a second reviewer to each.",
				],
				correctAnswers: [1],
				explanation:
					"Review the shared transformation and use sampling to find variations, but sampling cannot replace the stated per-pull-request human review without policy approval. Until that rule changes, every pull request needs its required independent reviewer.",
				whyNot:
					"A removes the required gate. C lets the author approve its own work. D doubles a review process already affected by fatigue without adding focused checks of the common transformation.",
				source: practiceSource,
			},
			{
				id: "PDF-4.8",
				domain: "D7",
				question:
					"The fleet's CI job runs Claude Code, tests changes, and pushes a branch. The job also holds an app-signing key and store publishing token copied from the release pipeline. The agent reads issue text and third-party package files while it works. What is the most important change?",
				options: [
					"Limit the agent to ten turns so it has less opportunity to misuse secrets.",
					"Tell the agent never to print or use environment variables.",
					"Mask secrets in CI log output.",
					"Run the agent in a job with no release secrets, and sign and publish in a separate job.",
				],
				correctAnswers: [3],
				explanation:
					"An agent that reads untrusted text should hold only credentials its task needs. Separating the agent job from the release job means injected instructions cannot access signing or publishing credentials that are not present.",
				whyNot:
					"A shortens exposure without removing it. B relies on agent compliance while leaving keys available. C hides secrets from logs but not from a process that can read its environment.",
				source: practiceSource,
			},
			{
				id: "PDF-4.9",
				domain: "D7",
				question:
					"During a refactoring run, the agent edited certificate-pinning configuration and a CI workflow because both contained an identifier it was renaming. Tests passed and the pull request was merged. The team wants a guarantee that fleet runs cannot modify authentication code, cryptographic configuration, or CI workflows. Which control provides this guarantee?",
				options: [
					"Ask reviewers to look carefully for sensitive-file changes in each pull request.",
					"Enforce denials across every mutation path, including shell commands, and use branch protection to require Code Owner approval for protected paths.",
					"State in every prompt that security-sensitive files must not change.",
					"Run a nightly job that reverts changes to those files.",
				],
				correctAnswers: [1],
				explanation:
					"A pre-tool hook can block covered edits, but it does not guarantee safety if shell commands or another mutation path bypass it. Enforce policy across all write paths and use branch protection to require Code Owner review for sensitive paths before merge.",
				whyNot:
					"A depends on attention that already failed. C is guidance with no enforcement. D acts after changes may have merged or shipped.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Tallowwood Home is an online furniture retailer with 400,000 products. Each night it regenerates up to 30,000 descriptions in five languages from supplier specifications. Its shopping copilot handles about two million questions per month, 60% about 500 best sellers. Description requests send a 4,000-token style guide and a 1,500-token product specification. Finance wants a 40% spend reduction without a visible quality drop.",
		[
			{
				id: "PDF-5.1",
				domain: "D6",
				question:
					"The nightly job sends a style guide followed by each product specification, with one cache breakpoint after the specification. Usage shows frequent cache writes and few reads because specifications differ. The shopping copilot uses the same layout before a customer question. Which caching layout is most cost-effective across both workloads?",
				options: [
					"Remove caching from both workloads because the write premium provides no benefit.",
					"Keep the single breakpoint and switch to the one-hour cache duration.",
					"Add a breakpoint after the shared style guide, and cache specifications only for frequently requested best sellers.",
					"Move each product specification ahead of the style guide.",
				],
				correctAnswers: [2],
				explanation:
					"A prefix cache benefits from stable content first and its own breakpoint. The style guide is shared by every request, while a specification is worth caching only where it is reused often, such as best sellers.",
				whyNot:
					"A gives up savings on a shared prefix. B pays a larger write premium for unique entries. D puts varying content first, preventing later content from being shared.",
				source: practiceSource,
			},
			{
				id: "PDF-5.2",
				domain: "D6",
				question:
					"Only about 2,000 of 30,000 product specifications change from one night to the next. The job regenerates descriptions from identical inputs for the other products, and merchandisers see needless wording changes. What is the best first optimization?",
				options: [
					"Hash every output-affecting input, including the specification, prompt or style guide, model, and relevant configuration; regenerate only when the hash changes.",
					"Move the job to a smaller model to lower the cost of all 30,000 requests.",
					"Run the job weekly so the cost is incurred once every seven days.",
					"Set temperature to zero so unchanged inputs always produce identical output.",
				],
				correctAnswers: [0],
				explanation:
					"Avoid requests when their effective inputs have not changed. The cache key must include every input that can affect output, not only the product specification, so prompt, model, and relevant configuration changes trigger regeneration too.",
				whyNot:
					"B lowers the unit cost of work that mostly should not run. C delays updates for changed products. D still pays for every request and does not guarantee identical results.",
				source: practiceSource,
			},
			{
				id: "PDF-5.3",
				domain: "D6",
				question:
					"A new product description must be ready in five languages. The pipeline writes English first, then translates into four languages sequentially; each call takes about six seconds, so the page takes 30 seconds. Each translation depends only on the English text. Which change gives the largest reduction in elapsed time?",
				options: [
					"Run the four translations concurrently after the English text exists, when capacity is available.",
					"Shorten the style guide to reduce input tokens.",
					"Ask for all five languages in one response.",
					"Send translations through Message Batches to reduce price.",
				],
				correctAnswers: [0],
				explanation:
					"Independent translations can run in parallel and reduce elapsed time when the service has capacity. The estimate is approximate: it depends on comparable call times and available concurrency, and parallelism does not guarantee a lower token cost.",
				whyNot:
					"B trims input while generation dominates. C still generates a long response and may not reduce elapsed time. D can take hours, which does not fit a publishing workflow waiting on the result.",
				source: practiceSource,
			},
			{
				id: "PDF-5.4",
				domain: "D2",
				question:
					"Descriptions are requested as JSON with title, summary, bullets, and dimensions. About 1.5% fail to parse: some include trailing text and some stop mid-string. The job catches parse errors and stores an empty description, creating blank product pages. Which change most reliably prevents blank pages?",
				options: [
					"Add `Return only valid JSON` in capital letters at the end of the prompt.",
					"Lower the output limit so responses are shorter.",
					"Use schema-constrained output, inspect the stop reason, retry incomplete responses, and preserve the last valid description.",
					"Repair malformed responses with a regular expression that closes open brackets.",
				],
				correctAnswers: [2],
				explanation:
					"Structured output can constrain response shape, but it can still refuse or truncate. Inspect the stop reason, handle refusals separately, retry incomplete output, and keep the last valid stored description until a replacement is complete.",
				whyNot:
					"A cannot guarantee structure or prevent truncation. B can make truncation more frequent. D may produce parseable output that contains a half-finished field.",
				source: practiceSource,
			},
			{
				id: "PDF-5.5",
				domain: "D2",
				question:
					"A supplier sheet lists a dining table's width as 180 cm in a summary table and 160 cm in detailed notes. The generated description says 180 cm, and a customer returns the table because it does not fit. How should the pipeline handle contradictory specifications?",
				options: [
					"Use validated conflict detection; fail closed and hold the product for review when a conflict is found.",
					"Use the first value that appears in the sheet.",
					"Publish both values and let customers decide.",
					"Ask the model to choose the more plausible value for the product type.",
				],
				correctAnswers: [0],
				explanation:
					"Conflicting source data is a data-quality problem, not an invitation to guess. Use a validated conflict check and fail closed until someone confirms the measurement; an LLM-generated flag alone is not a reliable control.",
				whyNot:
					"B is arbitrary and can be wrong. C passes the supplier's error to the customer. D publishes a model guess about a physical measurement customers rely on.",
				source: practiceSource,
			},
			{
				id: "PDF-5.6",
				domain: "D1",
				question:
					"An architect proposes replacing a single shopping agent with an orchestrator and four specialists. The current agent succeeds on 94.0% of tasks, while one prototype result for the multi-agent design is 94.5%, with 3.4 times the tokens and 1.8 times the latency. What does this evidence support?",
				options: [
					"Adopt the multi-agent design for half of traffic permanently.",
					"Evidence is insufficient to establish a gain; repeat paired evaluations and quantify uncertainty before deciding whether the extra cost is justified.",
					"Keep the single agent but split its tools into many narrower tools.",
					"Adopt the multi-agent design because specialists are more scalable.",
				],
				correctAnswers: [1],
				explanation:
					"A single 94.0% versus 94.5% result does not show whether the difference is noise or a real improvement. Use repeated paired evaluations and confidence intervals; until then, evidence is insufficient to justify a design with substantially higher cost and latency.",
				whyNot:
					"A doubles systems to maintain without established benefit. C increases tool-selection complexity without evidence of need. D relies on a general belief rather than comparative evidence.",
				source: practiceSource,
			},
			{
				id: "PDF-5.7",
				domain: "D3",
				question:
					"Monthly spend rose 30% while conversation volume stayed flat. Average input tokens per request rose only 4%. An engineer suspects a small share of conversations is unusually costly because users paste long order histories or sessions run for many turns. Which measurement would test this?",
				options: [
					"Total requests per day.",
					"The 95th and 99th percentiles of input tokens per conversation.",
					"The cache hit rate for the style guide prefix.",
					"Average output tokens per request.",
				],
				correctAnswers: [1],
				explanation:
					"Averages hide heavy tails. Percentiles of input tokens per conversation show whether a small number of long sessions drive cost and can point to controls such as context editing or pasted-input limits.",
				whyNot:
					"A is already flat and says nothing about conversation size. C tests a different caching hypothesis. D is an average on the output side, while the suspected growth is in input tokens.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Quokka Learning sells a writing-feedback copilot used by 900 schools. Students submit essays and receive a rubric score from 1 to 6 with comments. A reference set of 2,000 essays has scores from two experienced teachers. An LLM judge rates comment helpfulness. Schools require scores consistent with teacher judgment, and each release must be at least as good as the last.",
		[
			{
				id: "PDF-6.1",
				domain: "D5",
				question:
					"The copilot matches the first teacher's score exactly on 58% of essays, while the two teachers match exactly on 61%. Most differences are one point, but 4% differ by three or more points. Which evaluation approach gives the most meaningful answer?",
				options: [
					"Ask an LLM judge whether each score seems fair.",
					"Compare the average score from the copilot and teachers.",
					"Use exact-match accuracy alone and set a 90% release target.",
					"Use the same weighted agreement statistic for copilot-teacher and teacher-teacher pairs, and treat human agreement as a benchmark rather than a hard ceiling.",
				],
				correctAnswers: [3],
				explanation:
					"An ordered scale needs a metric that distinguishes a one-point gap from a three-point gap, such as quadratic weighted kappa. Compare the copilot-teacher value with the same statistic for teacher pairs; human agreement is a useful benchmark, not a mathematical ceiling.",
				whyNot:
					"A replaces human reference scores with an unvalidated opinion. B can hide poor individual scores behind matching averages. C sets a target above observed exact agreement without considering distance between scores.",
				source: practiceSource,
			},
			{
				id: "PDF-6.2",
				domain: "D5",
				question:
					"An LLM judge rates comment helpfulness from 1 to 5, has never rated below 3, and averages 4.4. A teacher reviewed 30 comments the judge rated 5 and found about a third too vague to act on. Which two checks would establish whether the judge can be trusted? (Choose two.)",
				options: [
					"Tell the judge to be strict and observe whether its average falls.",
					"Give the judge deliberately poor comments and confirm that it rates them low.",
					"Replace the 1–5 scale with a 1–10 scale.",
					"Have teachers rate a sample and measure the judge's agreement with them.",
					"Run the judge twice on every comment and average its ratings.",
				],
				correctAnswers: [1, 3],
				selectCount: 2,
				explanation:
					"Validate a judge like any other measuring instrument. Planted poor examples test whether it distinguishes weak from strong work, and agreement with human raters calibrates it against the judgment it is meant to represent.",
				whyNot:
					"A shows the score can be moved, not that it tracks quality. C adds granularity before validating the measure. E can reduce noise while leaving a systematically generous judge unchanged.",
				source: practiceSource,
			},
			{
				id: "PDF-6.3",
				domain: "D5",
				question:
					"A prompt change raises an agreement statistic from 0.71 to 0.73 on 500 essays. The unchanged prompt scores 0.70, 0.72, and 0.73 on three additional runs. What should the team conclude?",
				options: [
					"The change is an improvement because 0.73 is the highest value observed.",
					"The difference may be within run-to-run variation; repeat both prompts and compare paired essay-level results.",
					"The evaluation set is unreliable and should be discarded.",
					"The change is an improvement only if an LLM judge also prefers the new comments.",
				],
				correctAnswers: [1],
				explanation:
					"Evaluation scores have noise, and a difference smaller than that noise is not evidence of improvement. Repeat both versions and use paired comparisons on the same essays to estimate the difference and its uncertainty.",
				whyNot:
					"A ignores that the old prompt reached the same score. C overreacts; the evaluation can be useful when its variability is measured. D introduces a different measure for a different outcome.",
				source: practiceSource,
			},
			{
				id: "PDF-6.4",
				domain: "D5",
				question:
					"The team wants to A/B test a feedback style and measure whether students revise essays more. Students are assigned at random, but they compare feedback and teachers discuss comments with the whole class. How should the experiment be designed?",
				options: [
					"Keep student-level assignment and ask teachers not to discuss feedback.",
					"Randomize by class or school, and analyze results at that cluster level.",
					"Release the new style to all schools and compare with last term.",
					"Give every student both styles on alternate essays.",
				],
				correctAnswers: [1],
				explanation:
					"When participants influence each other, randomize at a level that contains the interference. Assigning whole classes or schools keeps conditions separate, and the analysis must account for clustering.",
				whyNot:
					"A depends on behavior the team cannot control. C confounds the change with term, topics, and time of year. D lets each style influence responses to the other within one student.",
				source: practiceSource,
			},
			{
				id: "PDF-6.5",
				domain: "D5",
				question:
					"A student submits the same essay twice and receives a 4, then a 5. The reference set scores each essay only once per release, but teachers say inconsistent scores undermine trust. Which measurement should be added to release criteria?",
				options: [
					"Check that average scores across schools are stable week to week.",
					"Measure exact-match rate against the second teacher as well as the first.",
					"Measure how often the same essay receives the same score across repeated runs.",
					"Measure the proportion of responses without rubric terms.",
				],
				correctAnswers: [2],
				explanation:
					"Reliability is distinct from accuracy. Repeatedly scoring the same essays and measuring agreement with itself quantifies the inconsistency students and teachers experience.",
				whyNot:
					"A can be stable while individual essays receive changing scores. B measures agreement with a person, not self-consistency. D measures comment content rather than score repeatability.",
				source: practiceSource,
			},
			{
				id: "PDF-6.6",
				domain: "D5",
				question:
					"A full evaluation of 2,000 essays takes three hours and runs before each fortnightly release. Engineers merge about 40 prompt and code changes between evaluations, and the last two releases failed the full run, leading to days of investigation. Which process addresses this?",
				options: [
					"Run a small, fast, representative subset on each change and keep the full set as a release gate.",
					"Run the full evaluation monthly and release only after each run.",
					"Keep the fortnightly run and ask engineers to test a few essays by hand.",
					"Run the full three-hour evaluation on every commit and block merging until it finishes.",
				],
				correctAnswers: [0],
				explanation:
					"A tiered evaluation catches regressions close to the change that caused them. A fast representative subset runs frequently, while the full suite remains a release gate.",
				whyNot:
					"A monthly run widens the window for unseen regressions. C is unstructured and can miss them. D slows every change by hours and is likely to be bypassed under pressure.",
				source: practiceSource,
			},
			{
				id: "PDF-6.7",
				domain: "D6",
				question:
					"Judging every production comment costs more than generating comments. The judge uses the largest model on all traffic and has validated agreement of 0.82 with teachers. The team needs a reliable quality signal and early warning of regressions at lower cost. Which approach best meets the goal?",
				options: [
					"Keep judging all traffic but shorten the rubric.",
					"Keep judging all traffic and shorten copilot comments to offset the cost.",
					"Judge a random sample, and test whether a smaller judge agrees with teachers closely enough.",
					"Stop production judging and rely only on offline evaluation.",
				],
				correctAnswers: [2],
				explanation:
					"A statistically adequate sample can provide monitoring at a fraction of census cost. A smaller judge is suitable only if its agreement with human ratings is validated against the current judge and the required quality threshold.",
				whyNot:
					"A may weaken validity for modest savings. B degrades the product to pay for measurement. D loses the early warning of regressions in live traffic.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Lyrebird Media is a news organization with 300 journalists. Its research copilot searches the web and publisher archive, summarizes uploaded documents, and drafts email. Uploads can contain leaked documents and confidential source names. The copilot uses several MCP servers, including a third-party transcription service, and can send email and write to shared folders.",
		[
			{
				id: "PDF-7.1",
				domain: "D7",
				question:
					"A journalist uploads an interview recording with a confidential source. Publisher policy forbids confidential material from leaving publisher-controlled systems, but the copilot sends all recordings to a third-party transcription service. An in-house service exists, and each upload has a sensitivity label selected by the journalist. Which design enforces policy?",
				options: [
					"Tell the copilot to think carefully before sending sensitive audio to a third party.",
					"Remove transcription from the copilot entirely.",
					"Ask the third-party provider to sign a confidentiality agreement.",
					"Treat journalist-selected labels as untrusted, use the in-house service by default, and permit third-party transcription only when publisher-controlled classification confirms the recording is non-confidential.",
				],
				correctAnswers: [3],
				explanation:
					"An uploader-selected label does not prove the recording's content or sensitivity. Enforce classification and routing outside the model: use the publisher-controlled service by default, and allow third-party processing only after a trusted publisher-controlled classification confirms the recording is non-confidential.",
				whyNot:
					"A leaves a policy decision to model judgment. B removes a useful capability for non-confidential recordings. C still sends confidential material outside publisher-controlled systems.",
				source: practiceSource,
			},
			{
				id: "PDF-7.2",
				domain: "D7",
				question:
					"A third-party transcription server changes its tool description to instruct the assistant to include recent user messages in a context parameter. The copilot follows the instruction for six days. The harness loads tool definitions from each server at session start and passes them to the model unchanged. Which control would prevent this?",
				options: [
					"Encrypt the connection to the transcription server with mutual TLS.",
					"Ask journalists to report transcription that seems unusually accurate.",
					"Limit the transcription tool to one call per conversation.",
					"Pin reviewed tool definitions and block or review a server when its definitions change.",
				],
				correctAnswers: [3],
				explanation:
					"Tool descriptions are instructions the model reads. Treat definitions like dependencies: review and pin them, then compare them at load time so an unreviewed change cannot silently steer the agent.",
				whyNot:
					"A protects the channel, but the harmful instruction comes from the legitimate endpoint. B expects users to detect an attack without a visible symptom. C slows a leak without preventing it.",
				source: practiceSource,
			},
			{
				id: "PDF-7.3",
				domain: "D7",
				question:
					"A web page with hidden instructions causes the copilot to email an uploaded document summary, including a source's name, to an outside address. The email tool accepts any recipient, and the publisher keeps a registry of confidential source names. Which two controls most directly reduce this risk? (Choose two.)",
				options: [
					"Enforce a recipient allowlist in the email tool and require journalist confirmation for other addresses.",
					"Switch to a larger model that follows its system prompt more reliably.",
					"Scan outgoing email against the source registry in code and block matches.",
					"Display a banner that web content may be unreliable.",
					"Tell the copilot to disregard instructions found on web pages.",
				],
				correctAnswers: [0, 2],
				selectCount: 2,
				explanation:
					"Assume an injection can sometimes succeed and limit its impact. Enforce both the destination and outgoing content in code, outside the model, so the controls still apply if the model is misled.",
				whyNot:
					"B may reduce attack success but removes neither path nor payload. D informs the user about a risk that can operate without their involvement. E is the defense prompt injection is designed to defeat.",
				source: practiceSource,
			},
			{
				id: "PDF-7.4",
				domain: "D7",
				question:
					"The security team wants to detect confidential material in emails, shared folders, or requests to third-party servers. Reviewing all outputs is impractical, and distributing real source names for matching would create risk. Which technique helps detect tested leak paths?",
				options: [
					"Count the number of emails each journalist sends through the copilot.",
					"Ask the copilot whether it disclosed anything confidential.",
					"Place unique marker strings in test documents and alert when a marker appears outbound, while testing each relevant exit path.",
					"Disable outbound-content logging so confidential text is never stored in logs.",
				],
				correctAnswers: [2],
				explanation:
					"Canary markers can reveal whether tested paths leak controlled test data without spreading real source names. They provide evidence about the paths exercised, not proof that every possible exfiltration path is covered.",
				whyNot:
					"A measures activity, not content. B relies on the component under test to report its own behavior. D removes evidence needed for detection rather than testing egress safely.",
				source: practiceSource,
			},
			{
				id: "PDF-7.5",
				domain: "D7",
				question:
					"The main agent can send email and write to shared folders while reading untrusted web pages. A security exercise succeeded because web text entered the same context that could call those tools. The team wants an architectural change, not another prompt instruction. Which architecture best limits the risk?",
				options: [
					"Strip HTML tags from web pages before the main agent reads them.",
					"Give the main agent a longer prompt listing known injection phrases.",
					"Use a separate tool-less reader to summarize web pages, then enforce downstream authorization and data-flow checks on its untrusted summary.",
					"Have the main agent read each page twice and compare summaries.",
				],
				correctAnswers: [2],
				explanation:
					"Separate the component that reads untrusted content from the component that can act. A tool-less reader limits direct capability, but its summary remains untrusted; downstream authorization and data-flow checks must still govern privileged actions.",
				whyNot:
					"A removes markup but leaves ordinary-text instructions. B cannot enumerate new attacks. D exposes the privileged context to the same hostile content twice.",
				source: practiceSource,
			},
			{
				id: "PDF-7.6",
				domain: "D5",
				question:
					"A suite has 400 injection cases. Before each release, it runs every case once and reports no successful injections. A journalist later reproduces an attack with a case in the suite; the case succeeds three times in 20 runs. How should the security evaluation change?",
				options: [
					"Run each case many times, report attack success rates, and set a release threshold.",
					"Remove the case because its result is unreliable.",
					"Set temperature to zero for the security run, even if production differs.",
					"Run each case once and add 400 more cases.",
				],
				correctAnswers: [0],
				explanation:
					"Model behavior is probabilistic, so one clean run says little about a rare failure. Repeated trials estimate per-case and overall attack success rates that can be tracked against release thresholds.",
				whyNot:
					"B discards a real finding because it is inconvenient to measure. C tests a configuration unlike production. D increases coverage while keeping the method that missed a repeatable failure.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Coolabah Agritech provides farm advice to 14,000 grain and cotton growers using soil sensors, weather forecasts, and agronomy guides. Many users have poor mobile reception, spring demand is eight times winter demand, and outcomes may not be known until harvest months later. The system currently records only basic request logs.",
		[
			{
				id: "PDF-8.1",
				domain: "D3",
				question:
					"The only true outcome measure, crop yield, arrives four to six months after advice and also depends on weather. The team needs to detect a quality regression within days of a release. Which monitoring approach is most appropriate?",
				options: [
					"Track the number of questions asked per grower as the quality measure.",
					"Track leading indicators such as groundedness, rephrased questions, and agronomist review of a sample.",
					"Wait for harvest and compare growers who used the copilot with those who did not.",
					"Require every grower to rate every answer before asking another question.",
				],
				correctAnswers: [1],
				explanation:
					"When ground truth is delayed, monitor proxies available now that plausibly move with quality: automated groundedness checks, immediate rephrasing, and expert review of a sample. Later harvest outcomes can help validate the proxies.",
				whyNot:
					"A rises with engagement and confusion alike. C arrives months late and is confounded by weather and user selection. D obstructs growers and produces low-quality ratings.",
				source: practiceSource,
			},
			{
				id: "PDF-8.2",
				domain: "D3",
				question:
					"Alerts fire every day in spring when request volume is high, so the on-call engineer muted them. In winter, a weather-tool outage produced only 12 errors an hour and went unnoticed for two days. The current alerts use absolute request and error thresholds. How should they change?",
				options: [
					"Keep thresholds and add a second on-call engineer in spring.",
					"Raise both thresholds to ten times their current value.",
					"Send every individual error to the team chat.",
					"Alert on error rates relative to a seasonal baseline.",
				],
				correctAnswers: [3],
				explanation:
					"Absolute counts scale with traffic, so they can be noisy in peak season and blind in the off season. Rates compared with seasonal baselines describe health more independently of volume.",
				whyNot:
					"A staffs the noise but leaves the alert insensitive in winter. B silences spring and makes winter outages harder to detect. C buries the signal during the busiest period.",
				source: practiceSource,
			},
			{
				id: "PDF-8.3",
				domain: "D3",
				question:
					"Full tracing of every conversation is too expensive. A uniform 2% sample rarely captures failures for cotton growers, who are 6% of users, and failed conversations, which are 1% of traffic. Last season's worst bug affected cotton irrigation advice. Which sampling strategy fits the constraints?",
				options: [
					"Trace only the first 1,000 conversations each day.",
					"Retain errors and unusual conversations, sample segments at different rates, and cap or redact captured payloads for privacy and cost.",
					"Keep the uniform 2% sample and wait for enough cotton failures to accumulate.",
					"Trace all conversations during business hours and none overnight.",
				],
				correctAnswers: [1],
				explanation:
					"Sampling should favor rare and informative cases. Retaining errors and anomalies and increasing rates for small segments improves visibility while keeping costs bounded; payload limits and redaction reduce privacy exposure and storage cost.",
				whyNot:
					"A over-represents early users and misses later events. C leaves rare, high-impact cases unseen. D spends the budget by time rather than by failure risk.",
				source: practiceSource,
			},
			{
				id: "PDF-8.4",
				domain: "D3",
				question:
					"An engineer proposes adding growers' GPS coordinates and farm names to every trace. Locations combined with yields and input use are commercially sensitive, and the observability platform is accessible to staff and a vendor. The team only needs to identify regional problems. What should it record?",
				options: [
					"Exact coordinates encoded in Base64.",
					"No location data, to avoid the privacy question.",
					"Exact coordinates and farm name with a staff-handbook warning.",
					"A coarse region code and pseudonymous grower identifier, with the mapping protected separately and retention limited.",
				],
				correctAnswers: [3],
				explanation:
					"Record only the precision needed for regional analysis. Pseudonymization is not anonymization: protect the mapping in a more restricted system, control access, and set retention limits for both traces and mappings.",
				whyNot:
					"A is reversible encoding, not protection. B prevents the team from locating regional issues. C spreads sensitive data and relies on a reminder rather than controls.",
				source: practiceSource,
			},
			{
				id: "PDF-8.5",
				domain: "D1",
				question:
					"The copilot's prompt contains 40 agronomy guides, about 90,000 tokens, although a typical question concerns one crop and topic. Responses are slow on poor connections, and cotton guidance sometimes appears in wheat answers. The guides are stable documents with clear scope. Which design is the best fit?",
				options: [
					"Keep all guides in the prompt and tell the model to use only the relevant one.",
					"Create 40 subagents and consult every one for each question.",
					"Summarize all guides into one short overview for the system prompt.",
					"Package each guide as an Anthropic Skill in a Skills-capable runtime, or use equivalent progressive retrieval where Skills are unavailable.",
				],
				correctAnswers: [3],
				explanation:
					"Progressive disclosure keeps short descriptions in context and loads relevant material on demand, reducing tokens and unrelated guidance. Anthropic Skills require a Skills-capable runtime; other environments need an equivalent retrieval mechanism rather than assuming provider-neutral Skill support.",
				whyNot:
					"A retains cost, latency, and competing guidance. B multiplies work when one guide is needed. C may remove detailed thresholds and rates required for useful advice.",
				source: practiceSource,
			},
			{
				id: "PDF-8.6",
				domain: "D4",
				question:
					"A grower says the copilot advised irrigation before heavy rain. An engineer asks the same question an hour later and receives different advice. The request log has the question and answer but not tool results; weather and soil readings may have changed. What capability is needed to diagnose the report?",
				options: [
					"Record and redact relevant inputs and tool results, record model and tool versions, then replay the captured interaction for investigation.",
					"Lower temperature so the same question always produces the same answer.",
					"Hold a weekly meeting to discuss complaints.",
					"Add a prompt reminder to check the forecast.",
				],
				correctAnswers: [0],
				explanation:
					"Behavior depends on the inputs and tool results available at that time. A replay can restore captured inputs and results for investigation, but it cannot guarantee identical model output; redact traces and record relevant versions.",
				whyNot:
					"B does not recreate inputs that changed. C lacks diagnostic evidence. D assumes a cause before the trace establishes one.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Jacaranda Recruitment places 40,000 candidates a year. Its screening assistant compares applications with role requirements and recommends shortlist or decline, while a recruiter makes the final decision. Over three weeks the shortlist rate fell from 34% to 21% without an announced change. The prompt is owned by operations, and client employers update role requirements in a database.",
		[
			{
				id: "PDF-9.1",
				domain: "D4",
				question:
					"The team must determine whether the falling shortlist rate reflects a changed applicant pool, changed role requirements, or changed assistant behavior. Logs retain inputs and outputs, and prompt and model versions are recorded. Which first step best separates these explanations?",
				options: [
					"Use a fixed historical application cohort with its role-requirement snapshots held constant, then repeat runs because recommendations are stochastic.",
					"Wait three weeks to see if the rate returns to normal.",
					"Ask recruiters whether candidates feel weaker.",
					"Rewrite the prompt to be more lenient and see if the rate recovers.",
				],
				correctAnswers: [0],
				explanation:
					"A fixed application cohort controls for incoming applicant changes, and fixed requirement snapshots control for employer edits. Repeat runs and compare distributions because model outputs are stochastic; this isolates system changes without confusing them with changed data.",
				whyNot:
					"B lets a possible fault keep affecting candidates. C gathers impressions shaped by the assistant's recommendations. D changes the system before the cause is known and can mask a data fault.",
				source: practiceSource,
			},
			{
				id: "PDF-9.2",
				domain: "D4",
				question:
					"Replay shows the same historical applications are now declined more often. The prompt is unchanged and the model version is pinned. The rate fell gradually over three weeks, while 300 employers edited role requirements record by record. What does this pattern most strongly suggest?",
				options: [
					"A harness deployment that would take effect on one release date.",
					"Random model variation that averages out over time.",
					"A provider model update that changes every request at the same time.",
					"Progressive changes to requirements data affecting more roles as records are edited.",
				],
				correctAnswers: [3],
				explanation:
					"The shape of an onset is evidence. Versioned components often change in steps, while record-by-record data edits can cause gradual drift. With prompt and model fixed, the runtime data is a strong hypothesis.",
				whyNot:
					"A would usually appear as a step and no release is recorded. B does not explain a sustained directional fall. C conflicts with the pinned version and gradual onset.",
				source: practiceSource,
			},
			{
				id: "PDF-9.3",
				domain: "D4",
				question:
					"Investigation finds a new `preferred qualifications` field being filled in role by role. The requirements tool returns every field without distinction, and the assistant treats preferred qualifications as mandatory. Roles with the new field have a 12% shortlist rate. Which fix addresses the cause and guards against recurrence?",
				options: [
					"Delete the new field from the database each night.",
					"Ask clients to stop using the field.",
					"Tell the assistant to be less strict about qualifications.",
					"Have the tool label mandatory and preferred requirements separately, and validate its schema.",
				],
				correctAnswers: [3],
				explanation:
					"The assistant reasoned over ambiguous input. Explicitly separating mandatory and preferred fields fixes the meaning, while schema validation catches unexpected changes before they silently affect recommendations.",
				whyNot:
					"A destroys client data. B removes a legitimate feature and relies on hundreds of outside parties. C loosens every requirement, including mandatory ones.",
				source: practiceSource,
			},
			{
				id: "PDF-9.4",
				domain: "D4",
				question:
					"After the fault is fixed, the team identifies about 2,400 applications assessed for roles with the new field. Recruiters followed many recommendations; some roles remain open and others are filled. What incident-response action is most appropriate beyond the fix?",
				options: [
					"Re-run all 40,000 applications from the past year, regardless of role.",
					"Identify affected applications from logs, reassess them, and refer changed outcomes to recruiters.",
					"Send every candidate from the last three weeks an apology email.",
					"Close the incident because the fix prevents further wrong recommendations.",
				],
				correctAnswers: [1],
				explanation:
					"Incident response includes remediation scoped by evidence. Logs identify the affected cohort, and reassessment determines which outcomes change so recruiters can act where a role remains open.",
				whyNot:
					"A extends work beyond the affected cohort. C contacts unaffected candidates and does not correct decisions. D leaves candidates who were wrongly declined without a remedy.",
				source: practiceSource,
			},
			{
				id: "PDF-9.5",
				domain: "D3",
				question:
					"The post-incident review finds that latency, error rate, and token usage stayed normal while the shortlist rate fell. No one monitored recommendations or input data, and a new database field was not announced. Which monitoring would have detected the incident earliest?",
				options: [
					"Tighten the alert threshold on 95th-percentile latency.",
					"Alert on recommendation distributions and input-data characteristics.",
					"Review ten random applications with a senior recruiter once a month.",
					"Count total applications processed each day.",
				],
				correctAnswers: [1],
				explanation:
					"An AI system can meet infrastructure targets while producing wrong outcomes. Output-distribution monitoring detects behavior changes, and input-schema monitoring can identify a new field on the day it appears.",
				whyNot:
					"A watches a signal that stayed normal. C is too small and infrequent to reveal gradual drift. D stayed flat because application volume was unaffected.",
				source: practiceSource,
			},
			{
				id: "PDF-9.6",
				domain: "D5",
				question:
					"A regulator asks whether recommendations depend on characteristics such as a candidate's name, age, or gender. Agreement with senior recruiters is high, but past human decisions may also contain bias. Which evaluation most directly tests the question?",
				options: [
					"Report agreement with senior recruiters as evidence of fairness.",
					"Ask the assistant to explain whether it considered protected characteristics.",
					"Test application pairs that differ only in a selected characteristic and count changed outcomes, limiting claims to the tested conditions.",
					"Remove names and assume the question is settled.",
				],
				correctAnswers: [2],
				explanation:
					"Counterfactual pairs can measure whether changing a tested attribute changes an outcome under the conditions examined. They provide targeted evidence, not a universal proof of fairness across attributes, populations, or contexts.",
				whyNot:
					"A can reproduce bias in historical decisions. B relies on self-report rather than behavior. D is a mitigation, not a measurement, and other features may still act as proxies.",
				source: practiceSource,
			},
		],
	),
	...withScenario(
		"Waratah Property manages 38,000 rental homes. Its tenancy agent handles maintenance requests, books tradespeople, and answers lease questions through four suppliers' remote MCP servers. The agent currently calls the Claude API directly and must move to Claude on a cloud platform this quarter. Finance also wants to reduce running costs by a third.",
		[
			{
				id: "PDF-10.1",
				domain: "D2",
				question:
					"The agent uses prompt caching, tools on four remote MCP servers, and a beta context-management feature. A colleague suggests changing the endpoint and credentials on Friday evening and watching dashboards over the weekend. Which migration plan is most appropriate?",
				options: [
					"Run both platforms permanently and alternate each request between them.",
					"Check feature availability, evaluate behavior on the target, and shift traffic gradually with a rollback path.",
					"Postpone the move until every feature is identical across both platforms.",
					"Change the endpoint on Friday and roll back on Monday if tenants complain.",
				],
				correctAnswers: [1],
				explanation:
					"The same model may differ across platforms in feature availability, beta access, quotas, and latency. Inventory dependencies, evaluate the target, and shift traffic in stages with a way to roll back.",
				whyNot:
					"A doubles operational effort and splits caches without a reason. C may never be possible and ignores the deadline. D uses tenants as the test and discovers missing features in production.",
				source: practiceSource,
			},
			{
				id: "PDF-10.2",
				domain: "D2",
				question:
					"The plumbing network's MCP server stops responding. The harness connects to all four servers at session start and waits for each, so every conversation hangs for 90 seconds and then fails, including lease questions. The outage lasts four hours. How should the harness change?",
				options: [
					"Increase the connection timeout to five minutes.",
					"Remove the plumbing integration permanently.",
					"Retry the plumbing server until it succeeds before starting any session.",
					"Apply a short timeout per server, start with available tools, and tell tenants what is unavailable.",
				],
				correctAnswers: [3],
				explanation:
					"An optional dependency should fail independently. Bounded connection attempts and a reduced tool set keep other work available, while the agent can state that plumbing bookings are temporarily unavailable.",
				whyNot:
					"A lengthens the wait for everyone while the server is down. B removes a useful integration because of a temporary fault. C turns one supplier outage into an indefinite wait for every tenant.",
				source: practiceSource,
			},
			{
				id: "PDF-10.3",
				domain: "D2",
				question:
					"Load testing shows throttling on the cloud platform at about 40% of current Claude API traffic. The team assumed rate limits would carry over. Cutover is in nine days, and evening traffic is three times daytime demand. What should the team do?",
				options: [
					"Move every conversation to the asynchronous Message Batches API.",
					"Cut over and rely on retries with backoff to absorb throttling.",
					"Halve the system prompt to use fewer tokens per minute.",
					"Measure peak demand and secure matching quota before cutover.",
				],
				correctAnswers: [3],
				explanation:
					"Quotas belong to the platform and account. Size real peak demand, request the needed quota early, and make confirmed capacity a condition of cutover rather than planning to queue tenants at peak.",
				whyNot:
					"A is asynchronous and does not fit live conversations. B accepts a known capacity gap. C may reduce demand slightly but leaves the gap unmeasured and risks behavior changes.",
				source: practiceSource,
			},
			{
				id: "PDF-10.4",
				domain: "D1",
				question:
					"At 11 pm a tenant reports a strong smell of gas. The agent asks clarifying questions, searches for plumbers, and offers a morning appointment. Company procedure requires gas, fire, and flooding reports to reach the 24-hour emergency line immediately with safety instructions. Which design best meets the procedure?",
				options: [
					"Ask every tenant at the start of every conversation whether the request is an emergency.",
					"Add the procedure to the system prompt and trust the agent to follow it.",
					"Detect emergency categories before the agent loop, test paraphrases and false negatives, and provide safety instructions plus a safe human fallback to the emergency line.",
					"Give the agent a tool that books an emergency plumber faster.",
				],
				correctAnswers: [2],
				explanation:
					"A deterministic route is appropriate for a known, high-consequence procedure, but a keyword check alone can miss paraphrases. Test varied wording and false negatives, and route uncertain cases to a safe human fallback with the required instructions.",
				whyNot:
					"A adds friction and still depends on the response being handled correctly. B leaves a safety-critical path to probabilistic behavior. D speeds up the wrong response when the procedure requires human escalation.",
				source: practiceSource,
			},
			{
				id: "PDF-10.5",
				domain: "D6",
				question:
					"A typical maintenance booking takes 11 model turns. The agent calls tenant, property, lease, and request tools one at a time, then searches for tradespeople and checks each candidate separately. Cost per conversation fell 5% last month while cost per completed booking rose. Which combination best addresses cost?",
				options: [
					"Consolidate lookups into fewer tools and report cost per completed booking.",
					"Reduce the turn limit to six and continue reporting cost per conversation.",
					"Cache tenant messages and report total monthly spend.",
					"Move to the smallest model and report cost per token.",
				],
				correctAnswers: [0],
				explanation:
					"Each round trip resends growing context, so fewer, richer tools can reduce turns and tokens. Measure cost per successful outcome: a cheaper conversation that fails to book is not a saving.",
				whyNot:
					"B can cut off bookings and keeps a misleading metric. C caches content that does not repeat and reports no unit of value. D can increase failures and measures a unit the business does not buy.",
				source: practiceSource,
			},
		],
	),
];
