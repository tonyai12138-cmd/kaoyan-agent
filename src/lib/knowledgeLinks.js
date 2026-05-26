import schoolsData from "../data/schools.json";
import universitiesData from "../data/universities.json";
import {
  schoolAliasMap,
  universityMajorDataDisclaimer,
  universityOnlyMajorNotice,
} from "../data/prompts";

export function expandSchoolAliases(value) {
  let normalizedValue = String(value ?? "").trim();

  Object.entries(schoolAliasMap)
    .flatMap(([school, aliases]) =>
      aliases.map((alias) => ({ alias, school })),
    )
    .sort((left, right) => right.alias.length - left.alias.length)
    .forEach(({ alias, school }) => {
      if (!normalizedValue.includes(school)) {
        normalizedValue = normalizedValue.replaceAll(alias, school);
      }
    });

  return normalizedValue;
}

export function findUniversityBySchoolName(schoolName) {
  const normalizedName = expandSchoolAliases(schoolName);

  return (
    universitiesData.universities.find(
      (university) => normalizedName.includes(university.school),
    ) ?? null
  );
}

export function findMajorKnowledgeByUniversity(universityId) {
  if (!universityId || universityId === "pending") {
    return [];
  }

  return schoolsData.schools.filter(
    (schoolMajor) => schoolMajor.universityId === universityId,
  );
}

export function getUniversityMajorStatus(university) {
  const relatedMajors = findMajorKnowledgeByUniversity(university?.id);

  if (relatedMajors.length) {
    const partialCount = relatedMajors.filter(
      (major) => major.professionalDataLevel === "partial",
    ).length;
    return {
      key: university?.majorDataStatus ?? "partial",
      label: "已有关联专业记录",
      message: `已关联 ${relatedMajors.length} 条专业知识记录，其中 ${partialCount} 条为部分官方核验；仅可引用各记录中明确核验的字段。`,
      relatedMajors,
    };
  }

  return {
    key: university?.majorDataStatus ?? "none",
    label: "当前仅有院校基础信息",
    message: universityOnlyMajorNotice,
    relatedMajors: [],
  };
}

export function buildUniversityMajorSummary(university, relatedMajors = []) {
  const status = relatedMajors.length
    ? {
        label: "已有关联专业记录",
        message: `已关联 ${relatedMajors.length} 条专业记录，引用前需检查字段核验状态与官方来源。`,
      }
    : {
        label: "当前仅有院校基础信息",
        message: universityOnlyMajorNotice,
      };

  return `${status.label}：${status.message} ${universityMajorDataDisclaimer}`;
}
