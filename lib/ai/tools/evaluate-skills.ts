import { tool } from "ai";
import { z } from "zod";

function calculateWorkYears(graduationYear: number): number {
  const currentYear = new Date().getFullYear();
  return Math.max(0, currentYear - graduationYear);
}

function getExpectedSkillRange(workYears: number): { min: number; max: number } {
  if (workYears <= 1) {
    return { min: 5, max: 8 };
  }
  if (workYears <= 3) {
    return { min: 8, max: 12 };
  }
  if (workYears <= 5) {
    return { min: 12, max: 18 };
  }
  return { min: 18, max: 30 };
}

function calculateScore(
  skillCount: number,
  expectedRange: { min: number; max: number },
  workYears: number
): number {
  const baseScore = 5;
  const { min, max } = expectedRange;

  if (skillCount < min) {
    const deficit = min - skillCount;
    const penalty = Math.min(3, deficit * 0.5);
    return Math.max(5, baseScore - penalty);
  }

  if (skillCount >= min && skillCount <= max) {
    const ratio = (skillCount - min) / (max - min);
    return Math.min(10, baseScore + ratio * 5);
  }

  if (skillCount > max) {
    const excess = skillCount - max;
    if (excess <= 5) {
      return 10;
    }
    const penalty = Math.min(2, (excess - 5) * 0.2);
    return Math.max(8, 10 - penalty);
  }

  return baseScore;
}

function generateSuggestion(
  skillCount: number,
  expectedRange: { min: number; max: number },
  workYears: number
): string {
  const { min, max } = expectedRange;

  if (skillCount < min) {
    const deficit = min - skillCount;
    return `技能数量偏少（当前${skillCount}个，建议${min}-${max}个）。建议补充${deficit}个以上与工作年限相匹配的技能，可以包括：核心技术栈的深入应用、相关工具链、工程化实践等。`;
  }

  if (skillCount >= min && skillCount <= max) {
    return `技能数量合理（${skillCount}个），与${workYears}年工作经验相匹配。建议继续保持技能的深度和广度，并关注技能的实际应用深度。`;
  }

  if (skillCount > max) {
    const excess = skillCount - max;
    if (excess <= 5) {
      return `技能数量充足（${skillCount}个），略高于平均水平。建议重点突出核心技能和深度应用，避免技能列表过于冗长。`;
    }
    return `技能数量较多（${skillCount}个），可能显得过于宽泛。建议精简到${min}-${max}个核心技能，突出深度和实际应用能力，避免"了解"性质的技能。`;
  }

  return "技能评估完成，请根据实际情况优化技能列表。";
}

export const evaluateSkills = tool({
  description:
    "评估简历中的技能列表，根据毕业时间和技能数量给出评分（5-10分）和优化建议。评分规则：毕业时间越久，工作经验越多，技能应该越多、应用越深入。",
  inputSchema: z.object({
    graduationYear: z
      .number()
      .int()
      .min(1980)
      .max(2100)
      .describe("毕业年份（例如：2020）"),
    skills: z
      .array(z.string())
      .min(1)
      .describe("技能列表，字符串数组（例如：['JavaScript', 'React', 'TypeScript']）"),
  }),
  execute: async ({ graduationYear, skills }) => {
    const workYears = calculateWorkYears(graduationYear);
    const expectedRange = getExpectedSkillRange(workYears);
    const skillCount = skills.length;
    const score = calculateScore(skillCount, expectedRange, workYears);
    const suggestion = generateSuggestion(skillCount, expectedRange, workYears);

    console.log('[evaluateSkills tool] score...', score)

    return {
      score: Math.round(score * 10) / 10,
      suggestion,
    };
  },
});

