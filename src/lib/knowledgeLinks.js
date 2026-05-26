import schoolsData from "../data/schools.json";
import universitiesData from "../data/universities.json";
import {
  universityMajorDataDisclaimer,
  universityOnlyMajorNotice,
} from "../data/prompts";

export function findUniversityBySchoolName(schoolName) {
  const normalizedName = String(schoolName ?? "").trim();

  return (
    universitiesData.universities.find(
      (university) => university.school === normalizedName,
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
    return {
      key: "linked",
      label: "已有关联专业数据",
      message: `已关联 ${relatedMajors.length} 条专业知识记录，仍需按各条记录的核验状态使用。`,
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
        label: "已有关联专业数据",
        message: `已关联 ${relatedMajors.length} 条专业记录，引用前需检查其专业数据状态。`,
      }
    : {
        label: "当前仅有院校基础信息",
        message: universityOnlyMajorNotice,
      };

  return `${status.label}：${status.message} ${universityMajorDataDisclaimer}`;
}
