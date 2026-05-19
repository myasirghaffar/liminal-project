const trendDirection = (rows, key) => {
  const filtered = rows.filter((row) => row[key] != null);
  if (filtered.length < 2) return null;
  const last = filtered[filtered.length - 1][key];
  const prev = filtered[filtered.length - 2][key];
  if (last - prev > 0.3) return "up";
  if (last - prev < -0.3) return "down";
  return "flat";
};

const trendArrowLabel = (direction) => {
  if (direction === "up") return "Improving";
  if (direction === "down") return "Declining";
  if (direction === "flat") return "Steady";
  return "n/a";
};

export function buildAlerts({ totals, overall, byWeek, byLocation: _byLocation, byDepartment }) {
  const alerts = [];
  const participationPct = totals.participationPct;
  const overallE = overall.energy;
  const overallB = overall.belief;
  const overallC = overall.clarity;
  const overallAvg = overall.avg;
  const riskDepts = byDepartment.filter((dept) =>
    [dept.energy, dept.belief, dept.clarity].some((value) => value != null && value < 4.5)
  );
  const strongDepts = byDepartment.filter((dept) => dept.avg != null && dept.avg >= 7);

  if (totals.totalStaff > 0 && participationPct != null) {
    let summary;
    let flag;
    if (participationPct >= 60) {
      summary = `Participation is strong at ${participationPct}% of total staff. The data is reliable — use it with confidence.`;
      flag = "positive";
    } else if (participationPct >= 30) {
      summary = `Participation sits at ${participationPct}% of total staff. Enough to identify patterns but treat with caution. Low participation is itself a signal — disengaged staff are least likely to check in. The real picture may be worse.`;
      flag = "moderate";
    } else {
      summary = `Participation is critically low at ${participationPct}%. You're only hearing from the most engaged or most distressed people. Don't make major decisions from this data alone. Boosting participation must be the immediate priority.`;
      flag = "risk";
    }
    alerts.push({
      category: "Participation Rate",
      icon: "👥",
      flag,
      summary,
      recommendations: [
        participationPct < 60
          ? "Make check-in completion a standing agenda item in every team meeting — leaders actively asking drives response rates."
          : "Keep reinforcing why this check-in matters — people participate when they see it leads to action.",
        "Share back a summary of what the data is showing. People respond when they can see their input being used.",
        participationPct < 30
          ? "Make check-in completion a visible team commitment — not mandatory, but clearly valued by leadership."
          : "Recognise high-participation departments publicly to create positive peer pressure."
      ]
    });
  }

  if (overallAvg != null) {
    let summary;
    let flag;
    if (overallAvg >= 7) {
      summary = `Overall sentiment is strong at ${overallAvg.toFixed(1)}. People are broadly engaged — but don't mistake momentum for completion. Stage 1 and 2 work still needs to be held even when scores look healthy.`;
      flag = "positive";
    } else if (overallAvg >= 4.5) {
      summary = `Staff are in moderate territory (${overallAvg.toFixed(1)}) — the liminal space. The risk is assuming things are fine enough and skipping Stage 1 and 2 work. They're not fine enough yet. Keep holding the space.`;
      flag = "moderate";
    } else {
      summary = `Overall scores are at-risk (${overallAvg.toFixed(1)}). Staff haven't completed Stage 1 — they haven't Owned and Faced the loss. Attempting to Drive It now will backfire. Do the emotional groundwork first.`;
      flag = "risk";
    }
    alerts.push({
      category: "Overall Health",
      icon: "📊",
      flag,
      summary,
      recommendations:
        overallAvg < 7
          ? [
              "Hold a leadership debrief before any further change announcements.",
              overallAvg < 4.5
                ? "Pause Stage 3 activity until scores recover above 5.0."
                : "Don't skip Stage 2 — staff need difficult conversations and transparency, not just updates.",
              "Run a team reset: Own It, Face It, Feel It — before asking anyone to Ask It or Drive It."
            ]
          : [
              "Maintain your current communication cadence — it's working.",
              "Use high scores as evidence of psychological safety and encourage honest check-ins.",
              "Begin transitioning toward Stage 3: involve staff in co-creating solutions."
            ]
    });
  }

  if (overallB != null) {
    let summary;
    let flag;
    if (overallB >= 7) {
      summary = `Belief is at ${overallB.toFixed(1)} — staff broadly believe this change can succeed. The hardest score to move. Stage 1 work has created genuine buy-in.`;
      flag = "positive";
    } else if (overallB >= 4.5) {
      summary = `Belief sits at ${overallB.toFixed(1)}. Staff are on the fence. Belief is tied to Stage 1 completion — if people haven't processed the loss, they can't believe in the new direction. Difficult conversations are the lever, not another town hall.`;
      flag = "moderate";
    } else {
      summary = `Belief is critically low at ${overallB.toFixed(1)}. People have checked out from the possibility of success. This can't be fixed with a comms piece — it requires real conversations about what's been lost.`;
      flag = "risk";
    }
    alerts.push({
      category: "Belief 💪",
      icon: "💪",
      flag,
      summary,
      recommendations: [
        overallB < 4.5
          ? "Stop 'good news only' messaging immediately — it reads as tone-deaf."
          : "Share honest updates acknowledging what's hard, not just what's going well.",
        "Run structured difficult conversation sessions with team leaders — Face It before you Fix It.",
        overallB < 4.5
          ? "Bring in an external EI facilitator to run Stage 1 closure sessions."
          : "Ask staff: 'What would need to be true for you to fully believe in this change?' Then listen."
      ]
    });
  }

  if (overallC != null) {
    let summary;
    let flag;
    if (overallC >= 7) {
      summary = `Clarity is strong at ${overallC.toFixed(1)}. Staff understand what the change means for them personally — a Stage 2 win. Keep transparency high; clarity needs ongoing reinforcement.`;
      flag = "positive";
    } else if (overallC >= 4.5) {
      summary = `Clarity sits at ${overallC.toFixed(1)}. People are getting some of the picture but not all. Ambiguity creates anxiety. The Stage 2 mandate: more direction, not less.`;
      flag = "moderate";
    } else {
      summary = `Clarity is at ${overallC.toFixed(1)} — staff don't understand what this change means for them personally. When people can't see their place in the new world, they catastrophise. Radical transparency is the only way through.`;
      flag = "risk";
    }
    alerts.push({
      category: "Clarity 🎯",
      icon: "🎯",
      flag,
      summary,
      recommendations: [
        "Publish a 'What this means for you' one-pager per department — plain language, no jargon.",
        overallC < 4.5
          ? "Hold weekly 15-minute huddles where leaders answer questions honestly — no spin."
          : "Create a live FAQ updated in real time as decisions are made.",
        "Set a non-negotiable weekly update rhythm. Clarity drops when communication stops."
      ]
    });
  }

  if (overallE != null) {
    const direction = trendDirection(byWeek, "energy");
    const arrowLabel = trendArrowLabel(direction);
    let summary;
    let flag;
    if (overallE >= 7) {
      summary = `Energy is strong at ${overallE.toFixed(1)} and ${
        direction === "up"
          ? "continuing to climb"
          : direction === "down"
            ? "showing early dips — watch this"
            : "holding steady"
      }. Green light for Stage 3.`;
      flag = "positive";
    } else if (overallE >= 4.5) {
      summary = `Energy sits at ${overallE.toFixed(1)} — moderate but ${
        direction === "down"
          ? "declining, a warning sign"
          : direction === "up"
            ? "trending upward"
            : "flat"
      }. Staff are in the liminal space — not disengaged, not fully bought in.`;
      flag = "moderate";
    } else {
      summary = `Energy is at ${overallE.toFixed(1)} — low and needing immediate attention. People have lost faith or are exhausted from uncertainty. This is a Stage 2 problem.`;
      flag = "risk";
    }
    alerts.push({
      category: "Energy ⚡",
      icon: "⚡",
      flag,
      summary,
      recommendations: [
        overallE < 4.5
          ? "Schedule leadership walkthroughs this week — physical presence lifts energy faster than any email."
          : "Celebrate small wins publicly and tie them to the change journey.",
        overallE < 4.5
          ? "Identify 2–3 respected staff per site to act as informal change champions."
          : "Give staff a meaningful role in the next phase — energy follows ownership.",
        `Trend: ${arrowLabel}. ${
          direction === "down"
            ? "Act now before this becomes entrenched."
            : direction === "up"
              ? "Keep doing what's working."
              : "A shift in approach could break the flatline."
        }`
      ]
    });
  }

  if (riskDepts.length > 0) {
    alerts.push({
      category: "At-Risk Departments",
      icon: "⚠️",
      flag: "risk",
      summary: `${riskDepts.map((d) => d.name).join(", ")} ${
        riskDepts.length === 1 ? "is" : "are"
      } flagged at-risk. These teams are stuck in Stage 1 or early Stage 2. Pushing toward Stage 3 now will create resistance, disengagement, or quiet quitting.`,
      recommendations: [
        `Prioritise direct leadership contact with ${riskDepts[0].name}${
          riskDepts.length > 1 ? " and the other flagged teams" : ""
        } this week — not an email, an actual conversation.`,
        "Run a Stage 1 facilitated session: give people space to name what they're losing without judgment.",
        "Don't roll out Stage 3 milestones to at-risk teams until scores recover above 5.0.",
        "Consider peer support pairing — connect at-risk staff with colleagues from stronger teams."
      ]
    });
  }

  if (strongDepts.length > 0) {
    alerts.push({
      category: "High-Performing Teams",
      icon: "🌟",
      flag: "positive",
      summary: `${strongDepts.map((d) => d.name).join(", ")} ${
        strongDepts.length === 1 ? "is" : "are"
      } scoring strongly across all three metrics and ready to Drive It. Don't leave them waiting.`,
      recommendations: [
        "Identify change champions within these teams and give them a formal role supporting at-risk departments.",
        "Use these teams as pilot groups for Stage 3 initiatives — they'll build credible proof points.",
        "Acknowledge their engagement publicly. Recognition sustains momentum."
      ]
    });
  }

  const populatedWeeks = byWeek.filter((week) => week.n > 0);
  if (populatedWeeks.length >= 3) {
    const recent = populatedWeeks.slice(-3);
    const trend = (recent[2].avg ?? 0) - (recent[0].avg ?? 0);
    let summary;
    let flag;
    if (trend > 0.3) {
      summary = `Scores have climbed over the last three weeks (+${trend.toFixed(1)}). The CI model is working — keep Stage 2 support in place as you begin Stage 3. Don't pull the scaffolding down too early.`;
      flag = "positive";
    } else if (trend < -0.3) {
      summary = `Scores have declined over the last three weeks (${trend.toFixed(1)}). This signals a leadership or communication gap. Stage 2 structures need reinforcing urgently.`;
      flag = "risk";
    } else {
      summary = `Scores have been flat for three weeks. Plateau periods are common, but they signal that something needs to shift to create forward movement. This is a leadership intervention moment.`;
      flag = "moderate";
    }
    alerts.push({
      category: "Weekly Trend",
      icon: "📈",
      flag,
      summary,
      recommendations:
        trend < -0.3
          ? [
              "Review what changed in leadership activity or communication over the past three weeks.",
              "Re-engage Stage 2: are leaders still having difficult conversations and maintaining transparency?",
              "Consider external EI facilitation to reset the emotional temperature."
            ]
          : trend > 0.3
            ? [
                "Document what's working — it's repeatable and scalable.",
                "Use positive trend data in leadership comms to reinforce staff confidence.",
                "Begin planning Stage 3 rollout for highest-scoring teams."
              ]
            : [
                "Introduce a new engagement mechanism — a forum, a quick win, a feedback loop staff can see acted on.",
                "Ask staff directly what would shift their experience. Use the Ask It step and mean it.",
                "Check if the same leaders are driving all communication — a fresh voice can shift stale energy."
              ]
    });
  }

  return alerts;
}
