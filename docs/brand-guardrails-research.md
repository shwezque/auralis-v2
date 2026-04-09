# Brand Guardrails Research

Last updated: 2026-03-30

This note summarizes the primary-source research used to harden the voice-agent prompts in `src/lib/brands.js`.

## Design Principles

- Keep prompts strong on scope, uncertainty handling, and escalation.
- Avoid brittle "memorized" details that can change often, such as prices, promos, schedules, branch contacts, and hotline numbers.
- Prefer stable truths about products, workflows, and support boundaries.
- Treat account-specific, payment-specific, and operationally current information as verification-required.

## Rajah Travel

What informed the prompt:

- Rajah Travel's own site presents the company as a long-established Philippine travel agency with broad services including flights, hotels, cruises, tours, destinations, and travel insurance.
- Rajah is positioned strongly around premium and guided travel brands including Insight Vacations, Contiki, Luxury Gold, Uniworld, Silversea, Norwegian Cruise Line, Rocky Mountaineer, and Club Med.
- Internal brand positioning for this prototype focuses Rajah most strongly around Europe travel from the Philippines, which makes a narrow Europe-first guardrail appropriate for the demo agent.

Prompt implications:

- Make Europe the sharpest area of expertise.
- Allow broader travel knowledge, but redirect non-Europe requests back to Rajah's strongest positioning.
- Never allow the model to invent live package prices, schedules, visa fees, or availability.
- Keep the agent strong at recommendation, trip-shaping, and travel-planning judgment.

Sources:

- https://www.rajahtravel.com/aboutus/awards.html

## Jollibee

What informed the prompt:

- Jollibee Philippines' official menu confirms stable core products such as Chickenjoy, Jolly Spaghetti, Burger Steak, Peach Mango Pie, and family meals.
- Jollibee Help Center guidance states that confirmed delivery orders generally cannot be broadly modified in-platform, though minor adjustments may be possible through the serving store at its discretion.
- Immediate orders may be canceled only before the store starts preparation, while scheduled orders generally cannot be canceled through the normal flow.

Prompt implications:

- Keep the agent useful for menu guidance, ordering, delivery, pickup, tracking, cancellation, and payment-related triage.
- Make the agent very careful not to promise refunds, compensation, modifications, or branch-specific outcomes.
- Treat food safety, allergy, injury, fraud, and repeat payment issues as escalation cases.
- Avoid exact promo, stock, and price claims without live confirmation.

Sources:

- https://www.jollibee.com.ph/menu/family-meals/
- https://help.jollibee.com.ph/hc/en-us/articles/12485384467215-How-to-modify-or-cancel-my-orders

## Globe Telecom

What informed the prompt:

- Globe's official site positions GlobeOne as a core self-service app and support surface.
- Globe Help content on SIM replacement shows that different scenarios have different workflows: damaged SIM, lost SIM, physical-to-eSIM change, and 5G SIM upgrades.
- Globe's official help materials make clear that many actions require eligibility checks, verification, GlobeOne flows, or store support.
- Postpaid help content emphasizes bill understanding, account changes, and official payment channels rather than informal support promises.

Prompt implications:

- The agent should be strong at triage and plain-language explanation, but never pretend to access accounts or network tools.
- Billing explanations are allowed at a general level, but charge validation must be framed as verification-required.
- Lost SIM, fraud, unauthorized charges, and SIM-swap-like issues should be treated as high-risk escalation cases.
- Roaming, plan prices, promos, and store-specific details should be treated as live-confirmation topics.

Sources:

- https://www.globe.com.ph/
- https://www.globe.com.ph/help/sim-replacement.html
- https://www.globe.com.ph/help/postpaid?jsid=1432725815763

## Practical Prompting Rules Used

- Stable company truths are embedded directly.
- Current operational facts are explicitly marked as confirmation-required.
- Escalation categories are named clearly.
- The agent is told what it can help with, not only what it must avoid.
- Each brand prompt now includes:
  - primary goal
  - trusted knowledge
  - operating style
  - hard guardrails
  - uncertainty rules
  - success criteria
